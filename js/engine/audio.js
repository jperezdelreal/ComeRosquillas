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
        this._chompStreak = 0;
        this._lastChompTime = 0;
        this._frightActive = false;
        this._musicTempo = 1.0;
        this._duckTimer = null;
        this._powerHumNodes = null;
        this._spatialGhostNodes = [];
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

        // Spatial SFX bus for ghost proximity sounds
        this._spatialBus = this.ctx.createGain();
        this._spatialBus.gain.value = 0.8;
        this._spatialBus.connect(this._masterGain);

        this._nominalMusicVol = 0.07;
    }

    play(type, data) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        switch (type) {
            case 'chomp': this._chomp(now); break;
            case 'power': this._powerUp(now); this._duckMusic(AUDIO_JUICE.duckDurationSfx); break;
            case 'eatGhost': this._eatGhost(now, data || 1); this._duckMusic(AUDIO_JUICE.duckDurationSfx); break;
            case 'comboMilestone': this._comboMilestone(now, data || 2); this._duckMusic(AUDIO_JUICE.duckDurationSfx); break;
            case 'die': this._doh(now); this._duckMusic(AUDIO_JUICE.duckDurationStinger); break;
            case 'start': this._simpsonsJingle(now); break;
            case 'levelComplete': this._levelComplete(now); this._duckMusic(AUDIO_JUICE.duckDurationStinger); break;
            case 'extraLife': this._extraLife(now); this._duckMusic(AUDIO_JUICE.duckDurationSfx); break;
            case 'gameOver': this._gameOver(now); this._duckMusic(AUDIO_JUICE.duckDurationStinger); break;
            case 'specialItem': this._specialItemSfx(now, data); this._duckMusic(AUDIO_JUICE.duckDurationSfx); break;
            case 'powerUpWarning': this._powerUpWarning(now); break;
        }
    }

    // ==================== OSCILLATOR HELPERS ====================

    _osc(type, freq, start, end, vol, bus) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.connect(g);
        g.connect(bus || this._sfxBus);
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
        return o;
    }

    _noise(start, duration, vol, filterFreq, filterType, bus) {
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
        g.connect(bus || this._sfxBus);
        g.gain.setValueAtTime(vol || 0.05, start + duration - 0.02);
        g.gain.linearRampToValueAtTime(0, start + duration);
        src.start(start);
        src.stop(start + duration + 0.05);
    }

    // ==================== AUDIO DUCKING ====================

    _duckMusic(duration) {
        if (!this.ctx || !this._musicBus || this._musicMuted) return;
        const now = this.ctx.currentTime;
        const duckedVol = this._nominalMusicVol * AUDIO_JUICE.duckAmount;

        this._musicBus.gain.cancelScheduledValues(now);
        this._musicBus.gain.setValueAtTime(this._musicBus.gain.value, now);
        this._musicBus.gain.linearRampToValueAtTime(duckedVol, now + AUDIO_JUICE.duckFadeIn);
        this._musicBus.gain.linearRampToValueAtTime(this._nominalMusicVol, now + duration + AUDIO_JUICE.duckFadeOut);
    }

    // ==================== SFX: COMBO MILESTONE ====================

    _comboMilestone(t, multiplier) {
        const freqMap = { 2: 262, 4: 330, 8: 392 };
        const root = freqMap[multiplier] || 262;
        this._osc('sine', [
            [root, 0], [root * 1.25, 0.07], [root * 1.5, 0.14]
        ], t, t + 0.35, 0.1);
        this._osc('triangle', [[root * 0.5, 0], [root, 0.1]], t, t + 0.3, 0.06);
        this._noise(t + 0.05, 0.25, 0.03, 5000, 'highpass');
    }

    // ==================== SFX: CHOMP (pitch progression + random variation) ====================

    _chomp(t) {
        // Reset streak if too much time has passed
        const elapsed = (t - this._lastChompTime) * 1000;
        if (elapsed > AUDIO_JUICE.chompStreakDecayMs) this._chompStreak = 0;
        this._lastChompTime = t;

        const variant = this._chompVariant % 4;
        this._chompVariant++;
        const patterns = [
            [[300, 0], [150, 0.04], [250, 0.06]],
            [[350, 0], [180, 0.03], [280, 0.06]],
            [[260, 0], [130, 0.04], [220, 0.07]],
            [[320, 0], [160, 0.03], [270, 0.05]],
        ];

        // Musical progression: pitch rises with consecutive chomps
        const streakPitch = Math.pow(2, (this._chompStreak * AUDIO_JUICE.chompStreakSemitones) / 12);
        const spread = (1 - AUDIO_JUICE.chompRandomSpread / 2) + Math.random() * AUDIO_JUICE.chompRandomSpread;
        const pitchMult = streakPitch * spread;

        const freqs = patterns[variant].map(([f, time]) => [f * pitchMult, time]);
        this._osc('sawtooth', freqs, t, t + 0.1, 0.1);
        this._noise(t, 0.06, 0.02, 2000 * pitchMult, 'bandpass');

        this._chompStreak = Math.min(this._chompStreak + 1, AUDIO_JUICE.chompStreakMax);
    }

    // ==================== SFX: POWER PELLET (Duff beer gulp + rising tone) ====================

    _powerUp(t) {
        this._osc('sine', [[120, 0], [80, 0.1], [60, 0.2]], t, t + 0.3, 0.12);
        this._osc('sawtooth', [[80, 0], [40, 0.15]], t + 0.25, t + 0.5, 0.06);
        // Distinct rising tone sweep
        this._osc('sine', [[200, 0], [400, 0.08], [800, 0.16], [1200, 0.24], [1600, 0.3]], t + 0.1, t + 0.55, 0.08);
        this._osc('triangle', [[400, 0], [600, 0.08], [800, 0.16], [1200, 0.24]], t + 0.1, t + 0.5, 0.04);
        this._noise(t + 0.05, 0.35, 0.03, 4000, 'highpass');
    }

    // ==================== SFX: EAT GHOST (pitch escalates with combo chain) ====================

    _eatGhost(t, combo) {
        const base = 400 + (combo - 1) * 200;
        this._osc('square', [
            [base, 0], [base * 1.25, 0.04],
            [base * 1.5, 0.08], [base * 2, 0.12]
        ], t, t + 0.25, 0.1);
        this._osc('sine', [[80 + combo * 20, 0], [40 + combo * 10, 0.1]], t, t + 0.15, 0.08);
        this._osc('sine', [[1200 + combo * 300, 0], [1600 + combo * 300, 0.05]], t + 0.05, t + 0.2, 0.04 + combo * 0.01);
        this._noise(t, 0.08, 0.04, 1500 + combo * 500, 'bandpass');
    }

    // ==================== SFX: DEATH (3 D'oh variations) ====================

    _doh(t) {
        const v = Math.floor(Math.random() * 3);
        if (v === 0) {
            this._osc('sawtooth', [[400, 0], [350, 0.1], [200, 0.4], [100, 0.8]], t, t + 1.2, 0.15);
            this._osc('square', [[300, 0], [250, 0.15], [150, 0.5]], t + 0.05, t + 1.0, 0.04);
        } else if (v === 1) {
            this._osc('sawtooth', [[500, 0], [420, 0.08], [280, 0.3], [120, 0.7]], t, t + 1.0, 0.14);
            this._osc('triangle', [[350, 0], [280, 0.1], [180, 0.4]], t + 0.03, t + 0.8, 0.05);
            this._noise(t, 0.15, 0.03, 600, 'bandpass');
        } else {
            this._osc('sawtooth', [[350, 0], [300, 0.15], [180, 0.5], [80, 1.0]], t, t + 1.4, 0.13);
            this._osc('sine', [[200, 0], [150, 0.2], [80, 0.6]], t + 0.1, t + 1.2, 0.06);
            this._osc('square', [[250, 0], [200, 0.3]], t + 0.05, t + 0.8, 0.03);
        }
    }

    // ==================== SFX: GAME START ====================

    _simpsonsJingle(t) {
        const melody = [
            [659, 0], [659, 0.15], [659, 0.3],
            [587, 0.45], [698, 0.55],
            [784, 0.7], [880, 0.85],
            [784, 1.0], [698, 1.1], [659, 1.2],
            [587, 1.35], [523, 1.5]
        ];
        this._osc('square', melody, t, t + 1.8, 0.1);
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

    // ==================== SFX: LEVEL COMPLETE ====================

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

    // ==================== SFX: EXTRA LIFE ====================

    _extraLife(t) {
        this._osc('sine', [
            [523, 0], [659, 0.07], [784, 0.14], [1047, 0.21],
            [1319, 0.28], [1047, 0.35], [1319, 0.42]
        ], t, t + 0.6, 0.1);
        this._osc('triangle', [[262, 0], [330, 0.07], [392, 0.14], [523, 0.21]], t, t + 0.4, 0.04);
        this._noise(t + 0.2, 0.3, 0.02, 6000, 'highpass');
    }

    // ==================== SFX: GAME OVER ====================

    _gameOver(t) {
        this._osc('sawtooth', [
            [494, 0], [466, 0.4], [440, 0.8], [370, 1.2]
        ], t, t + 2.0, 0.12);
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
        this._osc('sine', [[100, 0], [80, 0.8], [60, 1.5]], t, t + 2.5, 0.06);
    }

    // ==================== SFX: SPECIAL ITEM PICKUP ====================

    _specialItemSfx(t, type) {
        if (!type) {
            this._osc('sine', [[600, 0], [900, 0.06], [1200, 0.12], [1600, 0.18]], t, t + 0.35, 0.1);
            this._noise(t, 0.15, 0.03, 4000, 'highpass');
            return;
        }
        switch (type.effect) {
            case 'speed_boost':
                this._osc('sawtooth', [[200, 0], [400, 0.08], [800, 0.16], [1200, 0.24]], t, t + 0.4, 0.09);
                this._osc('sine', [[300, 0], [600, 0.1], [1000, 0.2]], t + 0.05, t + 0.35, 0.06);
                this._noise(t, 0.3, 0.04, 3000, 'highpass');
                break;
            case 'bonus_points':
                this._osc('sine', [[523, 0], [659, 0.06], [784, 0.12], [1047, 0.18], [1319, 0.24]], t, t + 0.5, 0.1);
                this._osc('triangle', [[1047, 0.1], [1319, 0.2], [1568, 0.3]], t, t + 0.5, 0.05);
                this._noise(t + 0.1, 0.2, 0.04, 6000, 'highpass');
                break;
            case 'slow_ghosts':
                this._osc('sawtooth', [[80, 0], [60, 0.15], [100, 0.3]], t, t + 0.5, 0.1);
                this._osc('sine', [[150, 0], [200, 0.1], [120, 0.25]], t, t + 0.4, 0.06);
                this._noise(t + 0.05, 0.4, 0.05, 2000, 'bandpass');
                break;
            case 'collect_token':
                this._osc('sine', [[2000, 0], [2500, 0.03], [3000, 0.06]], t, t + 0.15, 0.08);
                this._osc('triangle', [[1500, 0], [2000, 0.04]], t + 0.02, t + 0.12, 0.04);
                this._noise(t, 0.08, 0.03, 5000, 'highpass');
                break;
            case 'invincibility':
                this._osc('square', [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24], [1319, 0.32]], t, t + 0.55, 0.09);
                this._osc('triangle', [[262, 0], [330, 0.08], [392, 0.16], [523, 0.24]], t, t + 0.45, 0.05);
                this._osc('sine', [[131, 0], [165, 0.16], [196, 0.32]], t, t + 0.5, 0.07);
                this._noise(t + 0.15, 0.3, 0.03, 4000, 'highpass');
                break;
        }
    }

    _powerUpWarning(t) {
        this._osc('square', [[800, 0], [600, 0.06]], t, t + 0.12, 0.06);
        this._osc('square', [[700, 0.15], [500, 0.21]], t, t + 0.27, 0.06);
    }

    // ==================== SPATIAL AUDIO ====================

    updateSpatial(homerX, homerY, ghosts) {
        if (!this.ctx || !this._spatialBus) return;
        const tileSize = typeof TILE !== 'undefined' ? TILE : 24;
        const maxDist = AUDIO_JUICE.spatialMaxDistance * tileSize;

        // Lazily create one spatial node per ghost
        while (this._spatialGhostNodes.length < ghosts.length) {
            const panner = this.ctx.createStereoPanner();
            const gain = this.ctx.createGain();
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 80 + this._spatialGhostNodes.length * 15;
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this._spatialBus);
            osc.start();
            this._spatialGhostNodes.push({ osc, gain, panner });
        }

        const half = tileSize / 2;
        for (let i = 0; i < ghosts.length; i++) {
            const g = ghosts[i];
            const node = this._spatialGhostNodes[i];
            const dx = (g.x + half) - (homerX + half);
            const dy = (g.y + half) - (homerY + half);
            const dist = Math.sqrt(dx * dx + dy * dy);

            const audible = !g.inHouse && g.mode !== GM_EATEN;
            if (!audible || dist > maxDist) {
                node.gain.gain.value = 0;
                continue;
            }

            const normalDist = Math.min(1, dist / maxDist);
            const vol = AUDIO_JUICE.spatialMaxVolume * (1 - normalDist);
            const frightMult = g.mode === GM_FRIGHTENED ? 0.4 : 1.0;
            node.gain.gain.value = vol * frightMult;

            // Stereo panning based on horizontal offset
            node.panner.pan.value = Math.max(-1, Math.min(1, dx / maxDist));

            // Closer ghosts have higher pitch
            node.osc.frequency.value = 60 + (1 - normalDist) * 80 + i * 15;
        }
    }

    stopSpatial() {
        for (const node of this._spatialGhostNodes) {
            try { node.osc.stop(); } catch (e) {}
        }
        this._spatialGhostNodes = [];
    }

    // ==================== POWER PELLET AMBIENT HUM ====================

    startPowerHum() {
        if (!this.ctx || this._powerHumNodes) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = AUDIO_JUICE.powerHumFreq;
        lfo.type = 'sine';
        lfo.frequency.value = 3;
        lfoGain.gain.value = 8;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(this._sfxBus);

        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(AUDIO_JUICE.powerHumVolume, this.ctx.currentTime + 0.15);

        osc.start();
        lfo.start();
        this._powerHumNodes = { osc, gain, lfo, lfoGain };
    }

    stopPowerHum() {
        if (!this._powerHumNodes || !this.ctx) return;
        const { osc, gain, lfo } = this._powerHumNodes;
        try {
            const now = this.ctx.currentTime;
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            setTimeout(() => {
                try { osc.stop(); lfo.stop(); } catch (e) {}
            }, 300);
        } catch (e) {}
        this._powerHumNodes = null;
    }

    // ==================== DYNAMIC MUSIC TEMPO ====================

    setMusicTempo(tempo) {
        this._musicTempo = Math.max(0.8, Math.min(1.5, tempo));
    }

    setFrightMode(active) {
        if (!this.ctx) return;
        this._frightActive = active;
        if (active) {
            this.setMusicTempo(AUDIO_JUICE.frightMusicTempo);
            this.startPowerHum();
        } else {
            this.setMusicTempo(this._baseLevelTempo || 1.0);
            this.stopPowerHum();
        }
    }

    setLevelTempo(level) {
        this._baseLevelTempo = Math.min(
            AUDIO_JUICE.maxLevelTempo,
            AUDIO_JUICE.baseMusicTempo + (level - 1) * AUDIO_JUICE.tempoPerLevel
        );
        if (!this._frightActive) {
            this.setMusicTempo(this._baseLevelTempo);
        }
    }

    // ==================== BACKGROUND MUSIC ====================

    startMusic() {
        if (!this.ctx || this._musicPlaying) return;
        this._musicPlaying = true;
        this._musicMuted = false;
        this._musicPattern = 0;
        this._musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
        this._musicBus.gain.value = this._nominalMusicVol;
        this._scheduleMusic();
    }

    _scheduleMusic() {
        if (!this._musicPlaying) return;
        const now = this.ctx.currentTime;
        const pat = this._musicPattern % 2;
        this._musicPattern++;

        const tempo = this._musicTempo || 1.0;
        const loopDur = 4.0 / tempo;
        const detune = this._frightActive ? AUDIO_JUICE.frightDetune : 0;

        // Fright mode uses darker, lower patterns
        const melodies = this._frightActive ? [
            [
                [220, 0], [233, 0.2], [220, 0.4], [208, 0.6],
                [196, 0.8], [208, 1.0], [220, 1.2], [196, 1.4],
                [185, 1.6], [196, 1.8], [220, 2.0], [233, 2.2],
                [220, 2.4], [208, 2.6], [196, 2.8], [185, 3.0],
                [196, 3.2], [208, 3.4], [220, 3.6], [196, 3.8]
            ],
            [
                [196, 0], [208, 0.2], [220, 0.4], [208, 0.6],
                [185, 0.8], [175, 1.0], [185, 1.2], [196, 1.4],
                [208, 1.6], [220, 1.8], [208, 2.0], [196, 2.2],
                [185, 2.4], [175, 2.6], [165, 2.8], [175, 3.0],
                [185, 3.2], [196, 3.4], [208, 3.6], [196, 3.8]
            ]
        ] : [
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

        const basses = this._frightActive ? [
            [
                [55, 0], [55, 0.4], [58, 0.8], [55, 1.2],
                [52, 1.6], [55, 2.0], [49, 2.4], [52, 2.8],
                [55, 3.2], [49, 3.6]
            ],
            [
                [49, 0], [52, 0.4], [55, 0.8], [49, 1.2],
                [46, 1.6], [49, 2.0], [55, 2.4], [52, 2.8],
                [49, 3.2], [46, 3.6]
            ]
        ] : [
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

        // Scale note timings by tempo
        const scaledMelody = melodies[pat].map(([f, t]) => [f, t / tempo]);
        const scaledBass = basses[pat].map(([f, t]) => [f, t / tempo]);

        // Melody voice — sawtooth during fright for eerier tone
        const oM = this.ctx.createOscillator();
        const gM = this.ctx.createGain();
        oM.type = this._frightActive ? 'sawtooth' : 'square';
        oM.detune.value = detune;
        oM.connect(gM);
        gM.connect(this._musicBus);
        gM.gain.value = 0.45;
        scaledMelody.forEach(([f, t]) => oM.frequency.setValueAtTime(f, now + t));
        gM.gain.setValueAtTime(0.45, now + loopDur - 0.05);
        gM.gain.linearRampToValueAtTime(0, now + loopDur);
        oM.start(now);
        oM.stop(now + loopDur);

        // Harmony voice
        const oH = this.ctx.createOscillator();
        const gH = this.ctx.createGain();
        oH.type = 'triangle';
        oH.detune.value = detune;
        oH.connect(gH);
        gH.connect(this._musicBus);
        gH.gain.value = this._frightActive ? 0.15 : 0.2;
        scaledMelody.forEach(([f, t]) => oH.frequency.setValueAtTime(f * 0.8, now + t));
        gH.gain.setValueAtTime(gH.gain.value, now + loopDur - 0.05);
        gH.gain.linearRampToValueAtTime(0, now + loopDur);
        oH.start(now);
        oH.stop(now + loopDur);

        // Bass voice — heavier during fright
        const oB = this.ctx.createOscillator();
        const gB = this.ctx.createGain();
        oB.type = 'sine';
        oB.connect(gB);
        gB.connect(this._musicBus);
        gB.gain.value = this._frightActive ? 0.7 : 0.55;
        scaledBass.forEach(([f, t]) => oB.frequency.setValueAtTime(f, now + t));
        gB.gain.setValueAtTime(gB.gain.value, now + loopDur - 0.05);
        gB.gain.linearRampToValueAtTime(0, now + loopDur);
        oB.start(now);
        oB.stop(now + loopDur);

        this._musicTimeout = setTimeout(() => this._scheduleMusic(), (loopDur - 0.1) * 1000);
    }

    stopMusic() {
        this._musicPlaying = false;
        this._frightActive = false;
        if (this._musicTimeout) { clearTimeout(this._musicTimeout); this._musicTimeout = null; }
        if (this._musicBus) {
            try { this._musicBus.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15); } catch (e) {}
        }
        this.stopPowerHum();
    }

    toggleMute() {
        if (!this._musicBus) return;
        this._musicMuted = !this._musicMuted;
        const now = this.ctx.currentTime;
        this._musicBus.gain.cancelScheduledValues(now);
        this._musicBus.gain.setValueAtTime(this._musicBus.gain.value, now);
        this._musicBus.gain.linearRampToValueAtTime(this._musicMuted ? 0 : this._nominalMusicVol, now + 0.1);

        // Also mute/unmute spatial bus
        if (this._spatialBus) {
            this._spatialBus.gain.linearRampToValueAtTime(this._musicMuted ? 0 : 0.8, now + 0.1);
        }

        return this._musicMuted;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
}
