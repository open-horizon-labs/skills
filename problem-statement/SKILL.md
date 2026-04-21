---
name: problem-statement
description: Define the framing of a problem. Change the statement, change the solution space. Use when starting work, when solutions feel wrong, or when you suspect an X-Y problem.
---

# /problem-statement

Define the framing. **Change the statement, change the solution space.**

A problem statement is not the problem — it's the lens. Different framings open different solution spaces. The right framing makes good solutions obvious; the wrong framing makes them invisible.

## When to Use

- **Starting new work** — before solutions, articulate what you're solving
- **Solutions feel off** — proposed solutions seem convoluted or like workarounds
- **Oscillating on approach** — direction keeps changing; framing might be wrong
- **Suspected X-Y problem** — someone asks for a specific solution but underlying need is unclear
- **Requirements expanding** — scope creep signals framing mismatch
- **After `/aim` but before `/solution-space`** — aim defines outcome, problem statement frames challenge

**Skip when:** You have a crisp problem statement. Move to `/solution-space`.

## The Framing Process

### Step 1: Surface the Current Framing

> "The problem is currently framed as: [how it's being described]"

Capture: the stated problem, embedded assumptions, what's treated as fixed vs. changeable.

### Step 2: Detect X-Y Problems

Watch for X-Y pattern: someone asks for Y (attempted solution) when they need X (real problem).

**Signs of X-Y mismatch:**
- Request oddly specific for a simple goal
- Solution feels like a workaround
- "How do I do [technique]?" without explaining why
- Convoluted multi-step approach to something simple

**If detected:**
> "You're asking for [Y], but the underlying need seems to be [X]. Is that right?"

### Step 3: Separate WHAT from HOW

A good problem statement articulates WHAT needs to change, not HOW.

| Wrong (solution) | Right (problem) |
|---|---|
| "Add a caching layer to reduce latency" | "Page loads take 3+ seconds; users abandon before content appears" |
| "Refactor the auth module" | "Adding a new auth provider takes 2 weeks and touches 6 files" |

**Test:** Does it describe a symptom or a solution? Could someone unfamiliar with the codebase understand what's wrong? Does it leave room for multiple approaches?

### Step 4: Identify Constraints and Flexibility

**Hard** — regulatory, physics, existing user commitments.
**Soft** — "we've always done it this way," technical debt, team preferences.

Questions to surface flexibility:
- What would we do if [constraint] didn't exist?
- Who decided [constraint] was fixed? Can we revisit?
- Cost of violating vs. cost of keeping?

### Step 5: Craft the Problem Statement

**[Who] needs [what outcome] because [why it matters], but currently [what's blocking].**

Good statements are **crisp** (1-2 sentences), **outcome-focused**, **testable**, and **solution-agnostic**.

| Bad | Good |
|-----|------|
| "The API is slow" | "API responses take 800ms; our SLA requires 200ms" |
| "We need microservices" | "Deploying a fix requires coordinating 4 teams and takes 2 weeks" |
| "Users don't understand the UI" | "40% of support tickets are 'how do I X' where X is a core feature" |
| "We need better tests" | "Last 3 production incidents were caught by users, not tests" |

### Step 6: Validate the Framing

1. **State it to someone else** — if they immediately suggest a solution, framing is too narrow
2. **Invert it** — what would the world look like if this problem didn't exist?
3. **Zoom out** — is this a symptom of a larger problem?
4. **Zoom in** — is this actually multiple problems masquerading as one?

## Output Format

```
## Problem Statement

**Current framing:** [How the problem is currently being described]

**Reframed as:** [Your crisp problem statement]

**The shift:** [What changed in how we see it]

### Constraints
- **Hard:** [Actually immovable constraints]
- **Soft:** [Constraints that feel fixed but might be flexible]

### Assumptions Being Tested
- [assumption embedded in this framing]

Every framing rests on assumptions. If you listed zero, either the framing is trivial or you haven't surfaced what it depends on. Name at least one.

### What this framing enables
[What solution approaches become visible with this framing]

### What this framing excludes
[What approaches are off the table—and whether that's intentional]

### Signal This Framing Is Wrong
[What we would see if this framing is a symptom, not the problem]
```

## Examples

### Example 1: X-Y Problem Detection

**User asks:**
> "How do I parse this JSON and extract the user IDs into a separate array?"

**X-Y detection:**
```
## Problem Statement

**Current framing:** Need to parse JSON and extract user IDs into an array.

**But wait—why?** This sounds like an attempted solution.

**Clarifying questions:**
- What will you do with the array of user IDs?
- Where does this JSON come from?
- How often does this need to happen?

**If the answer is:** "I need to check if the current user is in this list"

**Reframed as:** Need to determine if current user has permission to access this resource.

**The shift:** From data transformation to authorization check. Might be solvable without extracting IDs at all — a simple `includes()` check or a backend permission endpoint.
```

### Example 2: Reframing Infrastructure as User Problem

**Original request:**
> "We need to set up a message queue between services"

**Problem statement work:**
```
## Problem Statement

**Current framing:** Set up message queue between services.

**That's a solution. What's the problem?**

After discussion: "When Service A updates, Service B doesn't know about it. Users see stale data."

**Reframed as:** Users see stale data after updates because services don't communicate changes in real-time.

**The shift:** From infrastructure request to user experience problem. Now we can evaluate: Does this need real-time? Is eventual consistency acceptable? Could we solve this with cache invalidation instead?

### Constraints
- **Hard:** Users must see accurate data within 5 seconds of update
- **Soft:** "We use message queues for this" (actually flexible—polling, webhooks, or shared cache might work)

### Assumptions Being Tested
- Users actually need near-real-time updates rather than merely eventual consistency
- Separate services are the right boundary for this interaction

### What this framing enables
- Evaluate real-time vs. eventual consistency needs
- Consider polling intervals as a simpler solution
- Question whether these should be separate services at all

### What this framing excludes
- Building complex event-driven architecture before validating the need

### Signal This Framing Is Wrong
- Users are satisfied with slower consistency, or the stale-data complaint points to a different cause than service communication
```

### Example 3: Scope Creep Signal

**Context:**
> Started as "add a dark mode toggle." Now touching 14 files and we realize there's no theme system.

**Problem statement work:**
```
## Problem Statement

**Current framing:** Add dark mode toggle.

**What's actually happening:** We can't add the toggle because there's no theme infrastructure to toggle between.

**Reframed as:** The codebase has no theming system; colors are hardcoded across components.

**The shift:** This is two problems:
1. Build theming infrastructure (larger)
2. Add dark mode as first alternate theme (smaller, depends on #1)

The original ask revealed a missing capability, not a feature to add.

### Constraints
- **Hard:** None identified
- **Soft:** "Ship dark mode this sprint" (may not be realistic given scope)

### Assumptions Being Tested
- A dark-mode toggle is the immediate need rather than a missing theming capability
- A theme system is worth building now because multiple uses likely exist

### What this framing enables
- Properly scope the work (infrastructure then feature)
- Consider: is dark mode the most valuable first use of a theme system?
- Evaluate CSS-in-JS vs. CSS variables vs. other approaches

### What this framing excludes
- Hacking dark mode without addressing the underlying issue (band-aid)

### Signal This Framing Is Wrong
- If dark mode is the only real use case and a narrower solution clearly beats building shared theming infrastructure
```

## Session Persistence

Persists to `.oh/<session>.md` for subsequent skills.

**If session name provided** (`/problem-statement auth-refactor`):
- Reads/writes `.oh/auth-refactor.md` directly

**If no session name provided** (`/problem-statement`):
- Offer to save: `"Save to session? [suggested-name] [custom] [skip]"`
- Suggest name from git branch or problem topic

**Reading:** Check for existing session file. Read prior outputs — especially **Aim** — to ground the framing.

**Writing:** Write problem statement so solution-space can reuse framing, assumptions, and invalidation signal directly:

```markdown
## Problem Statement
**Updated:** <timestamp>

[problem statement content]
```

If the section exists, replace it. If not, append after Aim section.

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Produces problem statement for discussion. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for prior context (especially aim)
- Writes problem statement to session file
- Subsequent skills read framing, assumptions being tested, and invalidation signal

### With Open Horizons MCP
- Queries graph for similar problems and their eventual framings
- Retrieves tribal knowledge about framing patterns that worked/failed
- Logs problem statement as decision point in the endeavor
- Session file as local cache

## Position in Framework

**Comes after:** `/aim` and `/problem-space` (know where you're going and what terrain you're in).
**Leads to:** `/solution-space` to explore approaches, or `/dissent` if the framing feels too easy.
**Can loop back from:** `/solution-space` (if exploration reveals the problem is mis-framed).
