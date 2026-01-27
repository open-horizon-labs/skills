# Open Horizons Skills

Agent skills for the Open Horizons strategic execution framework.

## Installation

```bash
npx skills add open-horizon-labs/skills
```

Or install specific skills:

```bash
npx skills add open-horizon-labs/skills --skill aim --skill salvage
```

## Updating

Re-run the install command to pull the latest version:

```bash
npx skills add open-horizon-labs/skills -g -a claude-code -y
```

> **Tip:** Skills are updated frequently. Re-run this after pulling framework updates.

## The Framework

9 commands that form the language of strategic execution:

### Grounding (Understand the problem)

| Skill | Description |
|-------|-------------|
| `/aim` | Clarify the outcome you want—a change in behavior, not a feature |
| `/problem-statement` | Define the framing. Change the statement, change the solution space |
| `/problem-space` | Map what we're optimizing and what constraints we treat as real |

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
3. **With .wm/** - Reads/writes working memory for persistence
4. **With OH MCP** - Full integration with Open Horizons graph database

### Session Persistence

Skills can share context via session files:

```bash
/aim feature-auth           # Creates .oh/feature-auth.md
/problem-statement feature-auth  # Reads aim, writes problem statement
/solution-space feature-auth     # Reads aim + problem statement, writes solution
```

Name sessions meaningfully: PR numbers (`PR-123`), feature names (`feature-auth`), or any identifier.

## Learn More

- [Open Horizons Website](https://open-horizon-labs.github.io/web/)
- [Framework Documentation](https://open-horizon-labs.github.io/web/for-builders.html)
- [Command Reference](https://open-horizon-labs.github.io/web/commands.html)

## License

MIT
