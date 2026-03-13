# Roadmap Strategy Decision

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Issue #37 — Define next roadmap after Sprint 1 completion

## Decision: Player Journey-Driven Roadmap

### Strategic Framework

The new roadmap is organized around **three phases of player engagement**, not just feature lists:

1. **Immediate Fun (Items 1-3):** Hook players in first 60 seconds
2. **Deep Engagement (Items 4-6):** Create mastery progression loop
3. **Social Virality (Items 7-10):** Turn players into evangelists

This structure ensures every feature serves a clear purpose in the player journey from first-time visitor → engaged player → returning champion → viral advocate.

---

## Phase 1: Immediate Fun

**Problem:** Most web game players bounce within 30 seconds if they don't understand what to do or experience immediate satisfaction.

**Solutions:**

### Item 1: Tutorial & Onboarding
**Why first:** Without this, all other features are wasted on players who never get past level 1. Mobile web games live or die by their first impression. The tutorial must be non-patronizing, skippable, and fast.

**Key insight:** Don't just tell — show and reward. Each tutorial step is interactive and immediately satisfying (move → eat donut → power-up → kill ghost → celebration).

### Item 2: Combo Multiplier
**Why second:** This is the "hook" for skilled play. Pac-Man's core genius was making risk (chasing ghosts during power-pellets) rewarding. Our combo system makes that risk-reward loop visceral with visual/audio feedback.

**Key insight:** Arcade games need "juice" — every action should feel amazing. Combo multipliers add that juice to ghost-eating, the most exciting part of gameplay.

### Item 3: Mobile-First Polish
**Why third:** 70%+ of traffic is mobile. If touch controls are frustrating, players leave. This item removes friction from the core interaction loop.

**Key insight:** Mobile isn't "desktop but smaller" — it needs haptic feedback, larger hit zones, full-screen mode, and portrait warnings.

---

## Phase 2: Deep Engagement

**Problem:** Players who beat the first few levels need a reason to keep playing. Repetition without progression kills retention.

**Solutions:**

### Item 4: Progressive Difficulty & Endless Mode
**Why:** Clear progression = player motivation. After level 8, we shift to "Endless Mode" where each level incrementally increases challenge. Players always have a new peak to reach.

**Key insight:** Difficulty curves are exponential, not linear. Start easy, ramp slowly, then accelerate. The sweet spot is "one more try" — always feel close to beating your record.

### Item 5: Social Sharing
**Why:** Single-player games need social hooks to survive. Sharing scores turns individual achievement into competition. Competition creates engagement loops.

**Key insight:** Make sharing **effortless**. Web Share API on mobile = one tap. No login, no forms, just "Share Score" → post to Twitter/WhatsApp/etc.

### Item 6: Audio Upgrade
**Why:** Audio is 50% of arcade game feel. Current audio is functional; we need **delightful**. Pitch-varied donut chomps, spatial ghost sounds, dynamic music tempo.

**Key insight:** Players may not consciously notice great audio, but they'll feel the game is "better" in a way they can't articulate. That feeling drives retention.

---

## Phase 3: Social Virality

**Problem:** Even great games fade without reasons to return and share.

**Solutions:**

### Item 7: Ghost AI Debug Mode
**Why:** Advanced players want to understand and master the system. Showing AI behavior creates "aha!" moments and strategic depth.

**Key insight:** This doubles as a balancing tool for us. If players can see why a ghost caught them, frustration turns into learning. "Oh, Burns was in chase mode targeting my predicted position!"

### Item 8: Daily Challenge Mode
**Why:** Habit formation. Daily challenges create appointment mechanics — players return because **today's challenge is unique**. Fixed seeds enable fair competition.

**Key insight:** Mobile game retention depends on daily hooks. Rotate 7 challenge types so it never feels stale.

### Item 9: Performance Optimization
**Why:** 60fps is the difference between "feels good" and "feels great." Frame drops destroy arcade immersion, especially on mobile.

**Key insight:** Performance isn't a feature — it's a foundation. But it must be prioritized explicitly or it gets neglected. This item ensures we deliver on the arcade promise.

### Item 10: Leaderboard & Stats
**Why:** Endgame content. Players who've mastered gameplay need a metagame. Stats dashboards provide intrinsic motivation (beat your own records) and social motivation (climb the leaderboard).

**Key insight:** Even localStorage leaderboards create competition between friends sharing a device or bragging about ranks. Global leaderboard is optional but local suffices.

---

## What Changed From Previous Roadmap

**Old roadmap had:**
- Combo Multiplier ✅ (kept, elevated to #2)
- Daily Challenges ✅ (kept, moved to #8 for better timing)
- Ghost Visual Indicators ✅ (kept, reframed as debug mode, moved to #7)

**What's new:**
- Tutorial (#1) — **critical gap** in current game
- Mobile polish (#3) — addresses 70% of player base
- Endless Mode (#4) — creates long-term progression
- Social sharing (#5) — viral growth mechanism
- Audio upgrade (#6) — "juice" that makes game feel premium
- Performance pass (#9) — ensures smooth 60fps
- Leaderboard (#10) — endgame meta-progression

---

## Why This Order Matters

### Sprint 2 Focus (Items 1-5):
- Get onboarding right
- Add skill depth (combo)
- Optimize for mobile
- Create progression curve
- Enable viral sharing

**Result:** Game goes from "good demo" to "game people play and share"

### Sprint 3 Focus (Items 6-10):
- Polish audio feel
- Add advanced features (AI debug)
- Create daily habits (challenges)
- Optimize performance
- Build endgame (leaderboard)

**Result:** Game has retention hooks and feels professionally polished

---

## Success Metrics

Each roadmap item includes a **measurable success metric** so we know if it worked:

- Tutorial: Level 1 completion rate 60%+
- Combo: Ghost-chasing behavior increase 40%
- Mobile: Session length +30%
- Endless: 20%+ reach level 10+
- Sharing: 10%+ share rate
- Audio: A/B satisfaction test
- AI Debug: 5%+ usage (signals engaged players)
- Daily: 25%+ attempt weekly
- Performance: 60fps on iPhone SE
- Leaderboard: 2+ checks per session

These metrics guide iteration — if combo doesn't increase ghost-chasing, we tune the visual feedback until it does.

---

## Architectural Implications

### Module Additions Required:
- `js/ui/tutorial.js` — onboarding overlay system
- `js/ui/share-menu.js` — social sharing integration
- `js/ui/daily-challenge.js` — challenge mode controller
- `js/ui/stats-dashboard.js` — leaderboard & stats UI
- `manifest.json` — PWA configuration for mobile

### Existing Modules Extended:
- `js/game-logic.js` — combo tracking, endless mode, challenge rules
- `js/engine/renderer.js` — particle effects, AI debug overlay, polish animations
- `js/engine/audio.js` — pitch variation, spatial audio, ducking
- `js/engine/high-scores.js` — stats tracking, daily leaderboard
- `js/ui/settings-menu.js` — AI debug toggle, advanced settings

### Design Pattern Consistency:
- All UI modules follow `js/ui/` pattern established by Lenny
- Settings persist via localStorage (established convention)
- Procedural audio only (no external files)
- No frameworks, no build tools (vanilla JS/Canvas commitment)
- Modular separation maintained (config/logic/engine/ui boundaries)

---

## Team Assignment Strategy

**Barney (Game Dev):**
- Combo Multiplier (#2)
- Progressive Difficulty (#4)
- Daily Challenge logic (#8)

**Lenny (UI Dev):**
- Tutorial system (#1)
- Mobile polish (#3)
- Social sharing UI (#5)
- Stats dashboard (#10)

**Nelson (Tester):**
- Performance optimization (#9)
- Cross-browser/device testing
- Metrics validation

**Moe (Lead):**
- Audio upgrade (#6) — requires Web Audio API expertise
- AI debug mode (#7) — architectural oversight needed
- Code review for all items

---

## What We're NOT Doing (And Why)

### Multiplayer
**Why not:** Adds 10x complexity (server, networking, latency) for uncertain value. Focus on perfecting single-player first.

### Procedural Maze Generation
**Why not:** Hand-crafted mazes are better balanced and more memorable. Springfield/Nuclear Plant/Kwik-E-Mart/Moe's already provide variety.

### Character Unlocks / Cosmetics
**Why not:** Scope creep. The Simpsons IP is the aesthetic identity — no need for skins. Could revisit post-launch if retention is high.

### Backend / Global Leaderboard
**Why not:** Adds hosting costs and privacy concerns. localStorage leaderboards suffice for MVP. Can add later if demand is high.

---

## Iteration Philosophy

This roadmap is **directional, not prescriptive**. If playtesting reveals:
- Tutorial too slow → simplify
- Combo system too complex → reduce visual noise
- Mobile controls still frustrating → iterate until smooth

We adapt. The success metrics tell us when a feature is done.

---

## Final Notes

The old roadmap was functionally complete but strategically shallow. It listed features without explaining **why they matter** or **how they connect** to player psychology.

This roadmap is built on arcade game design principles:
1. **Immediate satisfaction** (hook in 30 seconds)
2. **Skill mastery** (depth for experts)
3. **Social competition** (reasons to share and return)

Every item serves one of these pillars. Nothing is here just because it's "cool" — everything has a job to do in the player journey.

---

**Status:** Active — ready for team to execute  
**Next Review:** End of Sprint 2 (retrospective on Items 1-5 outcomes)
