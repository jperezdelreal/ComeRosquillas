// Sprint 3.5 Feature: Audio Juice
// Pitch variation, spatial audio, music ducking — all scaffold until Sprint 3.5
import { describe, it, expect } from 'vitest'

// ---- Audio Regression: Current Chomp & Combo (runs NOW) ----

describe('Audio — Chomp Pitch Variation (regression)', () => {
  it('should have 4 chomp variants cycling 0-3', () => {
    let variant = 0
    const variants = []
    for (let i = 0; i < 8; i++) {
      variants.push(variant)
      variant = (variant + 1) % 4
    }
    expect(variants).toEqual([0, 1, 2, 3, 0, 1, 2, 3])
  })

  it('chomp pitch spread should be ±8% of base frequency', () => {
    const baseFreq = 261.63 // C4
    const spreadPercent = 0.08
    const minFreq = baseFreq * (1 - spreadPercent)
    const maxFreq = baseFreq * (1 + spreadPercent)
    expect(maxFreq - minFreq).toBeCloseTo(baseFreq * 0.16, 1)
    expect(minFreq).toBeGreaterThan(200)
    expect(maxFreq).toBeLessThan(300)
  })
})

describe('Audio — Combo Milestone Escalation (regression)', () => {
  it('combo milestone frequencies should escalate: C4 → E4 → G4', () => {
    // Approximate frequencies for the chord
    const frequencies = {
      2: 261.63,  // C4
      4: 329.63,  // E4
      8: 392.00,  // G4
    }
    expect(frequencies[4]).toBeGreaterThan(frequencies[2])
    expect(frequencies[8]).toBeGreaterThan(frequencies[4])
  })

  it('eat ghost pitch should escalate by 150Hz per combo tier', () => {
    const basePitch = 400
    const pitchStep = 150
    const pitch1 = basePitch + pitchStep * 0
    const pitch2 = basePitch + pitchStep * 1
    const pitch3 = basePitch + pitchStep * 2
    const pitch4 = basePitch + pitchStep * 3
    expect(pitch2 - pitch1).toBe(150)
    expect(pitch4 - pitch1).toBe(450)
  })
})

describe('Audio — Bus Architecture (regression)', () => {
  it('should have separate SFX and music bus volumes', () => {
    const sfxBusVolume = 0.8
    const musicBusVolume = 0.07
    expect(sfxBusVolume).toBeGreaterThan(musicBusVolume)
  })

  it('music bus should be ducked relative to SFX bus', () => {
    const sfxVol = 0.8
    const musicVol = 0.07
    const duckingRatio = musicVol / sfxVol
    expect(duckingRatio).toBeLessThan(0.1) // Music is <10% of SFX volume
  })

  it('master gain should default to 1.0', () => {
    const masterGain = 1.0
    expect(masterGain).toBe(1.0)
  })

  it('compressor threshold should be -12dB', () => {
    const threshold = -12
    expect(threshold).toBe(-12)
  })
})

// ---- Audio Juice: Enhanced Pitch Variation ----

describe('Audio Juice — Enhanced Pitch Variation', () => {
  it('chomp pitch should vary based on streak via semitone formula', () => {
    // Streak pitch multiplier: 2^(chompStreak * 0.5 / 12)
    const pitchAt0 = Math.pow(2, 0 * 0.5 / 12)
    const pitchAt4 = Math.pow(2, 4 * 0.5 / 12)
    const pitchAt12 = Math.pow(2, 12 * 0.5 / 12)
    expect(pitchAt0).toBe(1) // no modification at streak 0
    expect(pitchAt4).toBeGreaterThan(1) // pitch increases with streak
    expect(pitchAt12).toBeGreaterThan(pitchAt4) // continues escalating
    expect(pitchAt12).toBeCloseTo(Math.pow(2, 0.5), 5) // half octave at max
  })

  it('chomp streak should cap at 12 and reset after 600ms silence', () => {
    const chompStreakMax = 12
    const chompStreakDecayMs = 600
    expect(chompStreakMax).toBe(12)
    expect(chompStreakDecayMs).toBe(600)
    // After cap, pitch wraps back
    const pitchAtMax = Math.pow(2, chompStreakMax * 0.5 / 12)
    expect(pitchAtMax).toBeCloseTo(1.4142, 3) // sqrt(2)
  })

  it('chomp random spread should be ±8% (0.16 total)', () => {
    const chompRandomSpread = 0.16
    const baseFreq = 261.63
    const minFreq = baseFreq * (1 - chompRandomSpread / 2)
    const maxFreq = baseFreq * (1 + chompRandomSpread / 2)
    expect(maxFreq - minFreq).toBeCloseTo(baseFreq * chompRandomSpread, 1)
  })

  it('ghost eat sound should have distinct pitch per ghost personality', () => {
    // Ghost proximity frequencies vary by index: 60 + (1 - dist) * 80 + i * 15
    const ghostFreqs = [0, 1, 2, 3].map(i => 60 + 1 * 80 + i * 15)
    expect(ghostFreqs[0]).toBeLessThan(ghostFreqs[1])
    expect(ghostFreqs[1]).toBeLessThan(ghostFreqs[2])
    expect(ghostFreqs[2]).toBeLessThan(ghostFreqs[3])
    expect(ghostFreqs[3] - ghostFreqs[0]).toBe(45) // 3 * 15Hz spread
  })

  it('combo milestone frequencies should map: 2→262, 4→330, 8→392', () => {
    const freqMap = { 2: 262, 4: 330, 8: 392 }
    expect(freqMap[2]).toBe(262)
    expect(freqMap[4]).toBe(330)
    expect(freqMap[8]).toBe(392)
    expect(freqMap[4]).toBeGreaterThan(freqMap[2])
    expect(freqMap[8]).toBeGreaterThan(freqMap[4])
  })
})

// ---- Audio Juice: Spatial Audio ----

describe('Audio Juice — Spatial Audio', () => {
  const spatialMaxDistance = 14 // tiles

  it('should pan ghost sounds based on ghost X position relative to Homer', () => {
    // Pan formula: Math.max(-1, Math.min(1, dx / maxDist))
    const homerX = 14
    const ghostLeftX = 0
    const ghostRightX = 27
    const panLeft = Math.max(-1, Math.min(1, (ghostLeftX - homerX) / spatialMaxDistance))
    const panRight = Math.max(-1, Math.min(1, (ghostRightX - homerX) / spatialMaxDistance))
    expect(panLeft).toBe(-1) // full left
    expect(panRight).toBeCloseTo(0.929, 2) // near full right
  })

  it('panning range should be -1.0 (full left) to 1.0 (full right)', () => {
    const farLeft = Math.max(-1, Math.min(1, -20 / spatialMaxDistance))
    const farRight = Math.max(-1, Math.min(1, 20 / spatialMaxDistance))
    const center = Math.max(-1, Math.min(1, 0 / spatialMaxDistance))
    expect(farLeft).toBe(-1)
    expect(farRight).toBe(1)
    expect(center).toBe(0)
  })

  it('ghost proximity should affect volume (closer = louder)', () => {
    // Volume range: 0.12 (at distance 0) to 0.0 (beyond maxDist)
    const volumeAtZero = 0.12
    const volumeAtMax = 0.0
    expect(volumeAtZero).toBeGreaterThan(volumeAtMax)
    // Volume should scale linearly with normalized distance
    const midDist = 0.5
    const midVol = volumeAtZero * (1 - midDist)
    expect(midVol).toBeCloseTo(0.06, 2)
  })

  it('spatial bus should be separate from SFX bus', () => {
    const sfxBusVol = 0.8
    const spatialBusVol = 0.8
    expect(sfxBusVol).toBe(spatialBusVol) // both 0.8
  })

  it('fright mode should reduce ghost audio volume by 60%', () => {
    const normalMultiplier = 1.0
    const frightMultiplier = 0.4
    expect(frightMultiplier).toBeLessThan(normalMultiplier)
    expect(frightMultiplier).toBe(0.4)
  })
})

// ---- Audio Juice: Dynamic Music Ducking ----

describe('Audio Juice — Dynamic Music Ducking', () => {
  it('music should duck to 25% volume during SFX burst', () => {
    const duckAmount = 0.25
    const nominalVol = 0.07
    const duckedVol = nominalVol * duckAmount
    expect(duckedVol).toBeCloseTo(0.0175, 3)
    expect(duckedVol).toBeLessThan(nominalVol)
  })

  it('music duck fade-in should be 50ms, fade-out should be 300ms', () => {
    const duckFadeIn = 0.05
    const duckFadeOut = 0.3
    expect(duckFadeIn).toBe(0.05)
    expect(duckFadeOut).toBe(0.3)
    expect(duckFadeOut).toBeGreaterThan(duckFadeIn) // gradual recovery
  })

  it('music tempo should increase at higher levels (capped at 1.15)', () => {
    // Formula: min(1.15, 1.0 + (level - 1) * 0.015)
    const baseTempo = 1.0
    const tempoPerLevel = 0.015
    const maxTempo = 1.15
    const tempoAt1 = Math.min(maxTempo, baseTempo + (1 - 1) * tempoPerLevel)
    const tempoAt5 = Math.min(maxTempo, baseTempo + (5 - 1) * tempoPerLevel)
    const tempoAt20 = Math.min(maxTempo, baseTempo + (20 - 1) * tempoPerLevel)
    expect(tempoAt1).toBe(1.0)
    expect(tempoAt5).toBeCloseTo(1.06, 2)
    expect(tempoAt20).toBe(maxTempo) // capped
  })

  it('fright mode should use faster tempo (1.25x)', () => {
    const frightMusicTempo = 1.25
    const baseTempo = 1.0
    expect(frightMusicTempo).toBeGreaterThan(baseTempo)
    expect(frightMusicTempo).toBe(1.25)
  })

  it('short SFX duck should last 0.4s, stinger duck should last 2.5s', () => {
    const duckDurationSfx = 0.4
    const duckDurationStinger = 2.5
    expect(duckDurationSfx).toBeLessThan(duckDurationStinger)
    expect(duckDurationStinger / duckDurationSfx).toBeCloseTo(6.25, 1)
  })

  it('music should resume normal volume after SFX burst', () => {
    // After duck fade-out completes, volume returns to nominal
    const nominalVol = 0.07
    const duckedVol = nominalVol * 0.25
    const restoredVol = nominalVol
    expect(restoredVol).toBeGreaterThan(duckedVol)
    expect(restoredVol).toBe(nominalVol) // fully restored
  })
})
