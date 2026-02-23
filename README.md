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
```

## Adaptive Skills

Each skill works at multiple levels:

1. **Base** - Works with just the prompt (no dependencies)
2. **With .oh/ session** - Reads/writes `.oh/<session>.md` for context handoff between skills
3. **With OH MCP** - Full integration with Open Horizons graph database

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
1. Reads your `.oh/` session files to detect completed phases (state)
2. Scans your prompt for intent signals (intent)
3. Injects a `<oh-phase-context>` block recommending the next skill

**Install manually:**

```bash
cp hooks-omp/oh-skills-phase.ts .omp/hooks/
```

**Or via `/teach-oh`:** The teach-oh skill offers to install and configure the hook during project setup, including a `.oh/skills-config.json` for project-specific customization.

**Configuration** (`.oh/skills-config.json`, optional):

```json
{
  "projectSkills": ["aim", "solution-space", "execute", "review"],
  "disabledSkills": ["ship"],
  "phaseOverrides": {
    "execute": ["dissent"]
  }
}
```

- `projectSkills` — limit which skills get suggested (default: all)
- `disabledSkills` — skills to never suggest
- `phaseOverrides` — extra skills to suggest during specific phases

The hook is entirely optional. Skills work the same with or without it.

## Learn More

- [Open Horizons Website](https://openhorizonlabs.ai)
- [Framework Documentation](https://openhorizonlabs.ai/for-builders.html)
- [Skills Reference](https://openhorizonlabs.ai/skills.html)

## License

MIT
