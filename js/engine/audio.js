// ===========================
// Come Rosquillas - Audio System
// Simpsons-themed procedural sound effects and music
// All audio is procedural via Web Audio API — no external files
// ===========================

'use strict';

class SoundManager {
    constructor() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._initBuses();
        } catch (e) {
            this.ctx = null;
        }
        this._chompVariant = 0;
    }

    _initBuses() {
        // Compressor on master to prevent clipping
        this._compressor = this.ctx.createDynamicsCompressor();
        this._compressor.threshold.value = -12;
        this._compressor.knee.value = 10;
        this._compressor.ratio.value = 4;
        this._compressor.attack.value = 0.003;
        this._compressor.release.value = 0.15;
        this._compressor.connect(this.ctx.destination);

        this._masterGain = this.ctx.createGain();
        this._masterGain.gain.value = 1.0;
        this._masterGain.connect(this._compressor);

        this._sfxBus = this.ctx.createGain();
        this._sfxBus.gain.value = 0.8;
        this._sfxBus.connect(this._masterGain);

        this._musicBus = this.ctx.createGain();
        this._musicBus.gain.value = 0.07;
        this._musicBus.connect(this._masterGain);
    }

    play(type, data) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        switch (type) {
            case 'chomp': this._chomp(now); break;
            case 'power': this._powerUp(now); break;
            case 'eatGhost': this._eatGhost(now, data || 1); break;
            case 'die': this._doh(now); break;
            case 'start': this._simpsonsJingle(now); break;
            case 'levelComplete': this._levelComplete(now); break;
            case 'extraLife': this._extraLife(now); break;
            case 'gameOver': this._gameOver(now); break;
        }
    }

    // ==================== OSCILLATOR HELPERS ====================

    _osc(type, freq, start, end, vol) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.connect(g);
        g.connect(this._sfxBus);
        g.gain.value = vol || 0.12;
        if (typeof freq === 'number') {
            o.frequency.value = freq;
        } else {
            freq.forEach(([f, t]) => o.frequency.setValueAtTime(f, start + t));
        }
        g.gain.setValueAtTime(vol || 0.12, end - 0.02);
        g.gain.linearRampToValueAtTime(0, end);
        o.start(start);
        o.stop(end + 0.05);
    }

    _noise(start, duration, vol, filterFreq, filterType) {
        const len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const flt = this.ctx.createBiquadFilter();
        flt.type = filterType || 'lowpass';
        flt.frequency.value = filterFreq || 1000;
        const g = this.ctx.createGain();
        g.gain.value = vol || 0.05;

        src.connect(flt);
        flt.connect(g);
        g.connect(this._sfxBus);
        g.gain.setValueAtTime(vol || 0.05, start + duration - 0.02);
        g.gain.linearRampToValueAtTime(0, start + duration);
        src.start(start);
        src.stop(start + duration + 0.05);
    }

    // ==================== SFX: CHOMP (4 waka-waka variations) ====================

    _chomp(t) {
        const variant = this._chompVariant % 4;
        this._chompVariant++;
        const patterns = [
            [[300, 0], [150, 0.04], [250, 0.06]],
            [[350, 0], [180, 0.03], [280, 0.06]],
            [[260, 0], [130, 0.04], [220, 0.07]],
            [[320, 0], [160, 0.03], [270, 0.05]],
        ];
        // ±8% random pitch spread to prevent repetition fatigue
        const spread = 0.92 + Math.random() * 0.16;
        const freqs = patterns[variant].map(([f, time]) => [f * spread, time]);
        this._osc('sawtooth', freqs, t, t + 0.1, 0.1);
        this._noise(t, 0.06, 0.02, 2000, 'bandpass');
    }

    // ==================== SFX: POWER PELLET (Duff beer gulp + sparkle) ====================

    _powerUp(t) {
        // Beer gulp
        this._osc('sine', [[120, 0], [80, 0.1], [60, 0.2]], t, t + 0.3, 0.12);
        this._osc('sawtooth', [[80, 0], [40, 0.15]], t + 0.25, t + 0.5, 0.06);
        // Power-up sparkle ascending
        this._osc('sine', [[800, 0], [1000, 0.05], [1200, 0.1], [1600, 0.15]], t + 0.15, t + 0.45, 0.06);
        this._osc('triangle', [[400, 0], [600, 0.08], [800, 0.16]], t + 0.1, t + 0.4, 0.04);
        // Fizz noise
        this._noise(t + 0.05, 0.35, 0.03, 4000, 'highpass');
    }

    // ==================== SFX: EAT GHOST (pitch escalates with combo) ====================

    _eatGhost(t, combo) {
        const base = 400 + (combo - 1) * 150;
        this._osc('square', [
            [base, 0], [base * 1.25, 0.04],
            [base * 1.5, 0.08], [base * 2, 0.12]
        ], t, t + 0.25, 0.1);
        // Impact thud
        this._osc('sine', [[80, 0], [40, 0.1]], t, t + 0.15, 0.08);
        // Combo sparkle
        this._osc('sine', [[1200 + combo * 200, 0], [1600 + combo * 200, 0.05]], t + 0.05, t + 0.2, 0.04);
        this._noise(t, 0.08, 0.04, 1500, 'bandpass');
    }

    // ==================== SFX: DEATH (3 D'oh variations) ====================

    _doh(t) {
        const v = Math.floor(Math.random() * 3);
        if (v === 0) {
            // Classic D'oh
            this._osc('sawtooth', [[400, 0], [350, 0.1], [200, 0.4], [100, 0.8]], t, t + 1.2, 0.15);
            this._osc('square', [[300, 0], [250, 0.15], [150, 0.5]], t + 0.05, t + 1.0, 0.04);
        } else if (v === 1) {
            // Exasperated D'oh — higher, sharper
            this._osc('sawtooth', [[500, 0], [420, 0.08], [280, 0.3], [120, 0.7]], t, t + 1.0, 0.14);
            this._osc('triangle', [[350, 0], [280, 0.1], [180, 0.4]], t + 0.03, t + 0.8, 0.05);
            this._noise(t, 0.15, 0.03, 600, 'bandpass');
        } else {
            // Defeated D'oh — low, drawn out
            this._osc('sawtooth', [[350, 0], [300, 0.15], [180, 0.5], [80, 1.0]], t, t + 1.4, 0.13);
            this._osc('sine', [[200, 0], [150, 0.2], [80, 0.6]], t + 0.1, t + 1.2, 0.06);
            this._osc('square', [[250, 0], [200, 0.3]], t + 0.05, t + 0.8, 0.03);
        }
    }

    // ==================== SFX: GAME START (Simpsons jingle + harmony) ====================

    _simpsonsJingle(t) {
        const melody = [
            [659, 0], [659, 0.15], [659, 0.3],
            [587, 0.45], [698, 0.55],
            [784, 0.7], [880, 0.85],
            [784, 1.0], [698, 1.1], [659, 1.2],
            [587, 1.35], [523, 1.5]
        ];
        this._osc('square', melody, t, t + 1.8, 0.1);
        // Harmony voice (thirds)
        const harmony = [
            [523, 0], [523, 0.15], [523, 0.3],
            [494, 0.45], [523, 0.55],
            [587, 0.7], [659, 0.85],
            [587, 1.0], [523, 1.1], [494, 1.2],
            [440, 1.35], [392, 1.5]
        ];
        this._osc('triangle', harmony, t, t + 1.8, 0.05);
        this._osc('sine', [[131, 0], [147, 0.45], [165, 0.7], [147, 1.0], [131, 1.35]], t, t + 1.8, 0.08);
    }

    // ==================== SFX: LEVEL COMPLETE (triumphant fanfare) ====================

    _levelComplete(t) {
        this._osc('square', [
            [523, 0], [587, 0.1], [659, 0.2],
            [784, 0.35], [880, 0.5],
            [1047, 0.65],
            [1047, 0.85], [1175, 1.0], [1319, 1.1]
        ], t, t + 1.5, 0.1);
        this._osc('triangle', [
            [392, 0], [440, 0.1], [494, 0.2],
            [587, 0.35], [659, 0.5],
            [784, 0.65], [784, 0.85], [880, 1.0], [988, 1.1]
        ], t, t + 1.5, 0.05);
        this._osc('sine', [[131, 0], [165, 0.2], [196, 0.35], [262, 0.65]], t, t + 1.5, 0.08);
        this._noise(t + 0.6, 0.5, 0.03, 5000, 'highpass');
    }

    // ==================== SFX: EXTRA LIFE (shimmer arpeggio) ====================

    _extraLife(t) {
        this._osc('sine', [
            [523, 0], [659, 0.07], [784, 0.14], [1047, 0.21],
            [1319, 0.28], [1047, 0.35], [1319, 0.42]
        ], t, t + 0.6, 0.1);
        this._osc('triangle', [[262, 0], [330, 0.07], [392, 0.14], [523, 0.21]], t, t + 0.4, 0.04);
        this._noise(t + 0.2, 0.3, 0.02, 6000, 'highpass');
    }

    // ==================== SFX: GAME OVER (sad trombone) ====================

    _gameOver(t) {
        // Descending sad notes
        this._osc('sawtooth', [
            [494, 0], [466, 0.4], [440, 0.8], [370, 1.2]
        ], t, t + 2.0, 0.12);
        // Vibrato sustained wah on final note
        const lfo = this.ctx.createOscillator();
        const lfoG = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 5;
        lfoG.gain.value = 15;
        const wah = this.ctx.createOscillator();
        const wahG = this.ctx.createGain();
        wah.type = 'sawtooth';
        wah.frequency.value = 370;
        lfo.connect(lfoG);
        lfoG.connect(wah.frequency);
        wah.connect(wahG);
        wahG.connect(this._sfxBus);
        wahG.gain.value = 0.08;
        wahG.gain.setValueAtTime(0.08, t + 2.3);
        wahG.gain.linearRampToValueAtTime(0, t + 3.0);
        lfo.start(t + 1.2);
        wah.start(t + 1.2);
        lfo.stop(t + 3.1);
        wah.stop(t + 3.1);
        // Sub bass
        this._osc('sine', [[100, 0], [80, 0.8], [60, 1.5]], t, t + 2.5, 0.06);
    }

    // ==================== BACKGROUND MUSIC ====================

    startMusic() {
        if (!this.ctx || this._musicPlaying) return;
        this._musicPlaying = true;
        this._musicMuted = false;
        this._musicPattern = 0;
        // Restore bus volume (may have been faded by stopMusic)
        this._musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
        this._musicBus.gain.value = 0.07;
        this._scheduleMusic();
    }

    _scheduleMusic() {
        if (!this._musicPlaying) return;
        const now = this.ctx.currentTime;
        const pat = this._musicPattern % 2;
        this._musicPattern++;

        const loopDur = 4.0;

        // Two alternating patterns for variety
        const melodies = [
            [
                [330, 0], [330, 0.2], [392, 0.4], [440, 0.6],
                [392, 0.8], [330, 1.0], [294, 1.2], [262, 1.4],
                [294, 1.6], [330, 1.8], [392, 2.0], [440, 2.2],
                [494, 2.4], [440, 2.6], [392, 2.8], [330, 3.0],
                [294, 3.2], [262, 3.4], [294, 3.6], [330, 3.8]
            ],
            [
                [392, 0], [440, 0.2], [494, 0.4], [440, 0.6],
                [392, 0.8], [349, 1.0], [330, 1.2], [349, 1.4],
                [392, 1.6], [440, 1.8], [392, 2.0], [349, 2.2],
                [330, 2.4], [294, 2.6], [330, 2.8], [349, 3.0],
                [392, 3.2], [440, 3.4], [494, 3.6], [392, 3.8]
            ]
        ];
        const basses = [
            [
                [131, 0], [131, 0.4], [147, 0.8], [165, 1.2],
                [131, 1.6], [131, 2.0], [110, 2.4], [131, 2.8],
                [147, 3.2], [131, 3.6]
            ],
            [
                [165, 0], [165, 0.4], [131, 0.8], [110, 1.2],
                [131, 1.6], [147, 2.0], [165, 2.4], [147, 2.8],
                [131, 3.2], [165, 3.6]
            ]
        ];

        // Melody voice
        const oM = this.ctx.createOscillator();
        const gM = this.ctx.createGain();
        oM.type = 'square';
        oM.connect(gM);
        gM.connect(this._musicBus);
        gM.gain.value = 0.45;
        melodies[pat].forEach(([f, t]) => oM.frequency.setValueAtTime(f, now + t));
        gM.gain.setValueAtTime(0.45, now + loopDur - 0.05);
        gM.gain.linearRampToValueAtTime(0, now + loopDur);
        oM.start(now);
        oM.stop(now + loopDur);

        // Harmony voice (roughly a third below)
        const oH = this.ctx.createOscillator();
        const gH = this.ctx.createGain();
        oH.type = 'triangle';
        oH.connect(gH);
        gH.connect(this._musicBus);
        gH.gain.value = 0.2;
        melodies[pat].forEach(([f, t]) => oH.frequency.setValueAtTime(f * 0.8, now + t));
        gH.gain.setValueAtTime(0.2, now + loopDur - 0.05);
        gH.gain.linearRampToValueAtTime(0, now + loopDur);
        oH.start(now);
        oH.stop(now + loopDur);

        // Bass voice
        const oB = this.ctx.createOscillator();
        const gB = this.ctx.createGain();
        oB.type = 'sine';
        oB.connect(gB);
        gB.connect(this._musicBus);
        gB.gain.value = 0.55;
        basses[pat].forEach(([f, t]) => oB.frequency.setValueAtTime(f, now + t));
        gB.gain.setValueAtTime(0.55, now + loopDur - 0.05);
        gB.gain.linearRampToValueAtTime(0, now + loopDur);
        oB.start(now);
        oB.stop(now + loopDur);

        this._musicTimeout = setTimeout(() => this._scheduleMusic(), (loopDur - 0.1) * 1000);
    }

    stopMusic() {
        this._musicPlaying = false;
        if (this._musicTimeout) { clearTimeout(this._musicTimeout); this._musicTimeout = null; }
        if (this._musicBus) {
            try { this._musicBus.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15); } catch (e) {}
        }
    }

    toggleMute() {
        if (!this._musicBus) return;
        this._musicMuted = !this._musicMuted;
        const now = this.ctx.currentTime;
        this._musicBus.gain.cancelScheduledValues(now);
        this._musicBus.gain.setValueAtTime(this._musicBus.gain.value, now);
        this._musicBus.gain.linearRampToValueAtTime(this._musicMuted ? 0 : 0.07, now + 0.1);
        return this._musicMuted;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
}
