// ===========================
// Come Rosquillas - Audio System
// Simpsons-themed sound effects and background music
// ===========================

'use strict';

class SoundManager {
    constructor() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.ctx = null;
        }
    }
    
    play(type) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        switch (type) {
            case 'chomp': this._donut(now); break;
            case 'power': this._duff(now); break;
            case 'eatGhost': this._eatGhost(now); break;
            case 'die': this._doh(now); break;
            case 'start': this._simpsonsJingle(now); break;
            case 'levelComplete': this._woohoo(now); break;
            case 'extraLife': this._extraLife(now); break;
        }
    }
    
    _osc(type, freq, start, end, vol) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type; o.connect(g); g.connect(this.ctx.destination);
        g.gain.value = vol || 0.12;
        if (typeof freq === 'number') {
            o.frequency.value = freq;
        } else {
            freq.forEach(([f, t]) => o.frequency.setValueAtTime(f, start + t));
        }
        g.gain.linearRampToValueAtTime(0, end);
        o.start(start); o.stop(end);
    }
    
    _donut(t) {
        // Homer munching sound
        this._osc('sawtooth', [[300, 0], [150, 0.04], [250, 0.06]], t, t + 0.1, 0.1);
    }
    
    _duff(t) {
        // Beer gulp + burp
        this._osc('sine', [[120, 0], [80, 0.1], [60, 0.2]], t, t + 0.3, 0.15);
        this._osc('sawtooth', [[80, 0], [40, 0.15]], t + 0.25, t + 0.5, 0.08);
    }
    
    _eatGhost(t) {
        // Triumphant ascending
        this._osc('square', [[400, 0], [600, 0.05], [800, 0.1], [1000, 0.15]], t, t + 0.3, 0.1);
    }
    
    _doh(t) {
        // Homer's D'oh - descending tone
        this._osc('sawtooth', [[400, 0], [350, 0.1], [200, 0.4], [100, 0.8]], t, t + 1.2, 0.15);
        this._osc('square', [[300, 0], [250, 0.15], [150, 0.5]], t + 0.05, t + 1.0, 0.05);
    }
    
    _simpsonsJingle(t) {
        // Approximation of the Simpsons theme opening notes
        const notes = [
            [659, 0], [659, 0.15], [659, 0.3], // E E E
            [587, 0.45], [698, 0.55], // D F
            [784, 0.7], [880, 0.85], // G A
            [784, 1.0], [698, 1.1], [659, 1.2], // G F E
            [587, 1.35], [523, 1.5] // D C
        ];
        this._osc('square', notes, t, t + 1.8, 0.12);
        // Bass
        this._osc('sine', [[131, 0], [147, 0.45], [165, 0.9], [131, 1.35]], t, t + 1.8, 0.08);
    }
    
    _woohoo(t) {
        // Homer Woohoo ascending
        this._osc('sine', [[300, 0], [500, 0.1], [800, 0.2], [1200, 0.3]], t, t + 0.6, 0.15);
        this._osc('square', [[250, 0], [400, 0.15]], t + 0.05, t + 0.5, 0.05);
    }
    
    _extraLife(t) {
        this._osc('sine', [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24], [784, 0.32], [1047, 0.4]], t, t + 0.6, 0.12);
    }

    // ---- Background Music (looping Simpsons-inspired melody) ----
    startMusic() {
        if (!this.ctx || this._musicPlaying) return;
        this._musicPlaying = true;
        this._musicMuted = false;
        this._musicGain = this.ctx.createGain();
        this._musicGain.gain.value = 0.07;
        this._musicGain.connect(this.ctx.destination);
        this._scheduleMusic();
    }
    
    _scheduleMusic() {
        if (!this._musicPlaying) return;
        const now = this.ctx.currentTime;
        // Simpsons-inspired looping bass + melody pattern (~4 seconds per loop)
        const melody = [
            [330, 0], [330, 0.2], [392, 0.4], [440, 0.6],
            [392, 0.8], [330, 1.0], [294, 1.2], [262, 1.4],
            [294, 1.6], [330, 1.8], [392, 2.0], [440, 2.2],
            [494, 2.4], [440, 2.6], [392, 2.8], [330, 3.0],
            [294, 3.2], [262, 3.4], [294, 3.6], [330, 3.8]
        ];
        const bass = [
            [131, 0], [131, 0.4], [147, 0.8], [165, 1.2],
            [131, 1.6], [131, 2.0], [110, 2.4], [131, 2.8],
            [147, 3.2], [131, 3.6]
        ];
        const loopDur = 4.0;
        // Melody voice
        const oM = this.ctx.createOscillator();
        const gM = this.ctx.createGain();
        oM.type = 'square';
        oM.connect(gM);
        gM.connect(this._musicGain);
        gM.gain.value = 0.5;
        melody.forEach(([f, t]) => oM.frequency.setValueAtTime(f, now + t));
        gM.gain.setValueAtTime(0.5, now + loopDur - 0.05);
        gM.gain.linearRampToValueAtTime(0, now + loopDur);
        oM.start(now);
        oM.stop(now + loopDur);
        // Bass voice
        const oB = this.ctx.createOscillator();
        const gB = this.ctx.createGain();
        oB.type = 'sine';
        oB.connect(gB);
        gB.connect(this._musicGain);
        gB.gain.value = 0.6;
        bass.forEach(([f, t]) => oB.frequency.setValueAtTime(f, now + t));
        gB.gain.setValueAtTime(0.6, now + loopDur - 0.05);
        gB.gain.linearRampToValueAtTime(0, now + loopDur);
        oB.start(now);
        oB.stop(now + loopDur);
        // Schedule next loop
        this._musicTimeout = setTimeout(() => this._scheduleMusic(), (loopDur - 0.1) * 1000);
    }
    
    stopMusic() {
        this._musicPlaying = false;
        if (this._musicTimeout) { clearTimeout(this._musicTimeout); this._musicTimeout = null; }
        if (this._musicGain) {
            try { this._musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1); } catch(e) {}
        }
    }
    
    toggleMute() {
        if (!this._musicGain) return;
        this._musicMuted = !this._musicMuted;
        this._musicGain.gain.value = this._musicMuted ? 0 : 0.07;
        return this._musicMuted;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
}
