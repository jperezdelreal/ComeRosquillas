// ===========================
// Come Rosquillas - ScoringSystem
// Extracted from game-logic.js (Issue #97)
// Handles: Score calculation, combos, lives, HUD, game stats
// ===========================

'use strict';

Game.prototype._loadBestCombo = function() {
    try {
        const val = parseInt(localStorage.getItem(COMBO_MILESTONE_STORAGE_KEY));
        return isNaN(val) ? 0 : val;
    } catch (e) { return 0; }
};

Game.prototype._saveBestCombo = function() {
    try {
        // Only update localStorage if current game best is a new all-time best
        const stored = parseInt(localStorage.getItem(COMBO_MILESTONE_STORAGE_KEY)) || 0;
        if (this.bestCombo > stored) {
            localStorage.setItem(COMBO_MILESTONE_STORAGE_KEY, String(this.bestCombo));
            this._allTimeBestCombo = this.bestCombo;
        }
    } catch (e) {}
};

Game.prototype._buildGameStats = function() {
    return {
        score: this.score,
        level: this.level,
        bestCombo: this.bestCombo,
        difficulty: typeof getCurrentDifficulty === 'function' ? getCurrentDifficulty() : 'normal',
        donutsEaten: this._gameDonutsEaten,
        ghostsEaten: this._gameGhostsEaten,
        itemsCollected: this._gameItemsCollected,
        playTimeMs: this._gameStartTime ? Date.now() - this._gameStartTime : 0,
        eventsCompleted: this._eventsCompleted || 0,
    };
};

Game.prototype._submitDailyScore = function() {
    if (!this.dailyChallenge || !this._dailyChallenge) return;
    this.dailyChallenge.submitScore(
        this.initialsEntry ? this.initialsEntry.name : 'AAA',
        this.score, this.level,
        this._gameGhostsEaten, this._gameDonutsEaten
    );
    this.dailyChallenge.endChallenge();
    if (this.achievements) this.achievements.notify('daily_complete', this);
};

Game.prototype._endDailyChallenge = function() {
    if (this._dailyChallenge && this.dailyChallenge) {
        this._submitDailyScore();
    }
    this.highScores.recordGameEnd(this._buildGameStats());
    if (this.achievements) this.achievements.notify('game_over', this);
    this.state = ST_GAME_OVER;
    this.sound.stopMusic();
    this.sound.play('gameOver');
    const challenge = this._dailyChallenge;
    const banner = challenge ? `${challenge.emoji} ${challenge.name} — Time's Up!<br>` : '';
    this.showMessage("⏱️ TIME!", `${banner}Score: ${this.score}<br><br>${this._shareButtonHtml()}Press ENTER to try again`);
    this._dailyChallenge = null;
    this._dailyTimeUp = false;
};

Game.prototype._shareButtonHtml = function() {
    if (typeof ShareMenu === 'undefined') return '';
    return `<button onclick="if(window._game&&window._game.shareMenu)window._game.shareMenu.open()" style="
        font-family:'Bangers','Arial',sans-serif;font-size:18px;padding:10px 24px;
        background:linear-gradient(180deg,#4CAF50 0%,#388E3C 100%);
        border:2px solid #66BB6A;color:#fff;border-radius:10px;cursor:pointer;
        margin:8px 0 12px;letter-spacing:0.5px;text-shadow:1px 1px 0 rgba(0,0,0,0.3);
        transition:transform 0.15s;display:inline-block;
    " onmouseover="this.style.transform='translateY(-2px)'"
       onmouseout="this.style.transform='translateY(0)'"
    >📤 Share Your Score!</button><br><span style='font-size:13px;color:#e0d0ff;'>Press H to share</span><br><br>`;
};

Game.prototype._challengeBannerHtml = function() {
    if (typeof ShareMenu === 'undefined') return '';
    const target = ShareMenu.getTargetScoreFromUrl();
    if (!target || isNaN(target)) return '';
    return `<div style="background:linear-gradient(180deg,#E91E63 0%,#AD1457 100%);
        border:2px solid #F06292;border-radius:10px;padding:10px 16px;margin:0 0 12px;
        color:#fff;font-size:16px;text-shadow:1px 1px 0 rgba(0,0,0,0.3);">
        ⚔️ Challenge: Beat ${target.toLocaleString()} points!</div>`;
};

Game.prototype._dailyChallengeBannerHtml = function() {
    if (typeof DailyChallenge === 'undefined') return '';
    const challenge = DailyChallenge.getTodaysChallenge();
    const badge = DailyChallenge.getChallengeBadge();
    const badgeHtml = badge ? `<span style="font-size:12px;color:#e0d0ff;">${badge.emoji} ${badge.name}</span><br>` : '';
    return `<div style="background:linear-gradient(180deg,${challenge.color}33 0%,${challenge.color}11 100%);
        border:2px solid ${challenge.color};border-radius:10px;padding:8px 14px;margin:0 0 10px;
        color:#fff;font-size:14px;text-shadow:1px 1px 0 rgba(0,0,0,0.3);cursor:pointer;"
        onclick="if(window._game&&window._game.dailyChallenge)window._game.dailyChallenge.open()">
        ${challenge.emoji} Daily: ${challenge.name} — ${challenge.description}<br>
        ${badgeHtml}<span style="font-size:12px;color:#ffd800;">Press D or click to play!</span></div>`;
};

Game.prototype.updateHUD = function() {
    const prevScore = parseInt(this.scoreEl.textContent) || 0;
    this.scoreEl.textContent = this.score;
    if (typeof a11y !== 'undefined' && this.score > prevScore) {
        a11y.onScoreUpdate(this.score);
    }
    if (this._dailyChallenge) {
        this.levelEl.textContent = `${this._dailyChallenge.emoji} ${this._dailyChallenge.name}`;
    } else if (this.isEndlessMode()) {
        this.levelEl.textContent = `∞ ENDLESS - ${this.currentLayout.name} ${this.level}`;
    } else {
        this.levelEl.textContent = `${this.currentLayout.name} - ${this.level}`;
    }
    this.highScoreEl.textContent = this.highScores.getHighScore();
    // Show best combo on HUD when player has achieved one
    if (this.bestComboEl) {
        if (this.bestCombo > 1) {
            this.bestComboValueEl.textContent = this.bestCombo;
            this.bestComboEl.style.display = '';
        } else {
            this.bestComboEl.style.display = 'none';
        }
    }
    // Render donut icons for lives
    let html = '';
    for (let i = 0; i < this.lives; i++) {
        html += '<span class="donut-icon"></span> ';
    }
    this.livesIconsEl.innerHTML = html;
};
