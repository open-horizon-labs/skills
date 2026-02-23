/**
 * OH Skills Phase-Aware Hook (OMP-specific)
 *
 * Makes the OH skills framework self-guiding at runtime by detecting
 * where you are in the development cycle and suggesting the right skill.
 *
 * Two signals drive recommendations (state is primary):
 * 1. STATE  — which phases are complete in the active .oh/ session (primary)
 * 2. INTENT — prompt keywords as enrichment when state is ambiguous
 *
 * Optionally reads .oh/skills-config.json (written by teach-oh) for
 * project-specific customization. Config is loaded once at session start.
 *
 * Install:
 *   - Auto-discovery: copy to ~/.omp/agent/hooks/ or .omp/hooks/
 *   - CLI: omp --hook path/to/oh-skills-phase.ts
 *   - Via teach-oh: /teach-oh offers to install during project setup
 *
 * This file lives in the skills repo alongside the skills it serves, but
 * depends on OMP's hook API at runtime. It cannot be compiled or tested
 * independently — its runtime home is .omp/hooks/.
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

/**
 * Section headers as they appear in .oh/ session files → skill name.
 * Matched with anchored regex (^## Name$) to avoid false positives from
 * substrings (e.g., "## Aim Statement") or content inside code blocks.
 */
const SECTION_PATTERNS: Array<{ pattern: RegExp; skill: string }> = [
	{ pattern: /^## Aim\s*$/m, skill: "aim" },
	{ pattern: /^## Problem Space\s*$/m, skill: "problem-space" },
	{ pattern: /^## Problem Statement\s*$/m, skill: "problem-statement" },
	{ pattern: /^## Solution Space\s*$/m, skill: "solution-space" },
	{ pattern: /^## Execute\s*$/m, skill: "execute" },
	{ pattern: /^## Ship\s*$/m, skill: "ship" },
	{ pattern: /^## Review\s*$/m, skill: "review" },
	{ pattern: /^## Dissent\s*$/m, skill: "dissent" },
	{ pattern: /^## Salvage\s*$/m, skill: "salvage" },
];

/**
 * Prompt patterns that signal intent toward a specific skill.
 * These are used as enrichment when session state is ambiguous — not as
 * primary signal. Multi-word phrases are preferred over single words to
 * reduce false positives (e.g., "check the tests" should not suggest /review).
 */
const INTENT_SIGNALS: Record<string, RegExp> = {
	"aim": /\b(clarify the goal|define the outcome|why are we|what are we trying to achieve|success look)\b/i,
	"problem-space": /\b(map the constraints|what constraints|what we know about|what assumptions)\b/i,
	"problem-statement": /\b(reframe the problem|the real problem|x-?y problem|problem is actually)\b/i,
	"solution-space": /\b(explore approaches|compare options|candidate solutions|evaluate trade.?offs|how should we approach)\b/i,
	"execute": /\b(start coding|do the work|implement this|build this|start building)\b/i,
	"ship": /\b(deploy this|push to prod|ship this|release this|publish this)\b/i,
	"review": /\b(review this|check alignment|before we commit|does this look right|pr ready)\b/i,
	"dissent": /\b(devil.?s advocate|stress.?test|one.?way door|what could go wrong|challenge this)\b/i,
	"salvage": /\b(going in circles|start over|not working at all|scrap this|extract the learning)\b/i,
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

	// Detect which phases have been written by matching anchored ## headers.
	// Only matches exact "## Name" on its own line — not substrings or code blocks.
	for (const { pattern, skill } of SECTION_PATTERNS) {
		if (pattern.test(content)) {
			result.completedPhases.push(skill);
		}
	}

	// Compute lastPhase as the furthest completed phase in PHASE_ORDER,
	// not the last-iterated match. Cross-cutting skills (review, dissent,
	// salvage) don't count — they can happen at any point.
	let furthestIdx = -1;
	for (const phase of result.completedPhases) {
		const idx = (PHASE_ORDER as readonly string[]).indexOf(phase);
		if (idx > furthestIdx) {
			furthestIdx = idx;
			result.lastPhase = phase;
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

/**
 * Compute skill recommendations.
 *
 * Priority order:
 *   1. STATE (session files) — most reliable, knows what's actually done
 *   2. INTENT (prompt keywords) — used as enrichment or tiebreaker, not override
 *
 * State is primary because it reflects reality. Intent is secondary because
 * keyword matching is ambiguous without context — "build a component" matches
 * "execute" intent, but if you haven't aimed yet, /aim is what you need.
 */
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

	// --- No session: use intent as primary (it's all we have) ---

	if (!phase.activeSession) {
		// Intent can help differentiate "I want to start fresh" vs "quick question"
		const intentPrimary = intentSignals.filter(isAllowed).slice(0, 2);
		return {
			primary: intentPrimary.length > 0 ? intentPrimary : ["aim"].filter(isAllowed),
			available: ["teach-oh"].filter(isAllowed),
			phaseNote: "No active .oh/ session",
			note: intentPrimary.length === 0
				? "Consider /aim <session-name> to establish intent, or /teach-oh for project setup"
				: null,
		};
	}

	// --- Has session: state is primary ---

	const phaseNote = `Session "${phase.activeSession}" — completed: ${phase.completedPhases.join(", ") || "none"}`;

	// Find the next phase in the sequential flow
	const lastIdx = phase.lastPhase
		? PHASE_ORDER.indexOf(phase.lastPhase as (typeof PHASE_ORDER)[number])
		: -1;
	const nextIdx = lastIdx + 1;

	// Determine state-based recommendation
	let statePrimary: string[];
	let stateNote: string | null = null;

	if (nextIdx < PHASE_ORDER.length) {
		statePrimary = [PHASE_ORDER[nextIdx]!];
	} else {
		// All main phases complete
		statePrimary = ["review"];
		stateNote = "Ready for final review before shipping";
	}

	// Intent can enrich state recommendations in two ways:
	// 1. Cross-cutting skills (review/dissent/salvage) — always valid regardless of phase
	// 2. Agreement — if intent matches the state recommendation, confidence is higher
	const crossCuttingIntent = intentSignals.filter((s) =>
		(CROSS_CUTTING as readonly string[]).includes(s),
	);

	// Build primary: state recommendation + any cross-cutting intent signals
	const primary = [...new Set([...statePrimary, ...crossCuttingIntent])]
		.filter(isAllowed)
		.slice(0, 3);

	// Build available: remaining cross-cutting skills not already in primary
	const available = [...CROSS_CUTTING]
		.filter((s) => !primary.includes(s))
		.filter(isAllowed);

	// Add phase overrides if configured
	if (config.phaseOverrides) {
		for (const skill of primary) {
			const overrides = config.phaseOverrides[skill];
			if (overrides) {
				for (const extra of overrides) {
					if (isAllowed(extra) && !primary.includes(extra)) {
						primary.push(extra);
					}
				}
			}
		}
	}

	return {
		primary,
		available,
		phaseNote,
		note: stateNote,
	};
}

// ---------------------------------------------------------------------------
// Hook entry point
// ---------------------------------------------------------------------------

export default function (pi: HookAPI) {
	let config: PhaseConfig = {};
	let lastInjectedContent: string | null = null;

	// Load project-specific config once on session start.
	// Changes to skills-config.json require restarting OMP to take effect.
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

		const content = lines.join("\n");

		// Deduplicate: skip injection if recommendation is unchanged from last turn.
		// This avoids wallpaper — once you know you're in the execute phase,
		// you don't need to be told again every turn.
		if (content === lastInjectedContent) {
			return undefined;
		}
		lastInjectedContent = content;

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
				content,
				display: true,
			},
		};
	});
}
