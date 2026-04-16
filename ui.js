// ============ UI 管理器 ============
const UIManager = {
    render(gs) {
        this.updateStats(gs);
        this.updateHand(gs.hand);
        this.updateDeckCounts(gs);
        this.updateStatusEffects(gs);
        this.updateButtons(gs);
    },

    updateStats(gs) {
        document.getElementById('hpBar').style.width = (gs.hp / gs.maxHp * 100) + '%';
        document.getElementById('hpText').textContent = `${gs.hp}/${gs.maxHp}`;

        document.getElementById('foodBar').style.width = (gs.food / gs.maxFood * 100) + '%';
        document.getElementById('foodText').textContent = `${gs.food}/${gs.maxFood}`;

        document.getElementById('shieldBar').style.width = Math.min(100, gs.shield) + '%';
        document.getElementById('shieldText').textContent = gs.shield;

        document.getElementById('goldText').textContent = gs.gold;
        document.getElementById('levelText').textContent = gs.level;

        const pips = document.getElementById('energyPips').children;
        for (let i = 0; i < pips.length; i++) {
            pips[i].classList.toggle('active', i < gs.energy);
        }
    },

    updateHand(hand) {
        const canUse = Game.canUseCard();
        const gs = Game.state;
        const handDiv = document.getElementById('cardsHand');
        handDiv.innerHTML = '';
        hand.forEach((card, idx) => {
            const cardDiv = document.createElement('div');
            const canPlay = canUse && gs.energy >= card.cost;
            cardDiv.className = `card ${card.type}${canPlay ? ' usable' : ' disabled'}`;
            cardDiv.innerHTML = `
                <div class="card-cost">${card.cost}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-effect">${card.desc}</div>
            `;
            if (canPlay) {
                cardDiv.onclick = () => Game.useCard(idx);
            }
            handDiv.appendChild(cardDiv);
        });
    },

    updateDeckCounts(gs) {
        document.getElementById('deckCount').textContent = gs.deck.length;
        document.getElementById('discardCount').textContent = gs.discardPile.length;
    },

    updateStatusEffects(gs) {
        const statusDiv = document.getElementById('statusEffects');
        statusDiv.innerHTML = '';
        if (gs.poisoned) statusDiv.innerHTML += '<span class="status-icon poison">中毒</span>';
        if (gs.weakened) statusDiv.innerHTML += '<span class="status-icon weak">虚弱</span>';
        if (gs.shield > 0) statusDiv.innerHTML += `<span class="status-icon shield">护盾 ${gs.shield}</span>`;
    },

    updateButtons(gs) {
        const btnDraw = document.getElementById('btnDraw');
        const btnEndTurn = document.getElementById('btnEndTurn');
        const btnFlee = document.getElementById('btnFlee');

        const canDraw = Game.canDrawCards();
        const canEndTurn = Game.canEndTurn();
        const canFlee = Game.canFlee();

        btnDraw.disabled = !canDraw;
        btnEndTurn.disabled = !canEndTurn;
        btnFlee.classList.toggle('hidden', !canFlee);

        btnDraw.classList.toggle('usable', canDraw);
        btnEndTurn.classList.toggle('usable', canEndTurn);
        btnFlee.classList.toggle('usable', canFlee);
    },

    updateEnemy(enemy) {
        if (!enemy) {
            document.getElementById('enemyInfo').classList.add('hidden');
            return;
        }
        const hpPercent = Math.max(0, enemy.currentHp / enemy.maxHp * 100);
        document.getElementById('enemyHpBar').style.width = hpPercent + '%';
        document.getElementById('enemyHpText').textContent = `${Math.max(0, enemy.currentHp)}/${enemy.maxHp}`;
    },

    showEnemyInfo(enemy) {
        document.getElementById('enemyInfo').classList.remove('hidden');
        document.getElementById('enemyName').textContent = enemy.name;
        document.getElementById('enemyTrait').textContent = enemy.trait || '';
    },

    hideEnemyInfo() {
        document.getElementById('enemyInfo').classList.add('hidden');
    },

    showFleeButton() {
        document.getElementById('btnFlee').classList.remove('hidden');
    },

    hideFleeButton() {
        document.getElementById('btnFlee').classList.add('hidden');
    },

    setPanel(title, text, appendState = true) {
        document.getElementById('panelTitle').textContent = title;
        document.getElementById('eventText').innerHTML = text + (appendState ? `<br><small>[${GameState.getDescription()}]</small>` : '');
    },

    showChoicePanel(title, text, choices, onConfirm) {
        const panel = document.getElementById('eventPanel');
        document.getElementById('panelTitle').textContent = title;
        let html = text + '<div class="choice-buttons">';
        choices.forEach((choice, idx) => {
            const canAfford = !choice.cost || Game.state.gold >= choice.cost;
            html += `<button class="choice-btn" ${canAfford ? '' : 'disabled'} onclick="Game.confirmChoice(${idx})">${choice.text}</button>`;
        });
        html += '</div>';
        document.getElementById('eventText').innerHTML = html;
        Game.currentChoices = choices;
        Game.onConfirmChoice = onConfirm;
    },

    showOverlay(id) {
        document.getElementById(id).classList.remove('hidden');
    },

    hideOverlay(id) {
        document.getElementById(id).classList.add('hidden');
    },

    showGameOver(gs) {
        this.showOverlay('gameOverOverlay');
        document.getElementById('gameOverTitle').textContent = '💀 游戏结束';
        document.getElementById('gameOverText').textContent = `你在第 ${gs.level} 层倒下了...`;
        document.getElementById('finalGold').textContent = gs.gold;
    },

    hideStartOverlay() {
        this.hideOverlay('startOverlay');
    },

    clearLog() {
        document.getElementById('logContainer').innerHTML = '';
    },

    addLogEntry(entry) {
        const log = document.getElementById('logContainer');
        log.insertBefore(entry, log.firstChild);
        if (log.children.length > 20) log.removeChild(log.lastChild);
    }
};
