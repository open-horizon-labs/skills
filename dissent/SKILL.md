---
name: dissent
description: Devil's advocate. Seek contrary evidence before locking in. Use when about to make a significant decision, when confidence is high but stakes are higher, or when the team is converging too quickly.
---

# /dissent

Structured disagreement that strengthens decisions. **Find flaws before the one-way door closes.**

Dissent is not attack. It's actively seeking reasons you might be wrong.

## When to Use

Invoke `/dissent` when: about to lock in a one-way door (architecture, public API, major hires), confidence is high but stakes are higher, team is converging too quickly, you're defending a position, or the path forward seems obvious.

**Do not use when:** Gathering initial options or brainstorming. Dissent stress-tests decisions, not generates them.

## The Dissent Process

### Step 1: Steel-Man the Current Approach

Before attacking, fully articulate the position:

> "The current approach is [approach]. The reasoning is [reasoning]. The expected outcome is [outcome]. This is the strongest version of this position."

If you can't state it charitably, you don't understand it well enough to challenge it.

### Step 2: Seek Contrary Evidence

- What data would prove this approach wrong?
- Who disagrees? What's their strongest argument?
- What similar approaches have failed elsewhere? Why?
- What are we ignoring because it's inconvenient?

> "If this approach were wrong, what would we expect to see? Are we seeing any of that?"

### Step 3: Pre-Mortem

Imagine it's six months from now and this decision failed. Work backward:

> "This failed because [reason]. The warning signs we ignored were [signs]. The assumption that broke was [assumption]."

Generate at least three plausible failure scenarios:

1. **Technical failure** — it doesn't work as expected
2. **Adoption failure** — it works but nobody uses it / changes nothing
3. **Opportunity cost** — it works but we should have done something else

### Step 4: Surface Hidden Assumptions

Every decision rests on unstated assumptions. Find them:

- What are we assuming about the user/customer?
- What are we assuming about the system/codebase?
- What are we assuming about timeline/resources?
- What are we assuming won't change?

For each:
```
Assumption: [what we're taking for granted]
Evidence: [what supports this]
Risk if wrong: [what happens]
Test: [how to validate before committing]
```

### Step 5: Decide

- **PROCEED** — no critical flaws found; decision strengthened
- **ADJUST** — issues surfaced that can be addressed; modify the approach
- **RECONSIDER** — fundamental problems revealed; back to solution space

> "PROCEED: The strongest counter-argument is [X], but it's addressed by [Y]. The key assumption is [Z], which we've validated by [how]."

### ADR Generation

If the decision is a **one-way door** and you recommend PROCEED or ADJUST, offer to create an Architecture Decision Record. The dissent report maps directly:

| Dissent Section | ADR Section |
|-----------------|-------------|
| Decision under review | Title |
| Steel-Man Position | Context |
| Contrary Evidence + Pre-Mortem | Options Considered |
| Hidden Assumptions | Consequences |
| Decision + Reasoning | Decision |

Write to `docs/adr/NNNN-<decision-slug>.md` if accepted.

## Output Format

```
## Dissent Report

**Decision under review:** [what's being challenged]
**Stakes:** [why this matters]
**Confidence before dissent:** [HIGH/MEDIUM/LOW]

### Steel-Man Position
[The strongest version of the current approach]

### Contrary Evidence
1. [Evidence point 1]
2. [Evidence point 2]
3. [Evidence point 3]

### Pre-Mortem Scenarios
1. **[Failure mode]:** [How this could fail]
2. **[Failure mode]:** [How this could fail]
3. **[Failure mode]:** [How this could fail]

### Hidden Assumptions
| Assumption | Evidence | Risk if Wrong | Test |
|------------|----------|---------------|------|
| [Assumption 1] | [Evidence] | [Risk] | [Test] |

### Decision

**Recommendation:** [PROCEED / ADJUST / RECONSIDER]
**Reasoning:** [Why]
**If ADJUST:** [Specific modifications]
**Confidence after dissent:** [HIGH/MEDIUM/LOW]
**Create ADR?** [Yes - offer path / No - not a one-way door]
```

## Examples

### Example 1: Architecture Decision

```
/dissent

We're about to adopt microservices for the payments system. Team agrees.
```

**Output:**
```
## Dissent Report

**Decision under review:** Microservices architecture for payments
**Stakes:** 6+ month commitment, affects entire system
**Confidence before dissent:** HIGH (team unanimous)

### Steel-Man Position
Microservices will allow independent scaling, independent deployment,
and fault isolation so one service failure doesn't bring down payments.

### Contrary Evidence
1. We have 4 engineers. Netflix had 100+ when they went microservices.
2. Our 45-minute pipeline gets multiplied by N services.
3. The "independent teams" benefit requires teams we don't have.

### Pre-Mortem Scenarios
1. **Distributed complexity:** 60% of time debugging cross-service issues.
2. **Operational overhead:** Can't hire SREs fast enough. Nobody understands full architecture.
3. **Premature optimization:** Scaling benefit never materializes — not enough users.

### Hidden Assumptions
| Assumption | Evidence | Risk if Wrong | Test |
|------------|----------|---------------|------|
| Need independent scaling | None - projected | Waste of complexity | Check actual load patterns |
| Team will grow to support this | Hiring plan exists | Stuck with complexity, no staff | Validate funding/timeline |
| Network latency acceptable | Not measured | Payment failures | Prototype and benchmark |

### Decision

**Recommendation:** RECONSIDER
**Reasoning:** Benefits assume scale and team size we don't have.
A modular monolith gives code organization benefits without operational complexity.
**Confidence after dissent:** HIGH (clear mismatch)
**Create ADR?** No - reconsidering, not committing
```

### Example 2: Feature Decision

```
/dissent

Shipping a recommendation system based on purchase history. Built over 3 sprints.
```

**Output:**
```
## Dissent Report

**Decision under review:** Ship purchase-history recommendation system
**Stakes:** 3 sprints invested, prominent homepage placement
**Confidence before dissent:** MEDIUM

### Steel-Man Position
Users who bought X often want Y. We have the purchase data. Model performs well in testing.

### Contrary Evidence
1. Testing used historical data — real-time behavior may differ.
2. 10K users vs Amazon's billions of data points.
3. Competitor tried this, removed it after 6 months (no lift).

### Pre-Mortem Scenarios
1. **Cold start:** New users see garbage recommendations, leave.
2. **Filter bubble:** Recommends what users already buy, no discovery.
3. **Wrong metric:** Optimized for clicks, needed revenue.

### Hidden Assumptions
| Assumption | Evidence | Risk if Wrong | Test |
|------------|----------|---------------|------|
| Purchase history predicts intent | Industry standard | Wasted real estate | A/B test vs "popular items" |
| 10K users is enough data | None | Poor recommendations | Check literature on minimum viable data |
| Homepage placement is right | None | Users ignore it | Heatmap existing traffic |

### Decision

**Recommendation:** ADJUST
**Modifications:**
1. Ship with A/B test against "popular items" baseline
2. Fallback to curated picks for users with <5 purchases
3. Define success metric (revenue lift, not clicks) before launch

**Confidence after dissent:** MEDIUM (reduced risk with A/B)
**Create ADR?** Yes - `docs/adr/0012-recommendation-system-rollout.md`
```

## Session Persistence

This skill can persist context to `.oh/<session>.md`.

**If session name provided** (`/dissent auth-decision`):
- Reads/writes `.oh/auth-decision.md` directly

**If no session name provided** (`/dissent`):
- After producing the dissent report, offer to save it

**Reading:** Check for existing session file. Read **Aim**, **Problem Statement**, **Solution Space** to understand the decision being challenged.

**Writing:** After producing the dissent report:

```markdown
## Dissent
**Updated:** <timestamp>
**Decision:** [PROCEED | ADJUST | RECONSIDER]

[dissent report content]
```

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Produces dissent report for manual review. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for context on the decision
- Writes dissent report to the session file

### With Open Horizons MCP
- Queries past decisions on similar topics
- Retrieves relevant guardrails and tribal knowledge
- Logs dissent decision for future reference

### With RNA MCP (repo-native-alignment)
- `oh_search_context("risks and constraints for [area]", artifact_types: ["guardrail", "metis"])` to ground dissent
- `outcome_progress` to assess whether the approach serves the outcome
- `oh_record_metis` to capture dissent findings as durable learning

## Position in Framework

**Combines with:** `/solution-space` (challenge the recommendation), `/problem-statement` (challenge the framing), `/execute` (before one-way doors).
**Leads to:** PROCEED (continue with confidence), ADJUST (modify approach), or RECONSIDER (back to solution-space).
**This is not a phase:** Dissent is an overlay you invoke when stakes are high.

---

**Remember:** Dissent is not doubt. It's the discipline of seeking truth before comfort.
