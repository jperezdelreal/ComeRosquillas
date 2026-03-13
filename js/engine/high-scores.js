// ===========================
// Come Rosquillas - High Score Manager
// ===========================

'use strict';

class HighScoreManager {
    constructor() {
        this.storageKey = 'comeRosquillas_highScores';
        this.maxScores = 10;
        this.scores = this.loadScores();
    }

    loadScores() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validate structure
                if (Array.isArray(parsed) && parsed.every(s => 
                    typeof s.name === 'string' && 
                    typeof s.score === 'number' && 
                    typeof s.level === 'number'
                )) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('localStorage unavailable or corrupt:', e);
        }
        return [];
    }

    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
            return true;
        } catch (e) {
            console.warn('Could not save high scores:', e);
            return false;
        }
    }

    isHighScore(score) {
        // Validate score input
        if (typeof score !== 'number' || !isFinite(score) || score < 0) {
            return false;
        }
        if (this.scores.length < this.maxScores) return true;
        return score > this.scores[this.scores.length - 1].score;
    }

    addScore(name, score, level, combo) {
        // Validate score input
        if (typeof score !== 'number' || !isFinite(score) || score < 0) {
            return false;
        }

        const entry = {
            name: name.trim().substring(0, 3).toUpperCase() || 'AAA',
            score: score,
            level: level,
            combo: (typeof combo === 'number' && combo > 0 && combo <= 8) ? combo : 0,
            date: new Date().toISOString()
        };

        this.scores.push(entry);
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, this.maxScores);
        
        const rank = this.scores.findIndex(s => s === entry) + 1;
        this.saveScores();
        return rank;
    }

    getScores() {
        return [...this.scores];
    }

    getHighScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }

    clearScores() {
        this.scores = [];
        this.saveScores();
    }
}
