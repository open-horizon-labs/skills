---
name: review
description: Check work and detect drift before committing. A second opinion that catches misalignment early. Use at natural pause points, before PRs, or when something feels off.
---

# /review

A second opinion before committing. Checks alignment between intent and execution, detects drift, and decides: continue, adjust, or salvage.

Part of the **Intent → Execution → Review** loop at every scale — from a single commit to a multi-week project. Review closes the loop.

## When to Use

Invoke `/review` when: before committing, at natural pause points, something feels off, scope seems to have grown, or before PRs.

**Do not use when:** You're in deep flow and making progress. Review at natural breaks, not arbitrary intervals.

## Review Lenses

Default to the core workflow review in this file. When the artifact being reviewed needs a sharper domain lens, load the matching supporting reference:

- Code, PRs, technical plans, or implementation work: [references/code.md](references/code.md)
- Prose, documentation, essays, prompts, or release notes: [references/writing.md](references/writing.md)
- Tutorials, explanations, onboarding, or teaching behavior: [references/learning.md](references/learning.md)

Use these as lenses, not replacement workflows. The final review still answers the core `/review` questions: aim, alignment, sufficiency, mechanism, drift, completion, and next action.

## The Review Process

### Step 1: State the Original Aim

> "The aim was: [original intent in one sentence]"

If you can't state the aim clearly, that's the first finding.

### Step 2: Check Alignment

Ask five questions. Keep them artifact-neutral; load a review lens only when the artifact needs domain-specific judgment.

1. **Necessary?** — Does this still need to exist now, or did speculative work creep in?
2. **Aligned?** — Does the current work still serve the original aim?
3. **Sufficient?** — Is this enough for the aim without unnecessary scope, abstraction, or entanglement?
4. **Mechanism clear?** — Can you state why this approach should produce the intended outcome?
5. **Complete?** — Are promised characteristics, dependencies, verification, and handoff covered?

If RNA MCP is available, check work against guardrails (`oh_search_context` with `artifact_types: ["guardrail"]`) and declared outcomes (`outcome_progress`).

### Step 3: Detect Drift

Drift is the gap between where you started and where you are. Explicitly name any drift found:

**Scope Drift** — task grew beyond original boundaries
**Solution Drift** — approach changed from plan
**Goal Drift** — aim itself shifted without explicit decision

For each drift:
```
Drift: [type]
Started as: [original]
Became: [current]
Impact: [what this means]
```

### Step 4: Decide Next Action

| Decision | When | Action |
|----------|------|--------|
| **Continue** | Aligned, on track | Proceed with confidence |
| **Adjust** | Minor drift, recoverable | Correct course and continue |
| **Pause** | Unclear aim or major questions | Stop, clarify, then resume |
| **Salvage** | Significant drift, restart needed | Extract learning with `/salvage` |

If the review surfaces new hard constraints, record them (`oh_record_guardrail_candidate`).

## Output Format

```
## Review Summary

**Aim:** [original intent]
**Status:** [Continue / Adjust / Pause / Salvage]

### Alignment Check
- Necessary: [Yes/No - brief note]
- Aligned: [Yes/No - brief note]
- Sufficient: [Yes/No - brief note]
- Mechanism clear: [Yes/No - brief note]
- Changes complete: [Yes/No - brief note]

### Drift Detected
[List any drift found, or "None detected"]

### Needs Human Verification
Claims that cannot be self-checked by the model and require independent human judgment:
- [claim or assumption that needs external confirmation]
- [one-way decision that was not independently challenged]
- [delivered characteristic that was asserted but not externally observed]

If this section is empty, say why. Model-generated review of model-generated work shares the same blindspots. The purpose of this section is to route the right questions to the actual human checkpoint (PR review, stakeholder sign-off, manual test) rather than pretending the model can answer them.

### Decision
[Reasoning for the status decision]

### Next Steps
[Concrete actions to take]
```

## Completion Gate (Before "Done")

When the user or agent claims work is complete, verify:

1. **Intent clear?** — Can you state what changed and why in one sentence?
2. **Work reviewed?** — Has the actual artifact been checked against the stated intent?
3. **Evidence present?** — Are the relevant checks, examples, or observations recorded?
4. **Feedback handled?** — Have review comments or open objections been resolved or explicitly deferred?
5. **Declared criteria delivered?** — Were promised characteristics verified, not merely claimed?
6. **Needs Human Verification surfaced?** — Have claims the model cannot self-check been flagged for human attention?

If incomplete:
 > "Completion gate: [missing step]. Run the check before marking complete."

## Session Persistence

**Reads:** Aim, Problem Statement, Solution Space, Execute status, Ship status — essential for detecting drift and judging whether declared criteria were delivered.

**Writes:** Review assessment including contract verification:

```markdown
## Review
**Updated:** <timestamp>
**Verdict:** [ALIGNED | DRIFTED | BLOCKED]

[review findings, drift analysis, contract verification, recommendations]
```

## Position in Framework
**Comes after:** `/execute` (natural checkpoint after building).
**Leads to:** `/ship` if aligned, `/salvage` if drifted, back to `/aim` if fundamentals are unclear.
**This is the gate:** Review decides whether to continue, adjust, or restart.