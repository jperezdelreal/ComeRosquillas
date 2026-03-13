// ===========================
// Come Rosquillas - Stats Dashboard & Leaderboard
// ===========================

'use strict';

class StatsDashboard {
    constructor(highScoreManager) {
        this.highScores = highScoreManager;
        this.overlay = null;
        this.isOpen = false;
        this.activeTab = 'leaderboard';
        this.focusIndex = 0;
        this.focusableElements = [];
        this._lastGameScore = null;
        this._lastGameDate = null;

        this.createOverlay();
        this.setupEventHandlers();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'statsDashboardOverlay';
        this.overlay.className = 'stats-overlay';
        this.overlay.style.display = 'none';

        this.overlay.innerHTML = `
            <div class="stats-modal" role="dialog" aria-labelledby="statsTitle">
                <div class="stats-header">
                    <h2 id="statsTitle">\U0001f3c6 Leaderboard</h2>
                    <button class="stats-close" aria-label="Close dashboard">\u2715</button>
                </div>
                <div class="stats-tabs" role="tablist">
                    <button class="stats-tab stats-tab-active" role="tab" data-tab="leaderboard" aria-selected="true">\U0001f3c6 Leaderboard</button>
                    <button class="stats-tab" role="tab" data-tab="stats" aria-selected="false">\U0001f4ca Stats</button>
                </div>
                <div class="stats-content">
                    <div class="stats-panel" id="panelLeaderboard"></div>
                    <div class="stats-panel" id="panelStats" style="display:none"></div>
                </div>
                <div class="stats-footer">
                    <button class="stats-button stats-clear-btn">\U0001f5d1\ufe0f Clear Data</button>
                    <button class="stats-button stats-done-btn">Done</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    setupEventHandlers() {
        this.overlay.querySelector('.stats-close').addEventListener('click', () => this.close());
        this.overlay.querySelector('.stats-done-btn').addEventListener('click', () => this.close());
        this.overlay.querySelector('.stats-clear-btn').addEventListener('click', () => this.showClearConfirm());
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
        this.overlay.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            if (e.code === 'Escape') { e.preventDefault(); this.close(); }
            else if (e.code === 'Tab') { e.preventDefault(); this.handleTabNavigation(e.shiftKey); }
        });
    }

    handleTabNavigation(reverse) {
        this.focusableElements = Array.from(this.overlay.querySelectorAll(
            'button:not([style*="display: none"]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
        if (this.focusableElements.length === 0) return;
        if (reverse) {
            this.focusIndex = (this.focusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        } else {
            this.focusIndex = (this.focusIndex + 1) % this.focusableElements.length;
        }
        this.focusableElements[this.focusIndex].focus();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.overlay.querySelectorAll('.stats-tab').forEach(t => {
            const active = t.dataset.tab === tabName;
            t.classList.toggle('stats-tab-active', active);
            t.setAttribute('aria-selected', active);
        });
        const titleEl = this.overlay.querySelector('#statsTitle');
        const lbPanel = this.overlay.querySelector('#panelLeaderboard');
        const stPanel = this.overlay.querySelector('#panelStats');
        if (tabName === 'leaderboard') {
            titleEl.textContent = '\U0001f3c6 Leaderboard';
            lbPanel.style.display = ''; stPanel.style.display = 'none';
        } else {
            titleEl.textContent = '\U0001f4ca Stats';
            lbPanel.style.display = 'none'; stPanel.style.display = '';
        }
    }

    renderLeaderboard() {
        const panel = this.overlay.querySelector('#panelLeaderboard');
        const scores = this.highScores.getScores();
        if (scores.length === 0) {
            panel.innerHTML = '<div class="stats-empty"><div style="font-size:48px;margin-bottom:12px;">\U0001f369</div><div style="color:#ffd800;font-size:20px;">No scores yet!</div><div style="color:#aaa;font-size:15px;margin-top:8px;font-family:Arial,sans-serif;">Play a game to see your scores here.</div></div>';
            return;
        }
        const rank = this.highScores.getRank();
        let html = '<div class="lb-rank-banner">' + rank.emoji + ' ' + rank.name + ' \u2014 ' + this.highScores.lifetimeStats.totalDonutsEaten.toLocaleString() + ' donuts lifetime</div>';
        html += '<div class="lb-scroll"><table class="lb-table" role="grid"><thead><tr><th>#</th><th>Name</th><th>Score</th><th>Lvl</th><th>Combo</th><th>Diff</th><th>Date</th></tr></thead><tbody>';
        scores.forEach((s, i) => {
            const pos = i + 1;
            const isTop3 = pos <= 3;
            const isCurrent = this._lastGameScore !== null && s.score === this._lastGameScore && s.date === this._lastGameDate;
            const medalEmoji = pos === 1 ? '\U0001f947' : pos === 2 ? '\U0001f948' : pos === 3 ? '\U0001f949' : '';
            const rowClass = isCurrent ? 'lb-row-current' : isTop3 ? 'lb-row-top3' : '';
            const comboStr = s.combo > 1 ? '\U0001f525' + s.combo + 'x' : '\u2014';
            const diffLabel = s.difficulty ? this._capFirst(s.difficulty) : '\u2014';
            const dateStr = this._shortDate(s.date);
            html += '<tr class="' + rowClass + '">';
            html += '<td class="lb-pos">' + (medalEmoji || pos) + '</td>';
            html += '<td class="lb-name">' + this._escapeHtml(s.name) + '</td>';
            html += '<td class="lb-score">' + s.score.toLocaleString() + '</td>';
            html += '<td>' + s.level + '</td>';
            html += '<td>' + comboStr + '</td>';
            html += '<td class="lb-diff">' + diffLabel + '</td>';
            html += '<td class="lb-date">' + dateStr + '</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        panel.innerHTML = html;
    }

    renderStats() {
        const panel = this.overlay.querySelector('#panelStats');
        const stats = this.highScores.getLifetimeStats();
        const rank = this.highScores.getRank();
        const currentIdx = RANK_BADGES.findIndex(b => b.id === rank.id);
        let nextRankHtml = '';
        if (currentIdx > 0) {
            const nextRank = RANK_BADGES[currentIdx - 1];
            const remaining = nextRank.minDonuts - stats.totalDonutsEaten;
            nextRankHtml = '<div class="stats-next-rank">Next: ' + nextRank.emoji + ' ' + nextRank.name + ' \u2014 ' + remaining.toLocaleString() + ' donuts to go</div>';
        } else {
            nextRankHtml = '<div class="stats-next-rank" style="color:#ffd800;">Max rank achieved! \U0001f451</div>';
        }
        const playTime = this._formatTime(stats.totalPlayTimeMs);
        let bestByDiff = '';
        for (const diff of ['easy', 'normal', 'hard']) {
            const best = stats.bestScoreByDifficulty[diff];
            if (best !== undefined) {
                bestByDiff += '<div class="stat-row"><span class="stat-label">' + this._capFirst(diff) + '</span><span class="stat-value">' + best.toLocaleString() + '</span></div>';
            }
        }
        if (!bestByDiff) bestByDiff = '<div class="stat-row"><span class="stat-label" style="color:#888;">No games played yet</span></div>';
        let progressHtml = '';
        if (currentIdx > 0) {
            const nextRank = RANK_BADGES[currentIdx - 1];
            const prevMin = rank.minDonuts;
            const nextMin = nextRank.minDonuts;
            const progress = Math.min(100, ((stats.totalDonutsEaten - prevMin) / (nextMin - prevMin)) * 100);
            progressHtml = '<div class="stats-progress-bar"><div class="stats-progress-fill" style="width:' + progress + '%"></div></div>';
        }
        const comboDisplay = stats.highestCombo > 1 ? '\U0001f525 ' + stats.highestCombo + 'x' : '\u2014';
        const badgesHtml = RANK_BADGES.slice().reverse().map(b => {
            const earned = stats.totalDonutsEaten >= b.minDonuts;
            return '<div class="stats-badge ' + (earned ? 'stats-badge-earned' : 'stats-badge-locked') + '"><span class="stats-badge-emoji">' + (earned ? b.emoji : '\U0001f512') + '</span><span class="stats-badge-name">' + b.name + '</span><span class="stats-badge-req">' + b.minDonuts.toLocaleString() + ' donuts</span></div>';
        }).join('');
        panel.innerHTML = '<div class="stats-rank-section"><div class="stats-rank-badge">' + rank.emoji + '</div><div class="stats-rank-name">' + rank.name + '</div>' + progressHtml + nextRankHtml + '</div>' +
            '<section class="stats-section"><h3>\U0001f4c8 Lifetime Stats</h3>' +
            '<div class="stat-row"><span class="stat-label">Games Played</span><span class="stat-value">' + stats.totalGames + '</span></div>' +
            '<div class="stat-row"><span class="stat-label">Donuts Eaten</span><span class="stat-value">' + stats.totalDonutsEaten.toLocaleString() + '</span></div>' +
            '<div class="stat-row"><span class="stat-label">Ghosts Eaten</span><span class="stat-value">' + stats.totalGhostsEaten.toLocaleString() + '</span></div>' +
            '<div class="stat-row"><span class="stat-label">Highest Combo</span><span class="stat-value">' + comboDisplay + '</span></div>' +
            '<div class="stat-row"><span class="stat-label">Highest Level</span><span class="stat-value">' + (stats.highestLevel || '\u2014') + '</span></div>' +
            '<div class="stat-row"><span class="stat-label">Play Time</span><span class="stat-value">' + playTime + '</span></div>' +
            '</section>' +
            '<section class="stats-section"><h3>\U0001f3c5 Best Score by Difficulty</h3>' + bestByDiff + '</section>' +
            '<section class="stats-section"><h3>\U0001f396\ufe0f Rank Progression</h3><div class="stats-badges-grid">' + badgesHtml + '</div></section>';
    }

    showClearConfirm() {
        const footer = this.overlay.querySelector('.stats-footer');
        const what = this.activeTab === 'leaderboard' ? 'scores' : 'stats';
        footer.innerHTML = '<div class="stats-confirm"><span style="color:#ff6b6b;">Clear all ' + what + '?</span><div style="display:flex;gap:8px;margin-top:8px;"><button class="stats-button stats-cancel-btn">Cancel</button><button class="stats-button stats-confirm-btn">Yes, Clear</button></div></div>';
        footer.querySelector('.stats-cancel-btn').addEventListener('click', () => this.restoreFooter());
        footer.querySelector('.stats-confirm-btn').addEventListener('click', () => {
            if (this.activeTab === 'leaderboard') { this.highScores.clearScores(); this.renderLeaderboard(); }
            else { this.highScores.clearLifetimeStats(); this.renderStats(); }
            this.restoreFooter();
        });
    }

    restoreFooter() {
        const footer = this.overlay.querySelector('.stats-footer');
        footer.innerHTML = '<button class="stats-button stats-clear-btn">\U0001f5d1\ufe0f Clear Data</button><button class="stats-button stats-done-btn">Done</button>';
        footer.querySelector('.stats-clear-btn').addEventListener('click', () => this.showClearConfirm());
        footer.querySelector('.stats-done-btn').addEventListener('click', () => this.close());
    }

    _shortDate(iso) {
        if (!iso) return '\u2014';
        try { const d = new Date(iso); return (d.getMonth() + 1) + '/' + d.getDate(); }
        catch (e) { return '\u2014'; }
    }

    _capFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    _formatTime(ms) {
        if (!ms || ms <= 0) return '0m';
        const totalSec = Math.floor(ms / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        if (hours > 0) return hours + 'h ' + mins + 'm';
        return mins + 'm';
    }

    open(tab, lastGameScore, lastGameDate) {
        this._lastGameScore = lastGameScore || null;
        this._lastGameDate = lastGameDate || null;
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        if (tab === 'stats' || tab === 'leaderboard') this.switchTab(tab);
        this.renderLeaderboard();
        this.renderStats();
        this.focusIndex = 0;
        setTimeout(() => {
            this.focusableElements = Array.from(this.overlay.querySelectorAll(
                'button:not([style*="display: none"]), [tabindex]:not([tabindex="-1"])'
            )).filter(el => !el.disabled && el.offsetParent !== null);
            if (this.focusableElements.length > 0) this.focusableElements[0].focus();
        }, 50);
    }

    close() {
        this.isOpen = false;
        this.overlay.style.display = 'none';
        this._lastGameScore = null;
        this._lastGameDate = null;
    }

    toggle(tab) {
        if (this.isOpen) this.close();
        else this.open(tab || 'leaderboard');
    }
}
