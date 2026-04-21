---
name: aim
description: Clarify the outcome you want - a change in user behavior, not a feature shipped. Use at the start of any work to ground the session in strategic intent.
---

# /aim

Clarify the outcome you want. An aim is a change in user behavior, not a feature shipped. First step in Intent-Execution-Review.

**The aim IS the abstraction.** Clarifying what behavior to change abstracts the business domain itself. Features are mechanism; the aim is why they matter.

## When to Use

- **Starting new work** — before problem-statement or problem-space
- **Scope feels fuzzy** — you can describe what but not why
- **Multiple solutions seem valid** — aim reveals which moves the needle
- **Work has drifted** — check alignment
- **Team is misaligned** — surfaces hidden assumptions

**Skip when:** You already have a crisp aim. Move to `/problem-statement` or `/problem-space`.

## The Aim Process

### Step 1: State the Desired Behavior Change

Start with the user, not the system.

> "Users will [specific behavior] instead of [current behavior]."

Bad: "Add dark mode toggle"
Good: "Users can work comfortably at night without eye strain"

Bad: "Improve onboarding flow"
Good: "New users reach their first value moment within 5 minutes"

**Key distinction:** Features are outputs. Behavior changes are outcomes. If users don't become more capable, shipping more output doesn't rescue the work.

### Step 2: Identify the Mechanism

The mechanism is your hypothesis — the causal lever you believe produces the behavior change.

```
Mechanism: [What you're changing]
Hypothesis: [Why you believe it will produce the outcome]
Assumptions: [What must be true for this to work]
```

If you listed zero assumptions, that is a red flag, not a clean bill of health. Every mechanism rests on premises. Name at least one or explain why none exist.

### Step 3: Define the Feedback Signal

How will you know if the aim is achieved?

> "We'll know it's working when [observable signal]."

Signals must be **observable**, **timely**, and **attributable** to your mechanism.

### Step 4: Set Guardrails

What constraints bound this work? What would cause you to stop?

```
Guardrail: [boundary]
Reason: [why this matters]
Trigger: [when to revisit]
```

## Output Format

```
## Aim Statement

**Aim:** [One sentence: the behavior change you want]

**Current State:** [What users do now]
**Desired State:** [What users will do after]

### Mechanism
**Change:** [What you're building/changing]
**Hypothesis:** [Why you believe this produces the outcome]
**Assumptions:** [What must be true]

### Feedback
**Signal:** [How you'll know it's working]
**Timeframe:** [When you'll have signal]

### Guardrails
- [Guardrail 1]
- [Guardrail 2]
```

Later phases carry forward the aim's explicit fields — outcome, mechanism, assumptions, feedback signal, guardrails — as the contract the rest of the workflow preserves.

## Examples

### Example 1: Feature Request to Aim

**Input:**
```
/aim

We need to add a dark mode toggle to the settings page.
```

**Output:**
```
## Aim Statement

**Aim:** Users can work comfortably during extended evening sessions without eye strain.

**Current State:** Users either strain their eyes or stop using the app after dark.
**Desired State:** Users work as long as they need, regardless of ambient lighting.

### Mechanism
**Change:** Theme system with dark variant, exposed via settings toggle
**Hypothesis:** Reducing screen brightness and contrast in low-light environments reduces eye strain, increasing comfortable usage time.
**Assumptions:**
- Users actually work in low-light conditions (validate with usage time data)
- Eye strain is the blocker, not just preference (could survey)
- A toggle is discoverable enough (vs. auto-detect)

### Feedback
**Signal:** Session duration in evening hours (6pm-midnight) increases
**Timeframe:** 2 weeks post-launch to see pattern

### Guardrails
- Don't break existing light theme (test both paths)
- Don't over-engineer: one dark theme, not a theme builder
- Revisit if <5% of users actually enable it after 30 days
```

### Example 2: Vague Strategic Goal to Aim

**Input:**
```
/aim

We need to improve developer experience.
```

**Output:**
```
## Aim Statement

**Aim:** Developers spend less than 10 minutes from git clone to running their first successful test.

**Current State:** New developers report 45-90 minutes to get a working dev environment. Some give up.
**Desired State:** Developers are productive within their first coffee break.

### Mechanism
**Change:** Containerized dev environment with pre-configured dependencies
**Hypothesis:** Most setup time is spent on environment configuration, not understanding code. A working container removes the configuration variable.
**Assumptions:**
- Docker is acceptable for dev workflow (some devs resist containers)
- Environment issues are the primary friction (not docs, not code complexity)
- Container startup time is acceptable (<2 min)

### Feedback
**Signal:** Time from clone to first passing test (measured in onboarding script)
**Timeframe:** Immediate per-developer, aggregate after 5 new devs

### Guardrails
- Container must work on Mac, Linux, and Windows (WSL2)
- Don't require Docker for those who prefer native setup
- Revisit if container approach creates new friction (debugging, IDE integration)
```

### Example 3: Checking Aim Mid-Work

**Input:**
```
/aim

I'm three days into this auth refactor and not sure if I'm still solving the right problem.
```

**Output:**
```
## Aim Check

**Original aim (inferred):** Simplify the authentication flow for easier maintenance.

Clarifying questions:

1. **What behavior change were you targeting?**
   - Faster feature development in auth-adjacent code?
   - Fewer auth-related bugs in production?
   - Easier onboarding for new devs to the auth system?

2. **What's the current state?**
   - How long does an auth change take today?
   - What breaks most often?

3. **What signal will tell you this worked?**
   - PR cycle time for auth changes?
   - Bug count in auth module?

Without clear answers, consider `/salvage` to extract what you've learned, then restart with a crisp aim.

**Red flag:** If "simplify" is the aim, you need a measurable definition. Simplicity is a mechanism, not an outcome. What does simpler auth enable that complex auth blocks?
```

## Session Persistence

Persists to `.oh/<session>.md` for subsequent skills.

**If session name provided** (`/aim auth-refactor`):
- Reads/writes `.oh/auth-refactor.md` directly

**If no session name provided** (`/aim`):
- Offer to save: `"Save to session? [suggested-name] [custom] [skip]"`
- Suggest name from git branch or aim content

**Reading:** Check for existing session file; read prior skill outputs for context.

**Writing:** Write aim statement as the contract later phases reuse:

```markdown
# Session: <session>

## Aim
**Updated:** <timestamp>

[aim statement content]
```

If the section exists, replace it.

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Produces aim statement for discussion. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for prior context
- Writes aim statement to session file
- Subsequent skills read outcome, assumptions, feedback signal, guardrails directly

### With Open Horizons MCP
- Queries related endeavors for existing aims
- Pulls relevant tribal knowledge for mechanism choice
- Logs aim to graph database, links to active endeavors
- Session file as local cache

## Position in Framework

**Comes after:** Nothing — aim is the entry point.
**Leads to:** `/problem-space` to map the terrain, or `/solution-space` if the problem is already clear.
**Can loop back from:** `/salvage` (restart with learning), `/review` (if aim has drifted).
