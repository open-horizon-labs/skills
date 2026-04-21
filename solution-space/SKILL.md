---
name: solution-space
description: Explore candidate solutions before committing. Use when you have a problem statement and need to evaluate approaches - band-aid, optimize, reframe, or redesign.
---

# /solution-space

Explore candidate solutions before committing. The trap is defending the first workable idea.

Sits between Problem Statement and Implementation. You have the problem framed; now map approaches before picking one.

## When to Use

- **Problem is understood** — you have a clear problem statement
- **Multiple approaches viable** — not obvious which path is best
- **About to start coding** — pause and explore first
- **Patches accumulating** — third config flag for the same bug
- **Attached to first idea** — that's the warning sign

**Skip when:** Still clarifying the problem. Use `/problem-statement` first.

## The Local Maximum Trap

Exploration is cheap. The failure mode is defending the first solution that works.

**Signs you're stuck on a local maximum:**
- First solution is the only one considered
- Explaining why alternatives won't work before trying them
- Acting as crafter (defending) rather than editor (filtering)
- Implementation details discussed before approaches compared

## The Escalation Ladder

Not all problems need redesigns. The ladder finds the right altitude.

### Level 1: Band-Aid Fix
Patch the symptom. Fine under deadline pressure; toxic as habit.
*Signal: "This will break again"*
*Example: Null check. Catch exception. Hardcode edge case.*

### Level 2: Local Optimum
Optimize within current assumptions. Classic refactor trap — improves what exists without questioning it.
*Signal: "Cleaner but the same shape"*
*Example: Extract method. Add parameter. Refactor for readability.*

### Level 3: Reframe
Question the problem statement. Different framing yields different solutions, often revealing the actual constraint.
*Signal: "What if the problem is..."*
*Example: "We need faster cache invalidation" becomes "Why do we cache this at all?"*

### Level 4: Redesign
Change the system so the problem doesn't exist. Problems dissolve rather than get solved.
*Signal: "With this change, we wouldn't need to..."*
*Example: Instead of fixing sync conflicts, make the data flow unidirectional.*

## The Process

### Step 1: State the Problem (Confirm)

> "The problem we're solving is: [statement]. The key constraint is: [constraint]. The critical assumption is: [assumption]. Success looks like: [outcome or signal]."

If you can't state this clearly, go back to `/problem-statement`. Start from explicit constraints and assumptions, not fuzzy recollection.

### Step 2: Generate Candidates (Breadth)

List at least 3-4 candidates before evaluating any:

```markdown
## Candidate Solutions

### Option A: [Name]
- Approach: [Brief description]
- Level: [Band-Aid / Local Optimum / Reframe / Redesign]
- Trade-off: [Main cost]

### Option B: [Name]
...
```

**Rules:**
- No evaluation yet — generation only
- Include at least one approach from a higher level than your instinct
- Include the "obvious" solution even if you don't like it
- Include status quo when it's a real option — sharpens comparison, makes cost of inaction explicit
- Maximize variance early; breadth is exploratory fuel

**With RNA MCP:** If `oh_search_context` is available, call it with problem statement + active outcome + `phase: "solution-space"` before generating candidates. Surface relevant metis — prior evaluations, approaches tried, recurring patterns. Human selects what to carry; selected metis informs the candidate list. This prevents proposing solutions already tried and rejected.

### Step 3: Evaluate Trade-offs (Depth)

Before scoring, define the scoring function: what matters most, which constraints eliminate early, how user value is recognized. Then prune aggressively.

**With RNA MCP:** If `oh_search_context` is available, call it with the active outcome to surface applicable guardrails. These are constraints that rule options out before evaluation, not trade-offs — fold confirmed guardrails as hard constraints. Do not auto-apply metis as constraints; surface it and let the human decide weight.

For each candidate:
1. **Does it solve the stated problem?** (Not a related problem)
2. **Does it increase user value or produce more output?**
3. **How does it score against key constraints and success signal?**
4. **Implementation cost?** (Time, complexity, risk)
5. **Maintenance cost?** (Ongoing burden)
6. **Second-order effects?** (New problems created)
7. **Future optionality?** (Options enabled or closed)

### Step 4: Recommend with Reasoning

```markdown
## Recommendation

**Approach:** [Selected option]
**Level:** [Band-Aid / Local Optimum / Reframe / Redesign]

**Why this one:**
- [Reason 1]
- [Reason 2]

**Why not the others:**
- Option A: [Reason rejected]
- Option B: [Reason rejected]

**Known trade-offs we're accepting:**
- [Trade-off 1]
- [Trade-off 2]
```

### Step 5: Check for Local Maximum

- Did I defend my first idea or explore?
- Is there a higher-level approach I dismissed too quickly?
- Am I optimizing the wrong thing?

Landing on the first idea after exploration is fine. The danger is never looking.

## Output Format

```markdown
## Solution Space Analysis

**Problem:** [One sentence]
**Key Constraint:** [The binding constraint]
**Critical Assumption:** [The assumption that most threatens this recommendation if false]
**Success Signal:** [What later phases should verify]
**Scoring Function:** [How options are compared/pruned, including user-value criteria]

If Critical Assumption is blank, the recommendation is untested. Every non-trivial recommendation depends on something that could be wrong. Name it.

### Candidates Considered

| Option | Level | Approach | Trade-off |
|--------|-------|----------|-----------|
| A | [Level] | [Brief] | [Cost] |
| B | [Level] | [Brief] | [Cost] |
| C | [Level] | [Brief] | [Cost] |

### Evaluation

**Option A: [Name]**
- Solves stated problem: [Yes/Partially/No]
- Implementation cost: [Low/Medium/High]
- Maintenance burden: [Low/Medium/High]
- Second-order effects: [Description]

[Repeat for each option]

### Recommendation

**Selected:** Option [X] - [Name]
**Level:** [Band-Aid / Local Optimum / Reframe / Redesign]

**Ladders back to:** [the higher-level objective or outcome this recommendation serves]
**Tactic justification:** [why this is a good tactic for that objective under current constraints]

**Rationale:** [Why this approach fits the constraints]

**Accepted trade-offs:**
- [Trade-off 1]
- [Trade-off 2]

### Execution Contract

**Preserve:**
- [criterion or behavior later phases must preserve]
- [criterion or behavior later phases must preserve]

**Verify later via:**
- [signal `/execute` and `/ship` should be able to check]

### Readiness Gate

**Ready to deepen because:** [why this is ready to move from exploration into execution]
**Invalidated if:** [what evidence or discovery would make this direction wrong]
**Stop/Pivot if:** [what signal should cause us to halt or return to solution-space]

### Needs Human Verification
Claims or decisions in this recommendation that the model cannot self-check:
- [assumption that needs independent confirmation before commitment]
- [one-way decision that should not proceed on model confidence alone]

This section routes questions to the real human checkpoint (PR review, stakeholder approval, manual verification) rather than pretending an inline model field can substitute for independent judgment.

### Implementation Notes

[Any specific considerations for the selected approach]

```

If this recommendation involves a one-way or hard-to-reverse decision (architecture, public API, data model, external commitment), invoke `/dissent` before moving to `/execute`. Cheap exploration means the cost of challenge is low; the cost of an unchallenged wrong commitment is not.

## Examples

### Example 1: Performance Problem

```
/solution-space

Users report the dashboard is slow. Loading takes 8 seconds.
```

**Output:**
```markdown
## Solution Space Analysis

**Problem:** Dashboard loads in 8 seconds; users expect <2 seconds
**Key Constraint:** Can't rewrite the frontend this quarter
**Critical Assumption:** Users need useful content quickly more than they need the whole dashboard at once
**Success Signal:** First useful content appears in under 1 second
**Scoring Function:** Favor approaches that improve time-to-first-value for users within quarter-scale constraints

### Candidates Considered

| Option | Level | Approach | Trade-off |
|--------|-------|----------|-----------|
| A | Band-Aid | Add loading spinner | Doesn't fix slowness |
| B | Local Optimum | Add caching layer | Cache invalidation complexity |
| C | Reframe | Lazy-load dashboard sections | Changes UX slightly |
| D | Redesign | Stream data, render incrementally | Larger change |

### Evaluation

**Option A: Loading Spinner**
- Solves stated problem: No (perception only)
- Implementation cost: Low
- Second-order: Users still wait 8 seconds

**Option B: Caching Layer**
- Solves stated problem: Partially (helps repeat visits)
- Implementation cost: Medium
- Second-order: Stale data risk, invalidation complexity

**Option C: Lazy Loading**
- Solves stated problem: Yes (perceived speed)
- Implementation cost: Medium
- Second-order: Slight UX change, content shifts

**Option D: Streaming Render**
- Solves stated problem: Yes (actual + perceived)
- Implementation cost: High
- Second-order: Enables future improvements, larger change

### Recommendation

**Selected:** Option C - Lazy Loading
**Level:** Reframe
**Ladders back to:** Help users reach value before abandoning the dashboard
**Tactic justification:** It improves the user outcome under current constraints without requiring a quarter-scale rewrite

**Rationale:** The problem isn't "dashboard is slow" — it's "users wait before seeing anything useful." Lazy loading shows useful content in <1s while loading the rest. Lower cost than streaming, better than caching.

**Accepted trade-offs:**
- Content will shift as sections load
- Need to prioritize which sections load first

### Execution Contract

**Preserve:**
- First useful content appears quickly
- Users still reach the most important dashboard information reliably

**Verify later via:**
- Measure time to first useful content and confirm prioritized sections appear first
```

### Example 2: The Third Config Flag

```
/solution-space

We have a bug where notifications fire twice. This is the third
config flag we're adding to work around notification timing issues.
```

**Output:**
```markdown
## Solution Space Analysis

**Problem:** Notifications fire twice; third config flag proposed
**Key Constraint:** Pattern of band-aids suggests systemic issue
**Critical Assumption:** Duplicate notifications are caused by unclear ownership/triggering, not by timing alone
**Success Signal:** A chosen approach should reduce duplicate notifications without adding another unstable flag
**Scoring Function:** Prefer options that remove recurring operational pain and clarify ownership over options that suppress symptoms

### Candidates Considered

| Option | Level | Approach | Trade-off |
|--------|-------|----------|-----------|
| A | Band-Aid | Add debounce flag | 4th flag incoming |
| B | Local Optimum | Consolidate notification logic | Still reactive model |
| C | Reframe | Why do we notify on this event? | May simplify |
| D | Redesign | Event sourcing for notifications | Larger change |

### Evaluation

**Option A: Debounce Flag**
- Solves stated problem: Temporarily
- Second-order: Maintenance nightmare, flags interact

**Option B: Consolidate Logic**
- Solves stated problem: Probably
- Second-order: Still treating symptoms

**Option C: Question the Trigger**
- Solves stated problem: Possibly dissolves it
- Second-order: May reveal unnecessary complexity

**Option D: Event Sourcing**
- Solves stated problem: Yes, prevents duplicates by design
- Second-order: Significant refactor

### Recommendation

**Selected:** Option C - Reframe, then possibly D
**Level:** Reframe (investigation)
**Ladders back to:** Stop recurring operational pain instead of normalizing another workaround
**Tactic justification:** It is the cheapest path that can still reveal whether the real problem is trigger ownership rather than timing

**Rationale:** Three config flags is a code smell. Before adding a fourth, understand why notifications are triggered from multiple paths. The duplication likely indicates unclear ownership of the notification concern.

**Accepted trade-offs:**
- May uncover a larger redesign need
- Does not promise an immediate patch without investigation

### Execution Contract

**Preserve:**
- Do not add another unexamined config flag as the default move
- Make trigger ownership explicit before deepening implementation

**Verify later via:**
- Map all notification trigger points; if more than three paths trigger the same notification, treat the problem as architectural, not timing-related
```

## Session Persistence

**If session name provided** (`/solution-space auth-refactor`): reads/writes `.oh/auth-refactor.md` directly.
**If no session name provided** (`/solution-space`): offer to save with suggested name from git branch or problem being solved.

**Reads:** existing session file; prior outputs — **Aim**, **Problem Statement**, **Problem Space** — to understand constraints.
**Writes:** solution space analysis so `/execute` can reuse selected approach, critical assumption, success signal, scoring function, execution contract, and readiness gate:

```markdown
## Solution Space
**Updated:** <timestamp>

[solution space analysis and recommendation]
```

## Position in Framework

**Comes after:** `/problem-statement` (need a framed problem to evaluate against).
**Leads to:** `/execute` to implement, or `/dissent` to challenge the recommendation.
**Can loop back to:** `/problem-statement` (if exploration reveals the problem is mis-framed).