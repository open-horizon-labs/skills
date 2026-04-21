---
name: ship
description: Deliver code to users. Optimize the path from merged code to working install. Use when execution is complete and you need to get changes into users' hands.
---

# /ship

Optimize the delivery path from completed work to working install. **When execution is cheap, delivery is the work.**

Ship is the final step of the Execution phase. Code that isn't in users' hands isn't delivering value.

## When to Use

Invoke `/ship` when execution is complete, tests pass, review is done, and you need to get changes to users.

**Do not use when:** You're still building. Ship is for completed work.

## The Ship Process

### Step 1: Identify the Delivery Path

Map the path from code to working install:

> "The delivery path for this change is: [local] → [PR/review] → [merge] → [CI/CD] → [staging/prod] → [user install]."

Be specific. Name each step and who/what owns it.

### Step 2: Assess the Delivery-Path Tax

The delivery-path tax is friction that slows velocity. Identify where time is lost across: review queue, merge conflicts/stability, gate/scan time (serial vs parallel, flaky), approval bottlenecks, deploy duration, rollback readiness, and manual steps.

### Step 3: Execute the Ship

#### With CI/CD Context
1. **Reference the pipeline** — point to the specific build/deploy configuration
2. **Trigger the appropriate workflow** — label PRs, push to deploy branches, etc.
3. **Monitor the pipeline** — watch for failures, report status
4. **Verify deployment** — confirm the change is live

#### Without CI/CD Context
1. **List deployment steps** — what needs to happen in order
2. **Execute each step** — or provide commands to execute
3. **Verify each stage** — confirm success before proceeding
4. **Report final status** — confirm user-facing change is live

### Step 4: Post-Ship Verification

Shipping isn't done until you verify:

- **Is it running?** — deployed and executing
- **Is it working?** — intended behavior is present
- **Is it reachable?** — users can access/use it
- **Were the promised characteristics delivered?** — shipped result matches the declared success criteria from `/execute`

Create ad-hoc verification tests if needed — the point is confidence, not permanent infrastructure. Verification ties back to what the work claimed it would deliver, not only whether deployment completed.

## Output Format

```
## Ship Report

**Shipped:** [what was shipped]
**Target:** [where it was shipped to]
**Path:** [the delivery path taken]

### Delivery-Path Tax Identified
- [Friction point 1]: [time/effort cost]
- [Friction point 2]: [time/effort cost]

### Ship Actions Taken
1. [Action 1 - result]
2. [Action 2 - result]

### Verification
- [x] Deployed successfully
- [x] Running in target environment
- [x] User-facing functionality confirmed

### Delivered Characteristics Validation
- [x] [Declared criterion/characteristic 1]
- [ ] [Declared criterion/characteristic 2, if not yet verified]

### Recommendations
[Any suggestions for reducing delivery-path tax in future]
```

## Examples

### Example 1: Shipping with CI/CD Pipeline

```
/ship

PR #247 is approved. Need to get it deployed to production.
```

**Output:**
```
## Ship Report

**Shipped:** PR #247 - Add dark mode toggle
**Target:** Production (users)
**Path:** Approved PR → Merge → CI build → Staging auto-deploy → Prod deploy

### Delivery-Path Tax Identified
- CI build: 8 minutes
- Prod approval: Waiting (manual gate)

### Ship Actions Taken
1. Merged PR #247 to main - success
2. CI build triggered automatically - passed (8m)
3. Staging deploy completed - verified working
4. Prod deploy completed after approval

### Verification
- [x] Build passed CI
- [x] Staging environment shows dark mode toggle
- [x] Production deployment complete
- [x] User-facing: toggle visible in settings

### Delivered Characteristics Validation
- [x] Dark mode toggle is visible in settings
- [x] Theme change persists after reload in staging/prod verification

### Recommendations
- Consider auto-deploy to prod for UI-only changes (low risk)
```

### Example 2: Identifying Delivery-Path Tax

```
/ship

We've had 3 PRs sitting for a week. What's blocking us?
```

**Output:**
```
## Ship Report

**Shipped:** Analysis only (no deployment)
**Target:** Identifying delivery friction

### Delivery-Path Tax Identified
- Review time: 5-7 days average (CRITICAL)
  - Only 2 reviewers for 8 developers
- Security scan: 45 minutes per PR (HIGH)
  - Runs serially, not parallel
- Merge conflicts: 2 of 3 PRs have conflicts

### Recommendations
1. **Immediate:** Resolve merge conflicts on PRs #251, #253
2. **This week:** Add reviewers or implement AI pre-review
3. **This sprint:** Move security scan to run only on merge-ready PRs
```

## Session Persistence

This skill can persist context to `.oh/<session>.md`.

**If session name provided** (`/ship auth-refactor`):
- Reads/writes `.oh/auth-refactor.md` directly

**If no session name provided** (`/ship`):
- After producing the ship report, offer to save it

**Reading:** Check for existing session file. Read **Aim**, **Solution Space**, and **Execute** status, including declared success criteria or deliverable characteristics.

**Writing:** After shipping, write deployment status and delivered-characteristics validation:

```markdown
## Ship
**Updated:** <timestamp>
**Status:** [staged | deployed | verified | rolled-back]

[shipping notes, verification results, delivered-characteristics validation, etc.]
```

## Adaptive Enhancement

### Base Skill (prompt only)
Works anywhere. Produces ship checklist for manual execution. No persistence.

### With .oh/ session file
- Reads `.oh/<session>.md` for context on what was built
- Writes deployment status to the session file
- `/review` can check if shipping achieved the aim

### With CI/CD Configuration
- Reads pipeline definitions (GitHub Actions, CircleCI, etc.)
- References specific workflow files
- Triggers appropriate pipelines via labels or commands

### With Full Pipeline Integration (MCP tools)
- Directly triggers deployments
- Monitors pipeline progress in real-time
- Queries deployment status from infrastructure

## Position in Framework

**Comes after:** `/execute` (the work is done, now deliver it).
**Leads to:** `/review` (did the shipped change achieve the aim?), then back to `/aim`.
**This is the end of the line:** Ship is where code becomes value.

## Key Vocabulary

- **Delivery Path:** The journey from merged code to working install
- **Delivery-Path Tax:** Friction that slows delivery (review time, merge time, gate time, approval time)
- **Working Install:** The code is running and users can interact with it

---

**Remember:** Code that isn't shipped isn't delivering value. Optimize the path, reduce the tax, get changes to users.
