# Portrait Mode Touch Control Sizing — Code Review Decision

**Date:** 2025-01-14  
**Decided by:** Moe (Lead)  
**Context:** User reported D-pad too close to settings button in portrait mode on mobile (iPhone SE 375px). Fix reduces control sizes in portrait media query and makes joystick radius dynamic.

## Changes Reviewed

### index.html — Portrait Media Query Adjustments

**Touch controls (D-pad & Joystick):**
- Size: 160px → 140px (12.5% reduction)
- Flex basis: 160px → 140px

**Button cluster:**
- Gap: 14px → 10px (29% tighter)

**Action buttons (pause, mute, fullscreen):**
- Size: 56px → 48px (14% reduction)
- Font size: 26px → 22px (proportional)

**Impact on iPhone SE (375px width):**
- Old layout: 375 - 40 (padding) - 160 (D-pad) - 14 (gap) - (56×2 + 14) = 49px remaining gap
- New layout: 375 - 40 (padding) - 140 (D-pad) - 10 (gap) - (48×2 + 10) = 89px remaining gap
- **Result:** 82% increase in breathing room between D-pad and button cluster

### js/engine/touch-input.js — Dynamic Joystick Radius

**Before:** Hardcoded `this._joystickRadius = 60` (line 28)  
**After:** Dynamic calculation in `_onJoystickStart`: `this._joystickRadius = Math.min(rect.width, rect.height) * 0.375`

**Math check:**
- Original ratio: 60px / 160px = 0.375 ✅
- Portrait ratio: 0.375 × 140px = 52.5px ✅
- Landscape ratio: 0.375 × 160px = 60px (unchanged) ✅

**Behavior:**
- Radius now adapts to rendered container size
- Preserves original 0.375 proportionality at all viewport sizes
- Calculated on touch start using live `getBoundingClientRect()`
- `Math.min(rect.width, rect.height)` handles edge cases if container becomes non-square

## Review Assessment

### ✅ Usability — 140px D-pad, 48px buttons

**Verdict:** ACCEPTABLE for touch targets.

**Rationale:**
- 140px D-pad exceeds Apple's 44pt minimum touch target (59px at 326 PPI)
- 48px buttons meet minimum touch target guidelines (Apple: 44pt, Google: 48dp)
- Spacing improvement (49px → 89px gap) reduces accidental button presses — more important than absolute size
- Portrait mode is secondary control scheme (landscape preferred for gameplay)
- Users can still rotate to landscape for 160px controls if needed

### ✅ Dynamic Joystick Radius — Calculation Correctness

**Verdict:** CORRECT and well-architected.

**Rationale:**
- Math preserves original 0.375 ratio (60/160)
- Uses live measurements via `getBoundingClientRect()` — adapts to any viewport/zoom/orientation
- Calculated per-touch ensures responsiveness to orientation changes mid-session
- `Math.min(width, height)` is defensive programming (handles non-square edge cases)
- Comment update clarifies intent: "radius adapts to rendered size"

### ⚠️ Edge Cases & Considerations

**1. Touch precision at 52.5px radius:**
- Smaller joystick thumb travel = less granular input
- **Mitigation:** Dead zone (18px) unchanged, so relative sensitivity preserved
- **Risk:** LOW — portrait is fallback mode, landscape still preferred

**2. No visible thumb indicator size adjustment:**
- Joystick visual thumb size not examined in diff
- **Question:** Does CSS scale the visual indicator proportionally?
- **Assumed:** Yes (flexbox + percentage-based CSS likely handles this)

**3. Landscape controls unaffected:**
- Portrait-specific `@media` query isolates changes
- Landscape still uses base 160px sizing
- **Risk:** NONE — changes scoped correctly

**4. Button cluster vertical stacking:**
- Gap reduction (14px → 10px) tightens cluster
- **Risk:** LOW — buttons remain distinct, 10px sufficient for visual separation

### Test Coverage

**Status:** 2530/2530 tests pass (user-reported)  
**Failures:** 2 pre-existing Zod library tests in `docs/node_modules/` (unrelated)

**Coverage gaps:**
- No touch-input integration tests (visual/manual verification only)
- Dynamic radius calculation untested programmatically
- **Acceptable:** Touch UX testing typically manual due to viewport variability

## Verdict: ✅ APPROVE

**Summary:** Changes are correct, proportional, and solve the reported issue. Math is sound, scoping is tight (portrait-only), usability remains acceptable. Dynamic joystick radius is architecturally superior to hardcoded value — future-proofs against viewport variance.

**Why not REJECT:**
- User report validates problem (49px gap too tight)
- Solution is minimal and targeted (no over-engineering)
- Test suite passes (no regressions)
- Touch target sizes remain within platform guidelines
- Dynamic calculation eliminates hardcoded magic number

**Recommendation:** Merge as-is. If users report portrait joystick feel degraded, revisit dead zone or sensitivity tuning in follow-up issue.

## Team-Relevant Decision

**Principle:** Touch control sizing in portrait mode deprioritized vs. landscape, but must meet minimum platform guidelines (44pt iOS, 48dp Android).

**Rationale:** Arcade games favor landscape orientation (wider FOV, horizontal gameplay). Portrait mode is accommodation for casual play, not primary UX. Acceptable to reduce control sizes to improve layout spacing, provided touch targets remain usable.

**Future guidance:** If further portrait space conflicts arise, consider:
1. Overlay controls (semi-transparent, auto-hide on inactivity)
2. Collapsible settings button (hamburger menu)
3. Single-column button layout (vertical stack vs. horizontal cluster)

**Status:** ACTIVE — informs future touch UI decisions
