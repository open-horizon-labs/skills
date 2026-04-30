# Code Review Lens

Use this lens when `/review` is evaluating code, technical plans, PRs, implementation work, or engineering workflow.

This lens supplements the core `/review` workflow. Do not replace the alignment, drift, and completion checks in `review/SKILL.md`; use these prompts to make the engineering-specific parts sharper.

## What to Watch For

### Intent Clarity
- Is the engineering goal clear enough to state in one sentence?
- Is this solving a real current problem, not speculative flexibility?
- Is there an X-Y problem: implementing requested solution Y when the actual need is X?

### Engineering Checks
1. **Necessary?** — Does this need to exist now?
2. **Beyond the nearest peak?** — Were alternatives explored, or is this defending the first workable solution?
3. **Sufficient?** — Would less code, fewer files, or an existing pattern solve it?
4. **Fits the goal?** — Is the work still on the critical path?
5. **Connected to Open Horizons?** — Does it improve the intended outcome, not merely produce internal output?

### Additional Signals
- **Motion vs. learning** — Is there a feedback loop proving the change works?
- **Mechanism clarity** — Can the author explain why this approach solves the problem?
- **Change completeness** — Are ripple effects handled: callers, fixtures, docs, persistence, installation, and verification?
- **Available capabilities** — Could existing tools, MCPs, hooks, or skills handle this better?
- **WIP management** — Is too much in flight for a coherent review?
- **Implementation scope** — Simple changes should not sprawl across many files without a reason.
- **Contract updates** — New fields, persistence changes, API changes, and migrations must update every affected caller, fixture, and doc.
- **Delivery readiness** — PR intent, automated checks, CI, and reviewer feedback belong in the code review evidence.

## How to Respond

Be specific and proportional:

> "This seems to add flexibility for future cases. Is that needed for the current aim, or can we solve only the present problem?"

> "The aim was X, but this diff now addresses Y. Is that intentional drift or should we split it?"

> "The mechanism is not clear yet. State why this change prevents the failure, then verify that exact path."

Avoid formal allow/block judgments. The core `/review` workflow decides continue, adjust, pause, or salvage; this lens supplies the engineering evidence for that decision.
