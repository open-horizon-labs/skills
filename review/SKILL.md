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

## The Review Process

### Step 1: State the Original Aim

> "The aim was: [original intent in one sentence]"

If you can't state the aim clearly, that's the first finding.

### Step 2: Check Alignment (Five Questions)

#### 1. Still Necessary?
Is this solving a real, current problem — not a hypothetical future one? Are we improving user value, or just producing internal output?

> If unnecessary work crept in: "This adds [X] which wasn't part of the original aim."

#### 2. Still Aligned?
Is the work pointed at the original aim, or did we drift to tangents?

Signs of drift: "While I'm at it…", refactoring unrelated code, solving problems the user didn't mention.

> If misaligned: "The aim was X, but current work addresses Y."

#### 3. Still Sufficient?
Could this be done with less code, fewer files, less abstraction? Are we building infrastructure for a one-off task?

- RED: 3+ files for simple feature; new patterns for one-offs
- YELLOW: proliferating Manager/Handler/Service classes
- GREEN: direct solution; one file when possible; reuses existing patterns

> If over-complex: "A simpler approach would work. Consider [alternative]."

#### 4. Mechanism Clear?
Can you articulate WHY this approach works? If the mechanism can't be stated simply, the problem may not be understood.

> If unclear: "What's the mechanism? Why will this solve the problem?"

#### 5. Changes Complete?
Are all ripple effects handled? New fields initialized everywhere? Persistence changes have migration paths? Contract changes updated in all callers? Declared success criteria carried through to deployment or verification where applicable?

> If incomplete: "This adds [X] but doesn't update [related site]."

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

### Decision
[Reasoning for the status decision]

### Next Steps
[Concrete actions to take]
```

## Examples

### Example 1: Clean Review (Continue)

```
/review

I've been working on the auth endpoint for 30 minutes.
```

**Output:**
```
## Review Summary

**Aim:** Add JWT validation to the /api/users endpoint
**Status:** Continue

### Alignment Check
- Necessary: Yes - endpoint currently accepts any request
- Aligned: Yes - implementing exactly what was specified
- Sufficient: Yes - using existing auth middleware, minimal new code
- Mechanism clear: Yes - middleware validates token, rejects invalid
- Changes complete: Yes - endpoint updated, tests added

### Drift Detected
None detected

### Next Steps
1. Run tests
2. Commit
3. Open PR
```

### Example 2: Drift Detected (Adjust)

```
/review

Started adding error handling to the API. Now I'm refactoring the logger.
```

**Output:**
```
## Review Summary

**Aim:** Improve error handling in /api/orders endpoint
**Status:** Adjust

### Alignment Check
- Necessary: Partially - error handling yes, logger refactor no
- Aligned: Drifted - logger refactor wasn't part of the aim
- Sufficient: Over-scoped - touching infrastructure for a single endpoint
- Mechanism clear: Yes for error handling, unclear for logger
- Changes complete: No - error handling incomplete

### Drift Detected
Drift: Scope Drift
Started as: Add try/catch and proper error responses to /api/orders
Became: Refactoring the entire logging system
Impact: Original task incomplete, unrelated system being modified

### Decision
Revert logger changes. Complete the original error handling task. If logger needs work, that's a separate task.

### Next Steps
1. `git stash` the logger changes
2. Complete error handling for /api/orders
3. Commit that work
4. If logger refactor is still needed, create separate task
```

## Completion Gate (Before "Done")

When the user or agent claims work is complete, verify:

1. **PR Intent Clear?** — Can you state what the PR delivers in one sentence?
2. **Changes Reviewed?** — Has the branch diff been reviewed against intent?
3. **CI Passing?** — Have automated checks been run and passed?
4. **Feedback Addressed?** — Have reviewer comments been resolved?
5. **Declared Criteria Delivered?** — Were the promised characteristics actually verified, not just claimed?
6. **User Value Improved?** — Is there evidence this change improves the intended user outcome rather than merely increasing output?

If incomplete:
 > "Completion gate: [missing step]. Run the check before marking complete."

## Session Persistence

This skill can persist context to `.oh/<session>.md`.

**If session name provided** (`/review auth-refactor`):
- Reads/writes `.oh/auth-refactor.md` directly

**If no session name provided** (`/review`):
- After producing the review summary, offer to save it

**Reading:** Check for existing session file. Read **Aim**, **Problem Statement**, **Solution Space**, **Execute** status, and **Ship** status if present — essential for detecting drift and judging whether declared criteria were actually delivered.

**Writing:** After review, write the assessment including whether the declared contract was preserved through execution/shipping:

```markdown
## Review
**Updated:** <timestamp>
**Verdict:** [ALIGNED | DRIFTED | BLOCKED]

[review findings, drift analysis, contract verification, recommendations]
```

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Produces review summary based on conversation context. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for aim, constraints, selected solution
- Compares actual work against session aim
- Writes review verdict and findings

### With git diff
- Compares actual changes against stated aim
- Detects file count, complexity signals
- Identifies incomplete changes

### With CI Integration
- Checks if tests pass before marking complete
- Verifies linting, type checking
- Confirms PR checks would pass

### With RNA MCP (repo-native-alignment)
- `oh_search_context("constraints for [area]", artifact_types: ["guardrail"])` to check against guardrails
- `outcome_progress` to check work against declared outcome
- `oh_record_guardrail_candidate` if the review surfaces new constraints

## Position in Framework
**Comes after:** `/execute` (natural checkpoint after building).
**Leads to:** `/ship` if aligned, `/salvage` if drifted, back to `/aim` if fundamentals are unclear.
**This is the gate:** Review decides whether to continue, adjust, or restart.

---

**Remember:** Review is not bureaucracy. It's the moment you catch drift before it compounds.