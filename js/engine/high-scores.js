// ===========================
// Come Rosquillas - High Score Manager
// ===========================

'use strict';

class HighScoreManager {
    constructor() {
        this.storageKey = 'comeRosquillas_highScores';
        this.maxScores = MAX_HIGH_SCORES;
        this.scores = this.loadScores();
        this.lifetimeStats = this.loadLifetimeStats();
    }

    loadScores() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.every(s => 
                    typeof s.name === 'string' && 
                    typeof s.score === 'number' && 
                    typeof s.level === 'number'
                )) {
                    return parsed.slice(0, this.maxScores);
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
        if (typeof score !== 'number' || !isFinite(score) || score < 0) {
            return false;
        }
        if (this.scores.length < this.maxScores) return true;
        return score > this.scores[this.scores.length - 1].score;
    }

    addScore(name, score, level, combo, gameStats) {
        if (typeof score !== 'number' || !isFinite(score) || score < 0) {
            return false;
        }

        const stats = gameStats || {};
        const entry = {
            name: name.trim().substring(0, 3).toUpperCase() || 'AAA',
            score: score,
            level: level,
            combo: (typeof combo === 'number' && combo > 0 && combo <= Math.max(...COMBO_MILESTONES)) ? combo : 0,
            difficulty: stats.difficulty || 'normal',
            donutsEaten: stats.donutsEaten || 0,
            ghostsEaten: stats.ghostsEaten || 0,
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

    _defaultStats() {
        return {
            totalGames: 0,
            totalDonutsEaten: 0,
            totalGhostsEaten: 0,
            totalItemsCollected: 0,
            highestCombo: 0,
            highestLevel: 0,
            totalPlayTimeMs: 0,
            bestScoreByDifficulty: {}
        };
    }

    loadLifetimeStats() {
        try {
            const stored = localStorage.getItem(STATS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (typeof parsed === 'object' && parsed !== null) {
                    return { ...this._defaultStats(), ...parsed };
                }
            }
        } catch (e) {
            console.warn('Could not load lifetime stats:', e);
        }
        return this._defaultStats();
    }

    saveLifetimeStats() {
        try {
            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(this.lifetimeStats));
        } catch (e) {
            console.warn('Could not save lifetime stats:', e);
        }
    }

    recordGameEnd(gameStats) {
        const s = this.lifetimeStats;
        s.totalGames++;
        s.totalDonutsEaten += gameStats.donutsEaten || 0;
        s.totalGhostsEaten += gameStats.ghostsEaten || 0;
        s.totalItemsCollected += gameStats.itemsCollected || 0;
        s.totalPlayTimeMs += gameStats.playTimeMs || 0;
        if (gameStats.bestCombo > s.highestCombo) s.highestCombo = gameStats.bestCombo;
        if (gameStats.level > s.highestLevel) s.highestLevel = gameStats.level;

        const diff = gameStats.difficulty || 'normal';
        const prevBest = s.bestScoreByDifficulty[diff] || 0;
        if (gameStats.score > prevBest) s.bestScoreByDifficulty[diff] = gameStats.score;

        this.saveLifetimeStats();
    }

    getLifetimeStats() {
        return { ...this.lifetimeStats };
    }

    getRank() {
        const donuts = this.lifetimeStats.totalDonutsEaten;
        for (const badge of RANK_BADGES) {
            if (donuts >= badge.minDonuts) return badge;
        }
        return RANK_BADGES[RANK_BADGES.length - 1];
    }

    clearLifetimeStats() {
        this.lifetimeStats = this._defaultStats();
        this.saveLifetimeStats();
    }
}