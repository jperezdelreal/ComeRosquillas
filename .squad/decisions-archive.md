# Squad Decisions — Archive

Archived entries older than 14 days. See decisions.md for active decisions.

---

## Archived Decisions (2026-03-13 to 2026-03-14)

### Cross-Repo Coordination Rule

**Date:** 2026-03-13T20:12Z  
**Decided by:** jperezdelreal (via SS Coordinator)  
**Tier:** T0 (Core Rule)  

**Decision: No Cross-Repo Direct Git Commits**

**What:** No repo may make direct git commits to another repo's branch. ALL cross-repo communication goes through GitHub Issues. Each repo's Squad session owns its git state exclusively.

**Why:** Prevents push conflicts when multiple Ralph Go sessions run concurrently across federated squads.

**API Contract:** Use `gh issue create`, `gh issue comment`, `gh pr review` — NEVER `gh api repos/.../contents -X PUT`.

**Status:** ✅ Active

### Ralph Refueling Behavior

**Date:** 2026-03-13T19:58Z  
**Decided by:** jperezdelreal (via SS Coordinator)  
**Tier:** T1 (System Behavior)

**Decision: Proactive Roadmap Issue Creation on Empty Board**

**What:** When Ralph detects an empty board (no open issues with squad labels, no open PRs), instead of idling:
1. Check if a "Define next roadmap" issue already exists
2. If none exists → create one with Lead assignment
3. If one exists → skip and report status

**Why:** Prevents the autonomous pipeline from fully stopping. Complements reactive workflow with proactive refueling.

**Implementation:** 
```bash
gh issue list --label roadmap --state open --limit 1
gh issue create --title "📋 Define next roadmap" --label roadmap --label "squad:{lead-name}"
```

**Status:** ✅ Active

### Strategic Direction Directive — 2026-03-13T20:44Z

**Date:** 2026-03-13T20:44Z  
**Captured by:** joperezd (via Copilot)  
**For:** Moe (Lead)

**Directive:** Lead should focus on strategic roadmap definition for issue #37. Prioritize vision and planning excellence.

**Status:** Active for sprint cycle

### User Directive — 2026-03-13T20:57Z

**Date:** 2026-03-13T20:57Z  
**Captured by:** joperezd (via Copilot)  
**For:** Team

**Directive:** Blanket merge approval for this session — the team has OK to merge all PRs without individual user approval.

**Status:** Active for session
