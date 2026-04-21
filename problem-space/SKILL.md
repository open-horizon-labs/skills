---
name: problem-space
description: Map what we're optimizing and what constraints we treat as real. Use before jumping to solutions, when hitting repeated blockers, or when patches keep accumulating.
---

# /problem-space

Map the terrain where solutions live. What are we optimizing? What constraints are real? Which can be questioned?

Problem space precedes solution space. Jump to code too early and you build the wrong thing fast.

## When to Use

- **Starting new work** — before implementation, understand what you're solving
- **Hitting repeated blockers** — same problems in different forms
- **Patches accumulating** — third config flag for the same bug means you're treating symptoms
- **Estimates off by 10×** — the problem isn't understood
- **Agent talking itself out of constraints** — "for this prototype we don't have time" when the constraint matters

**Skip when:** Problem is well-understood and you're in execution. Problem space is for grounding, not stalling.

## The Problem Space Process

### Step 1: State the Objective Function

What are we optimizing? Not the feature — the outcome.

> "We are optimizing for [outcome]."

"Build a login page" is a feature. "Reduce time-to-first-value for new users" is an objective.

- What behavior change indicates success?
- What metric moves if this works?
- What problem disappears if we get this right?

### Step 2: Map the Constraints

List what we treat as fixed. Be explicit about each constraint's nature:

```
Constraint: [the boundary]
Type: [hard | soft | assumed]
Reason: [why it exists]
Questioning: [could this be false?]
```

**Hard** — physics, regulations, signed contracts. Don't bend.
**Soft** — organizational decisions, technical debt, time pressure. Negotiable.
**Assumed** — "we've always done it this way." Question these.

The trap: agents talk themselves out of constraints. "For this prototype we don't have time" is often false when code generation takes 15 minutes. Ground in what's fixed.

**With RNA MCP:** If `oh_search_context` is available, call it with the objective/domain and `phase: "problem-space"`. Surface guardrails as already-settled constraints (`hard`, with source attribution). Present remaining candidates for human confirmation before finalizing the constraints table.

### Step 3: Identify the Terrain

- **Systems involved?** — existing code, external APIs, data stores
- **Who is affected?** — users, operators, downstream systems
- **Blast radius?** — if this goes wrong, what breaks?
- **Precedents?** — solved before? Where?

**With RNA MCP:** If `oh_search_context` is available, call it with the problem domain and `phase: "problem-space"`. Surface relevant metis entries as candidate precedents with provenance — human selects what to carry. Dismissed items are excluded from the final map.

### Step 4: Surface Hidden Assumptions

Every problem space has embedded assumptions. Make them visible:

> "We assume [assumption]. If this is false, [consequence]."

Zero assumptions listed is not "clean" — it means you haven't looked. Name at least one or explain why the problem space has no hidden premises.

### Step 5: Check for X-Y Problems

Are we solving the real problem (X) or the user's attempted solution (Y)?

**Signs of X-Y mismatch:**
- Request is oddly specific for a simple goal
- You're building something that feels like a workaround
- "How do I do [technique]?" without explaining why

If potential X-Y problem detected:
> "The user asked for [Y], but the underlying need might be [X]."

If constraints, assumptions, or open questions still feel implicit after this step, you're not ready for `/solution-space`. Force the unknowns into the artifact.

## Output Format

```
## Problem Space Map

**Date:** [timestamp]
**Scope:** [what area this covers]

### Objective
[What we're optimizing for - the outcome, not the feature]

### Constraints

| Constraint | Type | Reason | Question? |
|------------|------|--------|-----------|
| [boundary] | hard/soft/assumed | [why] | [could this be false?] |

### Terrain
- **Systems:** [what's involved]
- **Stakeholders:** [who's affected]
- **Blast radius:** [what breaks if wrong]
- **Precedents:** [existing solutions to examine]

### Assumptions Made Explicit
1. [assumption] - if false: [consequence]
2. [assumption] - if false: [consequence]

### Open Questions
- [unknown that must be answered before solution-space]
- [unknown that can be carried with explicit risk]

Zero open questions is suspicious. If you have none, say why — a problem space with no unknowns has either been deeply investigated or insufficiently examined.

### X-Y Check
- **Stated need (Y):** [what was asked for]
- **Underlying need (X):** [what might be needed]
- **Confidence:** [high/medium/low that Y=X]

### Ready for Solution Space?
[yes/no] - [why or what's missing]
```

## Examples

### Example 1: Repeated Deployment Failures

```
/problem-space

Deployments keep failing. We've added 3 config flags in the last month
and each one "fixes" something but creates new edge cases.
```

**Output:**
```
## Problem Space Map

**Date:** 2024-01-15
**Scope:** Deployment pipeline reliability

### Objective
We are optimizing for: Reliable deployments that succeed without manual intervention.

### Constraints

| Constraint | Type | Reason | Question? |
|------------|------|--------|-----------|
| Must use existing CI/CD | soft | Team familiarity | Could we evaluate alternatives? |
| Zero-downtime required | hard | SLA commitment | No |
| Config managed in repo | assumed | "Best practice" | Could config live elsewhere? |
| Current rollback approach | soft | Built incrementally | Is this the right rollback model? |

### Terrain
- **Systems:** GitHub Actions, Kubernetes, ArgoCD, 3 microservices
- **Stakeholders:** Dev team, SRE, downstream API consumers
- **Blast radius:** Customer-facing outage, 200+ API consumers
- **Precedents:** Similar system at [X] uses feature flags instead of config

### Assumptions Made Explicit
1. Config flags are the right mechanism for deployment variation - if false: we need environment-aware builds
2. Failures are config-related - if false: we have an architecture problem

### Open Questions
- Is the deployment failure really caused by configuration, or is config just the visible symptom?
- What evidence would justify redesign over another flag?

### X-Y Check
- **Stated need (Y):** Fix deployment config issues
- **Underlying need (X):** Make deployments reliable
- **Confidence:** Medium - config is a symptom, not the disease

### Ready for Solution Space?
No - Need to understand if this is a band-aid problem (more config) or a redesign problem (change how deployments work).
```

### Example 2: Performance Degradation

```
/problem-space

App is slow. PM wants us to "optimize the database queries."
```

**Output:**
```
## Problem Space Map

**Date:** 2024-01-15
**Scope:** Application performance

### Objective
We are optimizing for: Page load time under 2 seconds for 95th percentile users.

### Constraints

| Constraint | Type | Reason | Question? |
|------------|------|--------|-----------|
| Must use current database | assumed | "Migration too expensive" | Have we costed this? |
| Can't change API contracts | soft | Downstream consumers | How many consumers use slow endpoints? |
| Feature set is fixed | assumed | PM specified | What if we removed/simplified features? |

### Terrain
- **Systems:** PostgreSQL, Redis cache, React frontend, Node backend
- **Stakeholders:** End users, mobile clients, third-party integrations
- **Blast radius:** User churn, support tickets, competitor migration
- **Precedents:** Similar app moved to read replicas, saw 3x improvement

### Assumptions Made Explicit
1. Database queries are the bottleneck - if false: frontend rendering or network latency is the issue
2. Optimization is cheaper than redesign - if false: N+1 queries need architectural change
3. Current feature set is needed - if false: could eliminate unused expensive features

### Open Questions
- What is the actual bottleneck: database, network, or frontend rendering?
- Which user workflows matter most for the 95th percentile target?

### X-Y Check
- **Stated need (Y):** Optimize database queries
- **Underlying need (X):** Make app feel fast to users
- **Confidence:** Low - PM prescribed solution without diagnosis

### Ready for Solution Space?
No - Need performance profiling to identify actual bottleneck before optimizing anything.
No - Need performance profiling to identify actual bottleneck before optimizing anything.
```

## Session Persistence

**If session name provided** (`/problem-space auth-refactor`): reads/writes `.oh/auth-refactor.md` directly.
**If no session name provided** (`/problem-space`): offer to save with suggested name from git branch or exploration topic.

**Reads:** existing session file; prior outputs — especially **Aim** and **Problem Statement** — to ground exploration.
**Writes:** problem space map so later phases reuse explicit constraints, assumptions, and open questions:

```markdown
## Problem Space
**Updated:** <timestamp>

[problem space map content]
```

## Position in Framework

**Comes after:** `/aim` (know your destination before mapping terrain).
**Leads to:** `/problem-statement` to frame the specific challenge, or `/solution-space` if already well-framed.
**Can loop back from:** `/salvage` (constraints were wrong), `/review` (keeps hitting same blockers).