/**
 * OH Skills Phase-Aware Hook
 *
 * Makes the OH skills framework self-guiding at runtime by detecting
 * where you are in the development cycle and suggesting the right skill.
 *
 * Two signals drive recommendations:
 * 1. STATE  — which phases are complete in the active .oh/ session
 * 2. INTENT — what the prompt is asking for
 *
 * Optionally reads .oh/skills-config.json (written by teach-oh) for
 * project-specific customization.
 *
 * Install:
 *   - Auto-discovery: copy to ~/.omp/agent/hooks/ or .omp/hooks/
 *   - CLI: omp --hook path/to/oh-skills-phase.ts
 *   - Via teach-oh: /teach-oh offers to install during project setup
 */
import * as fs from "node:fs";
import * as path from "node:path";
import type { HookAPI } from "@oh-my-pi/pi-coding-agent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhaseConfig {
	/** Subset of OH skills relevant to this project (default: all) */
	projectSkills?: string[];
	/** Extra skills to suggest during specific phases */
	phaseOverrides?: Record<string, string[]>;
	/** Skills to never suggest */
	disabledSkills?: string[];
}

interface SessionPhase {
	activeSession: string | null;
	completedPhases: string[];
	lastPhase: string | null;
}

interface Recommendations {
	primary: string[];
	available: string[];
	phaseNote: string | null;
	note: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The main sequential flow */
const PHASE_ORDER = [
	"aim",
	"problem-space",
	"problem-statement",
	"solution-space",
	"execute",
	"ship",
] as const;

/** Cross-cutting skills available at any point */
const CROSS_CUTTING = ["review", "dissent", "salvage"] as const;

/** Section headers as they appear in .oh/ session files → skill name */
const SECTION_TO_SKILL: Record<string, string> = {
	"Aim": "aim",
	"Problem Space": "problem-space",
	"Problem Statement": "problem-statement",
	"Solution Space": "solution-space",
	"Execute": "execute",
	"Ship": "ship",
	"Review": "review",
	"Dissent": "dissent",
	"Salvage": "salvage",
};

/** Prompt patterns that signal intent toward a specific skill */
const INTENT_SIGNALS: Record<string, RegExp> = {
	"aim": /\b(goal|outcome|why are we|purpose|what are we trying|objective|success look)\b/i,
	"problem-space": /\b(constraint|terrain|map|what we know|blocker|assumption|trade.?off)\b/i,
	"problem-statement": /\b(reframe|the real problem|actually about|root cause|x-?y problem)\b/i,
	"solution-space": /\b(approach|option|candidate|trade.?off|how should we|compare|evaluate)\b/i,
	"execute": /\b(implement|build|write the|create the|add feature|do the work|start coding)\b/i,
	"ship": /\b(deploy|release|ship|publish|deliver|push to prod|npm publish)\b/i,
	"review": /\b(check|review|align|pause|before we commit|does this look|pr ready)\b/i,
	"dissent": /\b(risk|devil|stress.?test|what if|challenge|one.?way door|what could go wrong)\b/i,
	"salvage": /\b(stuck|drift|restart|scrap|not working|start over|pivot|going in circles)\b/i,
};

// ---------------------------------------------------------------------------
// Phase detection from .oh/ session files
// ---------------------------------------------------------------------------

async function detectPhaseFromSessions(cwd: string): Promise<SessionPhase> {
	const result: SessionPhase = {
		activeSession: null,
		completedPhases: [],
		lastPhase: null,
	};

	const ohDir = path.join(cwd, ".oh");
	if (!fs.existsSync(ohDir)) return result;

	// Find session markdown files
	let files: string[];
	try {
		files = fs.readdirSync(ohDir).filter((f) => f.endsWith(".md"));
	} catch {
		return result;
	}
	if (files.length === 0) return result;

	// Use the most recently modified session file
	let latest = { name: "", mtime: 0 };
	for (const f of files) {
		try {
			const stat = fs.statSync(path.join(ohDir, f));
			if (stat.mtimeMs > latest.mtime) {
				latest = { name: f, mtime: stat.mtimeMs };
			}
		} catch {
			// skip unreadable files
		}
	}

	if (!latest.name) return result;

	result.activeSession = latest.name.replace(/\.md$/, "");

	let content: string;
	try {
		content = fs.readFileSync(path.join(ohDir, latest.name), "utf-8");
	} catch {
		return result;
	}

	// Detect which phases have been written by looking for ## Section headers
	for (const [section, skill] of Object.entries(SECTION_TO_SKILL)) {
		if (content.includes(`## ${section}`)) {
			result.completedPhases.push(skill);
			result.lastPhase = skill;
		}
	}

	return result;
}

// ---------------------------------------------------------------------------
// Intent detection from prompt text
// ---------------------------------------------------------------------------

function detectIntent(prompt: string): string[] {
	return Object.entries(INTENT_SIGNALS)
		.filter(([, re]) => re.test(prompt))
		.map(([skill]) => skill);
}

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

function computeRecommendations(
	phase: SessionPhase,
	intentSignals: string[],
	config: PhaseConfig,
): Recommendations {
	const disabled = new Set(config.disabledSkills ?? []);
	const allowed = config.projectSkills
		? new Set(config.projectSkills)
		: null; // null = all allowed
	const isAllowed = (s: string) =>
		!disabled.has(s) && (allowed === null || allowed.has(s));

	// If user is already invoking a skill explicitly, don't inject noise
	// (skill invocations start with / and the skill name)

	// If intent signals are clear, honor them
	if (intentSignals.length > 0) {
		const primary = intentSignals.filter(isAllowed).slice(0, 2);

		// Add phase overrides if configured
		const extras: string[] = [];
		if (config.phaseOverrides) {
			for (const skill of primary) {
				const overrides = config.phaseOverrides[skill];
				if (overrides) {
					extras.push(...overrides.filter(isAllowed));
				}
			}
		}

		return {
			primary: [...new Set([...primary, ...extras])],
			available: [...CROSS_CUTTING]
				.filter((s) => !intentSignals.includes(s))
				.filter(isAllowed),
			phaseNote: phase.lastPhase
				? `Session "${phase.activeSession}" — last phase: ${phase.lastPhase}`
				: null,
			note: null,
		};
	}

	// No intent signals — recommend based on session state

	if (!phase.activeSession) {
		// No session at all
		return {
			primary: ["aim"].filter(isAllowed),
			available: ["teach-oh"].filter(isAllowed),
			phaseNote: "No active .oh/ session",
			note: "Consider /aim <session-name> to establish intent, or /teach-oh for project setup",
		};
	}

	// Find next phase in the sequential flow
	const lastIdx = phase.lastPhase
		? PHASE_ORDER.indexOf(phase.lastPhase as (typeof PHASE_ORDER)[number])
		: -1;

	if (lastIdx === -1) {
		// Last phase isn't in the main sequence (e.g., review/dissent/salvage)
		// Suggest continuing the main flow from where it left off
		const mainCompleted = phase.completedPhases.filter((p) =>
			(PHASE_ORDER as readonly string[]).includes(p),
		);
		const furthest = mainCompleted.length > 0
			? PHASE_ORDER.indexOf(mainCompleted[mainCompleted.length - 1] as (typeof PHASE_ORDER)[number])
			: -1;
		const nextIdx = furthest + 1;

		if (nextIdx < PHASE_ORDER.length) {
			return {
				primary: [PHASE_ORDER[nextIdx]!].filter(isAllowed),
				available: [...CROSS_CUTTING].filter(isAllowed),
				phaseNote: `Session "${phase.activeSession}" — completed: ${phase.completedPhases.join(", ")}`,
				note: null,
			};
		}
	}

	const nextIdx = lastIdx + 1;

	if (nextIdx < PHASE_ORDER.length) {
		const next = PHASE_ORDER[nextIdx]!;
		return {
			primary: [next].filter(isAllowed),
			available: [...CROSS_CUTTING].filter(isAllowed),
			phaseNote: `Session "${phase.activeSession}" — completed: ${phase.completedPhases.join(", ")}`,
			note: null,
		};
	}

	// All main phases complete
	return {
		primary: ["review"].filter(isAllowed),
		available: ["ship", "dissent"].filter(isAllowed),
		phaseNote: `Session "${phase.activeSession}" — all phases complete`,
		note: "Ready for final review before shipping",
	};
}

// ---------------------------------------------------------------------------
// Hook entry point
// ---------------------------------------------------------------------------

export default function (pi: HookAPI) {
	let config: PhaseConfig = {};

	// Load project-specific config on session start
	pi.on("session_start", async (_event, ctx) => {
		try {
			const configPath = path.join(ctx.cwd, ".oh", "skills-config.json");
			const data = fs.readFileSync(configPath, "utf-8");
			config = JSON.parse(data) as PhaseConfig;
			pi.logger.info("[oh-skills-phase] Loaded config from .oh/skills-config.json");
		} catch {
			// No config file = use defaults, which is fine
			config = {};
		}
	});

	pi.on("before_agent_start", async (event, ctx) => {
		const prompt = event.prompt;

		// Don't inject recommendations when user is explicitly invoking a skill
		if (/^\s*\/\w/.test(prompt)) {
			return undefined;
		}

		// 1. Detect STATE from .oh/ session files
		const phase = await detectPhaseFromSessions(ctx.cwd);

		// 2. Detect INTENT from prompt
		const intentSignals = detectIntent(prompt);

		// 3. Compute recommendations
		const rec = computeRecommendations(phase, intentSignals, config);

		// Skip injection when there's nothing useful to say
		if (rec.primary.length === 0 && !rec.phaseNote && !rec.note) {
			return undefined;
		}

		// Build the context block
		const lines = ["<oh-phase-context>"];

		if (rec.phaseNote) {
			lines.push(`PHASE: ${rec.phaseNote}`);
		}
		if (rec.primary.length > 0) {
			lines.push(
				`SUGGESTED: ${rec.primary.map((s) => `/${s}`).join(", ")}`,
			);
		}
		if (rec.available.length > 0) {
			lines.push(
				`ALSO AVAILABLE: ${rec.available.map((s) => `/${s}`).join(", ")}`,
			);
		}
		if (rec.note) {
			lines.push(`NOTE: ${rec.note}`);
		}

		lines.push("</oh-phase-context>");

		// Update status bar
		if (ctx.hasUI && rec.primary.length > 0) {
			const theme = ctx.ui.theme;
			ctx.ui.setStatus(
				"oh-phase",
				theme.fg("accent", `/${rec.primary[0]}`) +
					theme.fg("muted", " phase"),
			);
		}

		return {
			message: {
				customType: "oh-phase-context",
				content: lines.join("\n"),
				display: true,
			},
		};
	});
}
