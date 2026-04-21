---
name: execute
description: Do the work. Pre-flight, build, detect drift, salvage if needed. Use when you have a clear aim and are ready to implement.
---

# /execute

Bridge from Solution Space to shipped code. Pre-flight, build, detect drift, salvage if needed.

Execute sits within **Intent → Execution → Review**. It contains an inner loop: build, check alignment, course-correct or salvage.

## When to Use

Invoke `/execute` when aim is clear, solution is chosen, context is loaded, and you're ready to build.

**Do not use when:** Aim is unclear (`/aim`), still exploring (`/solution-space`), or problem is ambiguous (`/problem-space`, `/problem-statement`).

## The Execute Process

### Step 1: Pre-flight Check

Before writing code, verify alignment:

```
Pre-flight Checklist:
[ ] Aim is clear - what outcome am I producing?
[ ] Constraints known - what must I NOT break?
[ ] Context loaded - do I have the codebase understanding I need?
[ ] Scope bounded - what am I specifically doing (and NOT doing)?
[ ] Success criteria - how will I know when I'm done?
[ ] Readiness clear - why am I deepening now, what invalidates this direction, and what should trigger a stop/pivot?
```

If any box can't be checked, stop and address it first.

If the work involves a one-way or hard-to-reverse decision and `/dissent` has not been run, flag it now. Cheap exploration before commitment is the entire point of the workflow; skipping challenge before a one-way door is the most expensive version of saving time.

Make the phase shift explicit:

 > "The task is [task]. The aim is [aim]. This ladders back to [selected approach or parent objective]. I'm specifically doing [scope]. I will NOT be touching [out of scope]. Success looks like [criteria]. I'm ready to deepen because [reason]. This direction is invalidated if [condition]. I will stop or pivot if [trigger]."

Those declared success criteria become the delivery contract for later phases: `/ship` should be able to verify what was promised, not just whether something deployed.

### Step 2: Build

Do the work. Keep it focused.

- Work in small, testable increments
- Stay within declared scope
- If scope expands, pause and reassess (see Drift Detection)

**During build:**
1. Make the change
2. Verify it works (tests, manual check, whatever's appropriate)
3. Run review if available (`sg review` or equivalent)
4. Handle review findings (fix trivial, create tasks for non-trivial)
5. Commit with clear message

### Step 3: Detect Drift

Periodically check alignment:

**Drift signals:** scope expanding, touching unplanned files, "while I'm here" thoughts, approach reversing direction, protecting sunk-cost code.

**When you notice drift:**

```
Drift Check:
- Original aim: [aim]
- What I'm actually doing now: [current work]
- Gap: [describe the divergence]
- Verdict: [aligned | minor drift | significant drift | lost]
```

**Aligned:** Continue. **Minor drift:** Note it, refocus if needed. **Significant drift:** Pause — refocus, get confirmation, or salvage. **Lost:** Invoke `/salvage` immediately.

### Step 4: Salvage if Needed

When to stop: approach has reversed 3+ times, scope keeps expanding, you're oscillating not converging, the finish line keeps moving.

Don't fight lost work. Extract the learning and restart clean. Invoke `/salvage`.

## Output Format

When execution completes successfully:

```
## Execution Complete

**Task:** [what was done]
**Aim achieved:** [how it maps to the original aim]

### Declared Success Criteria
- [criterion 1]
- [criterion 2]

### Delivered Characteristics
- [characteristic/result]: [met | partially met | deferred]

### Changes
- [file/component]: [what changed and why]

### Verification
- [how it was tested/verified]

### Needs Human Verification
Claims that the model asserted but cannot independently confirm:
- [characteristic that was claimed met but not externally observed]
- [assumption that was carried forward without independent test]

If this section is empty, say why.

### Notes
- [anything relevant for future work]
```

When drift triggers a pause:

```
## Execution Paused - Drift Detected

**Original aim:** [aim]
**Current state:** [where things stand]
**Drift:** [what diverged and why]

### Options
1. [option 1]
2. [option 2]
3. Salvage and restart

Recommendation: [your assessment]
```

## Examples

### Example 1: Clean Execution

```
/execute

Task: Add validation for empty strings in user input
```

**Pre-flight:**
```
Pre-flight Checklist:
[x] Aim is clear - prevent empty strings from causing silent failures
[x] Constraints known - don't break existing validation, maintain API compatibility
[x] Context loaded - reviewed input processing flow, found 3 entry points
[x] Scope bounded - only the 3 input handlers, not the downstream processors
[x] Success criteria - empty strings rejected with clear error message
```

**Output:**
```
## Execution Complete

**Task:** Add empty string validation to user input
**Aim achieved:** Empty strings now rejected at entry points with clear error message

### Declared Success Criteria
- Reject empty strings at the 3 input handlers
- Return a clear error message for empty input

### Delivered Characteristics
- Entry-point validation in user/profile/settings handlers: met
- Clear error message on empty input: met

### Changes
- handlers/user.go: Added empty string check before processing
- handlers/profile.go: Added empty string check before processing
- handlers/settings.go: Added empty string check before processing
- lib/validation.go: New isEmpty() helper for consistency

### Verification
- Added unit tests for each handler (empty, whitespace-only, valid)
- Manual test: confirmed error message appears in UI

### Notes
- Downstream processors still accept empty strings (out of scope)
- Consider adding validation to API gateway layer in future
```

### Example 2: Drift Detection Mid-Execution

**Mid-execution drift check:**
```
Drift Check:
- Original aim: Fix timezone display bug
- What I'm actually doing now: Refactoring the entire date handling library
- Gap: Went from fixing display to rewriting infrastructure
- Verdict: Significant drift
```

**Output:**
```
## Execution Paused - Drift Detected

**Original aim:** Fix timezone bug in calendar display
**Current state:** Found the bug, but discovered date handling is inconsistent across 12 files
**Drift:** Started fixing the display bug, realized the root cause is a design issue.

### Options
1. Band-aid fix in display layer only (solves symptom, not cause)
2. Refactor date handling (right fix, but 10x scope)
3. Salvage learning, create proper task for date system redesign

Recommendation: Option 3 - the date system needs intentional redesign, not
accidental refactoring during a bug fix.
```

## Session Persistence

This skill can persist context to `.oh/<session>.md`.

**If session name provided** (`/execute auth-refactor`):
- Reads/writes `.oh/auth-refactor.md` directly

**If no session name provided** (`/execute`):
- After pre-flight, offer to save execution context:
  > "Save to session? [suggested-name] [custom] [skip]"

**Reading:** Check for existing session file. Read **Aim**, **Problem Statement**, and **Solution Space** to understand what we're building and why — essential for drift detection.

**Writing:** After pre-flight and during execution, write status including declared success criteria and delivered characteristics:

```markdown
## Execute
**Updated:** <timestamp>
**Status:** [pre-flight | in-progress | drift-detected | complete]

[execution notes, declared criteria, delivered characteristics, drift observations, etc.]
```

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Manual pre-flight checklist, drift detection by reasoning. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for aim, constraints, selected solution
- Writes execution status and notes to the session file
- Drift detection compares current work against session aim

### With Open Horizons MCP
- Queries related past decisions and learnings
- Logs execution decisions to graph database

### With task management (ba, GitHub issues)
- Creates subtasks for non-trivial findings
- Updates task status as work progresses

### With code review (sg, CodeRabbit)
- Runs automated review on staged changes
- Triages findings by severity

## Position in Framework

**Comes after:** `/solution-space` (you need a chosen approach to execute).
**Leads to:** `/ship` to deliver, `/review` to verify, `/salvage` if drifting.
**Can loop back to:** `/aim` or `/problem-space` via `/salvage` when the approach isn't working.

---

**Remember:** Execute is the inner loop. Stay focused on the aim. Detect drift early. Salvage without shame.
