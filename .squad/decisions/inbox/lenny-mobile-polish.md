# Mobile Polish Decisions

**Date:** 2026-07-24
**Author:** Lenny (UI Dev)
**Context:** Issue #44 — Mobile-First Polish Pass

## Decision: Hide Bottom Bar on Touch Devices

**What:** Changed `#bottomBar` from `font-size: 12px` to `display: none` on touch devices.

**Why:** Bottom bar shows keyboard shortcuts (P, M, S, ENTER) which are irrelevant on mobile. Hiding it reclaims vertical space for the game canvas. Touch controls (D-pad, pause, mute, fullscreen buttons) replace all bottom bar functionality.

**Risk:** None — all actions are accessible via touch buttons. Settings accessible via fixed settings button.

## Decision: Pause Button Repositioned to Right-20px

**What:** Moved pause from `right: 80px` to `right: 20px` (rightmost). Mute shifted to `right: 80px`, new fullscreen button at `right: 140px`.

**Why:** Pause is the most-used button during gameplay. Top-right corner is the natural right-thumb resting position. Previous position required more stretch.

## Decision: Haptic Patterns for Event Differentiation

**What:** Three distinct vibration patterns for three game events:
- Ghost collision (death): `[50, 30, 80]` — strong, alarming
- Power pellet: `[15, 10, 25]` — satisfying, moderate
- Ghost eaten: `[20, 10, 30]` — rewarding, lighter than death

**Why:** Different patterns let players feel the game state without looking at the screen. Death must feel different from a reward. Patterns were chosen to be short enough not to be annoying on repeat.

## Decision: SVG Icons for PWA Manifest

**What:** Used SVG icons instead of PNG for the PWA manifest.

**Why:** SVGs scale to any resolution, are smaller in file size, and don't need a build step to generate. Modern browsers support SVG in manifests. If PNG support is needed for older Android WebViews, they can be generated later.

**Status:** Active — implemented in PR #49
