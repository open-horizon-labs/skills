---
name: plan
description: Transform session context into trackable work items. Reads aim, problem-space, and solution-space from session file, decomposes into right-sized issues. Outputs to GitHub by default.
---

# /plan

Transform your planning work into trackable issues. Plan bridges solution-space to execution by decomposing the selected approach into right-sized work items.

**This is not investigation.** Plan assumes you've already done the thinking. It reads your session file and transforms that understanding into actionable issues. If you haven't run `/aim`, `/problem-space`, or `/solution-space`, do that first.

## When to Use

Invoke `/plan` when:

- **Solution is chosen** - You've run `/solution-space` and picked an approach
- **Ready to track work** - You want issues, not just a plan in your head
- **Handoff needed** - Others (or future you, or agents) will execute the work
- **Scope is understood** - The session file contains sufficient context

**Do not use when:**
- Still exploring options - use `/solution-space` first
- Problem is unclear - use `/problem-space` first
- No session file exists - nothing to transform

## The Plan Process

### Step 1: Read Session Context

Plan reads `.oh/<session>.md` and extracts:

```
From session file:
- Aim: [the behavior change we want]
- Problem Statement: [how we framed the problem]
- Problem Space: [constraints, terrain, assumptions]
- Solution Space: [selected approach, trade-offs accepted]
```

If any section is missing, Plan will note what's absent and proceed with available context. If solution-space is missing, stop and run `/solution-space` first.

### Step 2: Decompose the Solution

Break the selected approach into work units. Apply the same sizing heuristics as task planning:

**Right-sized issues are:**
- **1-4 hours of focused work** - Not too big, not trivial
- **Independently testable** - Can verify without other issues complete
- **Self-contained** - All context needed to start work
- **Clear done state** - Obvious when complete

**Decomposition signals:**

| Signal | Action |
|--------|--------|
| Multiple modules with distinct concerns | Split by module |
| Mix of backend and frontend | Consider splitting |
| Different risk profiles | Separate risky from routine |
| Clear dependency chain | Create linked issues |
| Single coherent change | Keep as one issue |

### Step 3: Enrich with Context

Each issue gets context from the session:

- **Goal** from the aim and problem statement
- **Context** from problem-space (constraints, terrain)
- **Acceptance criteria** derived from solution-space trade-offs
- **Notes** from assumptions and things to watch

### Step 4: Output Issues

Default target is GitHub (`gh` CLI). Create issues with the `planned` label:

```bash
# Ensure label exists
gh label create planned --description "Created via /plan skill" --color "0E8A16" 2>/dev/null || true

# Create issue
gh issue create --title "<title>" --label "planned" --body "$(cat <<'EOF'
## Goal

<from aim + problem statement>

## Context

<from problem-space: constraints, terrain, relevant assumptions>

## Acceptance Criteria

- [ ] Criterion 1 (specific, testable)
- [ ] Criterion 2
- [ ] Criterion 3

## Trade-offs Accepted

<from solution-space: what we're knowingly giving up>

## Notes

<edge cases, things to watch, links to related issues>
EOF
)"
```

For issues with dependencies, include:
```
**Depends on:** #N (description)
```

## Output Targets

### GitHub (default)

Uses `gh issue create`. Requires `gh` CLI authenticated.

```
/plan auth-refactor              # Creates GitHub issues
/plan auth-refactor --target gh  # Explicit (same as default)
```

### Future Targets

The decomposition logic is target-agnostic. Future extensions:

```
/plan auth-refactor --target jira    # Create Jira tickets
/plan auth-refactor --target linear  # Create Linear issues
/plan auth-refactor --target md      # Output markdown only (no API calls)
```

To add a target, implement the output step while reusing decomposition.

## Output Format

When plan completes:

```
## Plan Output

**Session:** <session-name>
**Target:** GitHub
**Issues Created:** N

### Issues

1. **#123: <title>** - <one-line summary>
   - Depends on: (none)

2. **#124: <title>** - <one-line summary>
   - Depends on: #123

3. **#125: <title>** - <one-line summary>
   - Depends on: #123, #124

### Execution Order

Suggested order based on dependencies:
1. #123 (foundation)
2. #124 (can start after #123)
3. #125 (integration, after both)

### Session Updated

Added `## Plan` section to .oh/<session>.md with issue links.
```

## Decomposition Examples

### Example 1: Single Coherent Change

**Session solution-space says:**
> Selected: Add input validation for empty strings
> Level: Band-Aid
> Trade-offs: Doesn't fix root cause, addresses symptom

**Plan output:**
```
1 issue created:

#42: Add empty string validation to user input handlers
- Goal: Prevent empty strings from causing silent failures
- Criteria: Empty strings rejected with clear error at all 3 entry points
- Trade-off: Root cause (downstream processors) not addressed
```

### Example 2: Multi-part Feature

**Session solution-space says:**
> Selected: Add dark mode theming system
> Level: Reframe
> Trade-offs: Slightly changes UX, requires theme toggle discoverability

**Decomposition:**
```
3 issues created:

#43: Add user preferences API with theme support
- Foundation: GET/POST /api/preferences with theme field
- No dependencies

#44: Implement dark mode CSS system
- CSS custom properties for light/dark variants
- Depends on: #43 (needs preferences to persist)

#45: Add theme toggle and wire to preferences
- Toggle component in settings, applies theme on load
- Depends on: #43, #44
```

### Example 3: Risky + Routine Split

**Session solution-space says:**
> Selected: Migrate auth from sessions to JWT
> Level: Redesign
> Trade-offs: Breaking change for existing sessions, requires migration

**Decomposition:**
```
4 issues created:

#46: Add JWT token generation and validation
- New code, low risk, can be tested in isolation
- No dependencies

#47: Add JWT refresh token flow
- Depends on: #46

#48: Migrate auth endpoints from session to JWT
- Higher risk: changes existing behavior
- Depends on: #46, #47

#49: Add session-to-JWT migration for existing users
- Highest risk: data migration
- Depends on: #48
- Note: Consider feature flag for gradual rollout
```

## Session Persistence

**Required:** Plan requires a session name. It reads from `.oh/<session>.md`.

**Reading:** Extracts Aim, Problem Statement, Problem Space, Solution Space sections.

**Writing:** After creating issues, appends a Plan section:

```markdown
## Plan
**Updated:** <timestamp>
**Target:** GitHub
**Issues:** #43, #44, #45

### Decomposition Rationale
<why issues were split this way>

### Execution Order
1. #43 (foundation)
2. #44, #45 (can parallelize after #43)
```

## Adaptive Enhancement

### Base Skill (prompt only)
Cannot function without session context. Will prompt to run grounding skills first.

### With .oh/ session file
- Reads session for full context
- Writes plan output and issue links back to session
- `/execute` can read the plan for task sequence

### With .wm/ (working memory)
- Also reads `.wm/state.md` for additional context
- Session file and working memory complement each other

### With Open Horizons MCP
- Links created issues to endeavors in the graph
- Queries for related past plans and their outcomes
- Logs decomposition decisions

### With GitHub (default target)
- Creates issues via `gh` CLI
- Adds `planned` label for filtering
- Links dependencies between issues

## Leads To

After plan, typically:
- `/execute` - Work the issues (or hand off to agents)
- `miranda:oh-task` - Assign issues to Miranda agents
- Manual execution - Work issues yourself

## What NOT to Do

- Don't investigate the codebase - that's already done in problem-space
- Don't ask clarifying questions - those were answered earlier
- Don't create trivial issues - if it's <30 min, bundle it
- Don't skip the session file - plan without context is guessing

---

**Remember:** Plan is a transformer, not an investigator. It takes your thinking and makes it trackable. The quality of issues depends on the quality of the session. Garbage in, garbage out.
