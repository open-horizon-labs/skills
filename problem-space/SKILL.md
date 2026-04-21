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

The trap: agents talk themselves out of constraints. "For this prototype we don't have time" is often false when code generation takes 15 minutes. Ground in what's actually fixed.

### Step 3: Identify the Terrain

- **Systems involved?** — existing code, external APIs, data stores
- **Who is affected?** — users, operators, downstream systems
- **Blast radius?** — if this goes wrong, what breaks?
- **Precedents?** — solved before? Where?

### Step 4: Surface Hidden Assumptions

> "We assume [assumption]. If this is false, [consequence]."

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

### X-Y Check
- **Stated need (Y):** [what was asked for]
- **Underlying need (X):** [what might actually be needed]
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
| Must use current database | assumed | "Migration too expensive" | Have we actually costed this? |
| Can't change API contracts | soft | Downstream consumers | How many consumers actually use slow endpoints? |
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

Persists to `.oh/<session>.md` for subsequent skills.

**If session name provided** (`/problem-space auth-refactor`):
- Reads/writes `.oh/auth-refactor.md` directly

**If no session name provided** (`/problem-space`):
- Offer to save: `"Save to session? [suggested-name] [custom] [skip]"`
- Suggest name from git branch or exploration topic

**Reading:** Check for existing session file. Read prior skill outputs — especially **Aim** and **Problem Statement** — to ground exploration.

**Writing:** Write problem space map so later phases reuse explicit constraints, assumptions, and open questions:

```markdown
## Problem Space
**Updated:** <timestamp>

[problem space map content]
```

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Produces problem space map through questioning. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for prior context (aim, problem statement)
- Writes problem space map to session file
- Subsequent skills read constraints, assumptions, open questions, terrain directly

### With RNA MCP (repo-native-alignment)

When RNA MCP is available (`oh_search_context` tool present), enrich the problem space map with repo-local knowledge before presenting to the human.

**At Step 2 (Map Constraints):** Call `oh_search_context` with the objective/domain and `phase: "problem-space"`. Surface guardrails as already-settled constraints (not assumptions to question). Fold into constraints table as `hard` with source attribution. Present remaining candidates for confirmation.

**At Step 3 (Terrain / Precedents):** Call `oh_search_context` with the problem domain. Surface relevant metis entries. Present as candidate list with provenance — human selects what to carry as precedents.

```
**Relevant metis/guardrails from this repo:**
- [metis title] (source: .oh/metis/filename.md) — [one-line relevance note]
  → Keep / Dismiss?
```

Human selects before the map is finalized. Selected items appear in Terrain/Constraints; dismissed items are excluded.

**Phase tag:** Pass `phase: "problem-space"` to filter for phase-appropriate entries. Cross-phase metis is noise here unless explicitly requested.

### With Open Horizons MCP
- Queries graph for related past decisions and outcomes
- Pulls tribal knowledge about similar problem spaces
- Retrieves applicable guardrails
- Session file as local cache

## Position in Framework

**Comes after:** `/aim` (know your destination before mapping terrain).
**Leads to:** `/problem-statement` to frame the specific challenge, or `/solution-space` if already well-framed.
**Can loop back from:** `/salvage` (constraints were wrong), `/review` (keeps hitting same blockers).
