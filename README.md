# Open Horizons Skills

Nine skills that ground your AI agents in strategic context.

Agents thrash without context. They talk themselves out of constraints, accelerate the wrong things, and lose everything when the session ends. These skills fix that: frame the problem before solving it, capture learning that persists, ship outcomes instead of just outputs.

[See the full framework](https://openhorizonlabs.ai/for-builders.html) or just install and start using them.

## Installation

```bash
npx skills add open-horizon-labs/skills -g -a claude-code -y
```

Re-run the install command to pull the latest version.

## The Framework

10 commands that form the language of strategic execution:

### Setup (When starting or when aims shift)

| Skill | Description |
|-------|-------------|
| `/teach-oh` | Project setup. Explore codebase, ask about strategy/aims/reviewers/practices, write context to AGENTS.md |

### Grounding (Understand the problem)

| Skill | Description |
|-------|-------------|
| `/aim` | Clarify the outcome you want—a change in behavior, not a feature |
| `/problem-space` | Map what we're optimizing and what constraints we treat as real |
| `/problem-statement` | Define the framing. Change the statement, change the solution space |

### Execution (Build & ship)

| Skill | Description |
|-------|-------------|
| `/solution-space` | Explore candidate solutions. Band-aid, optimize, reframe, or redesign? |
| `/execute` | Do the work. Pre-flight, build, detect drift, salvage if needed |
| `/ship` | Deliver to users. Optimize the path from code to working install |

### Reflection (Capture learning)

| Skill | Description |
|-------|-------------|
| `/review` | Check work and detect drift. A second opinion before committing |
| `/dissent` | Devil's advocate. Seek contrary evidence before locking in |
| `/salvage` | Extract learning before restarting. Code is a draft; learning is the asset |
| `/distill` | Curate accumulated metis across sessions. Surface patterns, promote to guardrails, compact noise |

## The Loop

```
Intent (aim, problem-space, problem-statement)
    │
    ▼
Execution (solution-space, execute, ship)
    │
    ▼
Review (review, dissent)
    │
    ▼ (if drift detected)
SALVAGE ──► back to Problem Space with new understanding

Periodically (between sessions):
DISTILL ──► curate accumulated metis, promote patterns to guardrails
```
### Workflow Contracts

The workflow is strongest when each phase leaves behind explicit fields the next phase can reuse rather than re-inferring them from prose. In practice, the core carry-forward contract is:
- `/aim` defines the user-value outcome, mechanism, assumptions, feedback signal, and guardrails
- `/problem-space` makes constraints, hidden assumptions, and open questions explicit
- `/problem-statement` sharpens the framing and names what would invalidate it
- `/solution-space` selects an approach, defines the scoring function, accepted trade-offs, and the execution contract
- `/execute` preserves declared success criteria and delivered characteristics
- `/ship` verifies those characteristics in the target environment
- `/review` judges the result against the original aim, user outcome, and declared contract
Across the tree, each artifact should satisfy necessity, viability, sufficiency, and connectedness: why this exists, why this path can work, why it is enough for now, and how it connects to the level above and below.

Every step should pair a strategy (`what` and `why`) with a tactic (`how`). Tactics that do not ladder back to a parent objective are busy work; objectives without tactics are wishful thinking.

Phase shifts should be treated as commitment decisions, not momentum. Moving from exploration to execution means stating why you're ready to deepen, what would invalidate the current direction, and what should trigger a stop or pivot.

Context should privilege situated metis over generic advice. Persist the non-obvious lessons, constraints, and local patterns your experience adds; foundational-model knowledge that adds no local leverage is noise and pollutes the context space.

## Adaptive Skills

Each skill works at multiple levels:

1. **Base** - Works with just the prompt (no dependencies)
2. **With .oh/ session** - Reads/writes `.oh/<session>.md` for context handoff between skills
3. **With [RNA MCP](https://github.com/open-horizon-labs/repo-native-alignment)** - Semantic code search (`search_symbols`), graph traversal (`graph_query`), outcome-to-code joins (`outcome_progress`), and business context (`oh_search_context`). Skills automatically use RNA tools when available — e.g., `/execute` uses `search_symbols` instead of Grep, `/review` checks `outcome_progress` for drift, `/distill` queries accumulated metis via `oh_search_context`
4. **With [OH MCP](https://github.com/cloud-atlas-ai/oh-mcp-server)** - Full integration with Open Horizons organizational graph (aims, missions, endeavors, decision logs across projects)

### Session Persistence

Skills can share context via session files. When invoked without a session name, skills will offer to save:

```
> Save to session? [auth-refactor] [custom] [skip]
```

The suggested name is derived from the current git branch. You can also provide a session name explicitly:

```bash
/aim auth-refactor           # Creates .oh/auth-refactor.md
/problem-statement auth-refactor  # Reads aim, writes problem statement
/solution-space auth-refactor     # Reads aim + problem statement, writes solution
```

Name sessions meaningfully: PR numbers (`PR-123`), feature names (`auth-refactor`), or any identifier.

## Phase-Aware Hook (OMP)

For [oh-my-pi](https://github.com/anthropics/oh-my-pi) users, an optional hook makes the framework self-guiding at runtime. Instead of remembering which skill to invoke, the hook detects where you are in the development cycle and suggests the right one.

**How it works:**
1. Reads your `.oh/` session files to detect completed phases (state — primary signal)
2. Scans your prompt for intent signals (enrichment — used when state is ambiguous)
3. Injects a `<oh-phase-context>` block recommending the next skill
4. Deduplicates — only injects when the recommendation changes

**Install manually:**

```bash
mkdir -p .omp/hooks
cp hooks-omp/oh-skills-phase.ts .omp/hooks/
```

**Or via `/teach-oh`:** The teach-oh skill offers to install and configure the hook during project setup, including a `.oh/skills-config.json` for project-specific customization.

**Configuration** (`.oh/skills-config.json`, optional):

```json
{
  "projectSkills": ["aim", "solution-space", "execute", "review", "dissent"],
  "disabledSkills": [],
  "phaseOverrides": {
    "execute": ["dissent"]
  }
}
```

- `projectSkills` — limit which skills get suggested (default: all)
- `disabledSkills` — skills to never suggest
- `phaseOverrides` — extra skills to suggest during specific phases

Config is loaded once at session start. Changes require restarting OMP.

The hook is entirely optional. Skills work the same with or without it.

> **Note:** This hook requires the OMP hook API (`@oh-my-pi/pi-coding-agent`). It is a TypeScript module that OMP loads at runtime — it cannot be compiled or tested independently within this repo. It lives here alongside the skills it serves, but its runtime home is `.omp/hooks/`.

## Phase Agents (OMP)

Pre-built agent wrappers in `agents-omp/` give each phase its own isolated context and scoped tools. Install via `/teach-oh` or manually copy to `.omp/agents/`:

```bash
mkdir -p .omp/agents
cp agents-omp/oh-*.md .omp/agents/
```

When agents are installed, the phase-aware hook automatically switches from suggesting `/skill` commands to suggesting agent dispatch.

## Learn More

- [Open Horizons Website](https://openhorizonlabs.ai)
- [Framework Documentation](https://openhorizonlabs.ai/for-builders.html)
- [Skills Reference](https://openhorizonlabs.ai/skills.html)

## License

MIT
