// ============ 游戏主逻辑 ============
const Game = {
    state: null,

    init() {
        this.state = this.createInitialState();
        Renderer.init();
        this.generateMap();
        UIManager.render(this.state);
        Renderer.drawMap();
        UIManager.clearLog();
        this.addLog('冒险开始!', 'event');
    },

    createInitialState() {
        return {
            hp: 100, maxHp: 100,
            energy: 3, maxEnergy: 3,
            food: 100, maxFood: 100,
            shield: 0,
            gold: 0,
            level: 1,
            playerX: 0, playerY: 0,
            exitX: 9, exitY: 9,
            currentEnemy: null,
            deck: DeckManager.generateStartingDeck(),
            hand: [],
            discardPile: [],
            map: [],
            explored: [],
            poisoned: false,
            weakened: false,
            enemyStunned: false,
            turnCount: 0
        };
    },

    generateMap() {
        const gs = this.state;
        gs.map = [];
        gs.explored = [];

        for (let y = 0; y < 10; y++) {
            gs.map[y] = [];
            gs.explored[y] = [];
            for (let x = 0; x < 10; x++) {
                gs.map[y][x] = { type: 'empty', revealed: false };
                gs.explored[y][x] = false;
            }
        }

        gs.playerX = 0;
        gs.playerY = 0;
        gs.map[0][0].type = 'start';
        gs.map[0][0].revealed = true;
        gs.explored[0][0] = true;

        gs.exitX = 9;
        gs.exitY = 9;
        gs.map[9][9].type = 'exit';

        const positions = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if ((x === 0 && y === 0) || (x === 9 && y === 9)) continue;
                positions.push({x, y});
            }
        }
        DeckManager.shuffle(positions);

        const enemyCount = 5 + Math.floor(gs.level * 1.5);
        for (let i = 0; i < enemyCount && i < positions.length; i++) {
            const pos = positions[i];
            const enemy = this.getRandomEnemyForLevel();
            gs.map[pos.y][pos.x] = { type: 'enemy', enemy: enemy, revealed: false };
        }

        const rewardCount = 3 + Math.floor(gs.level * 0.5);
        for (let i = enemyCount; i < enemyCount + rewardCount && i < positions.length; i++) {
            const pos = positions[i];
            gs.map[pos.y][pos.x] = { type: 'reward', revealed: false };
        }

        const dangerCount = 3 + Math.floor(gs.level * 0.3);
        for (let i = enemyCount + rewardCount; i < enemyCount + rewardCount + dangerCount && i < positions.length; i++) {
            const pos = positions[i];
            gs.map[pos.y][pos.x] = { type: 'danger', revealed: false };
        }
    },

    getRandomEnemyForLevel() {
        const level = this.state.level;
        let pool;
        if (level <= 2) {
            pool = ENEMIES.filter(e => e.rarity === 'weak');
        } else if (level <= 4) {
            pool = ENEMIES.filter(e => e.rarity === 'weak' || e.rarity === 'normal');
        } else {
            pool = [...ENEMIES];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    },

    getAdjacentTiles() {
        const px = this.state.playerX;
        const py = this.state.playerY;
        return [
            {x: px-1, y: py}, {x: px+1, y: py},
            {x: px, y: py-1}, {x: px, y: py+1}
        ].filter(t => t.x >= 0 && t.x < 10 && t.y >= 0 && t.y < 10);
    },

    // ============ 状态检查 ============

    canMove() {
        return GameState.current === GameState.EXPLORING;
    },

    canUseCard() {
        return GameState.current === GameState.BATTLE;
    },

    canEndTurn() {
        return GameState.current === GameState.EXPLORING || GameState.current === GameState.BATTLE;
    },

    canFlee() {
        return GameState.current === GameState.BATTLE;
    },

    canDrawCards() {
        return GameState.current === GameState.EXPLORING || GameState.current === GameState.BATTLE;
    },

    // ============ 核心动作 ============

    handleTileClick(x, y) {
        if (!this.canMove()) {
            this.addLog('当前无法移动!', 'event');
            return;
        }

        const adjacent = this.getAdjacentTiles();
        const isAdjacent = adjacent.some(t => t.x === x && t.y === y);

        if (!isAdjacent) {
            this.addLog('只能移动到相邻格子', 'event');
            return;
        }

        const gs = this.state;

        // 消耗饱食度
        if (gs.food > 0) {
            gs.food = Math.max(0, gs.food - 5);
        } else {
            CombatSystem.takeDamage(gs, 10);
            this.addLog('饥饿损失! -10HP', 'damage');
        }

        // 中毒效果
        if (gs.poisoned) {
            CombatSystem.takeDamage(gs, 5);
            this.addLog('中毒损失! -5HP', 'damage');
        }

        // 移动
        gs.playerX = x;
        gs.playerY = y;
        gs.explored[y][x] = true;
        gs.map[y][x].revealed = true;

        // 根据目标类型转换状态
        if (x === gs.exitX && y === gs.exitY) {
            this.handleLevelComplete();
        } else if (gs.map[y][x].type === 'enemy') {
            this.startBattle(gs.map[y][x].enemy);
        } else if (gs.map[y][x].type === 'reward') {
            this.handleReward();
        } else if (gs.map[y][x].type === 'danger') {
            this.handleDanger();
        }

        UIManager.render(gs);
        Renderer.drawMap();
        this.checkGameOver();
    },

    handleLevelComplete() {
        GameState.forceSet(GameState.LEVEL_COMPLETE);
        this.addLog('到达下一层!', 'event');
        const reward = LEVEL_REWARDS[Math.floor(Math.random() * LEVEL_REWARDS.length)];
        const msg = reward();
        this.addLog('奖励: ' + msg, 'gold');

        this.state.level++;
        this.generateMap();
        UIManager.setPanel('🎊 关卡完成', `第 ${this.state.level - 1} 层完成！进入第 ${this.state.level} 层`, false);

        setTimeout(() => this.continueGame(), 1500);
    },

    handleReward() {
        GameState.forceSet(GameState.REWARD);
        const event = POSITIVE_EVENTS[Math.floor(Math.random() * POSITIVE_EVENTS.length)];
        const msg = event.effect(this.state);
        this.addLog(msg, 'heal');
        UIManager.setPanel('🎉 奖励', event.text, false);
    },

    handleDanger() {
        GameState.forceSet(GameState.DANGER);
        const event = NEGATIVE_EVENTS[Math.floor(Math.random() * NEGATIVE_EVENTS.length)];
        const msg = event.effect(this.state);
        this.addLog(msg, 'damage');
        UIManager.setPanel('⚠️ 危险', event.text, false);
    },

    continueGame() {
        if (GameState.current === GameState.REWARD || GameState.current === GameState.DANGER) {
            GameState.setState(GameState.EXPLORING);
            UIManager.setPanel('探索地牢', '点击地图上的格子开始探索。消耗饱食度移动，遭遇敌人时进入战斗。', false);
        }
    },

    startBattle(enemy) {
        GameState.forceSet(GameState.BATTLE);
        CombatSystem.startBattle(this.state, enemy);

        UIManager.setPanel('⚔️ 战斗中', `遭遇 ${enemy.name}！`, false);
        UIManager.showEnemyInfo(enemy);
        UIManager.showFleeButton();
        UIManager.updateEnemy(this.state.currentEnemy);
        UIManager.render(this.state);
    },

    endBattle(victory) {
        const gs = this.state;
        GameState.forceSet(GameState.EXPLORING);

        CombatSystem.endBattle(gs, victory, (msg, type) => this.addLog(msg, type));

        UIManager.hideEnemyInfo();
        UIManager.hideFleeButton();
        UIManager.setPanel('探索地牢', victory ? '战斗胜利，继续探索！' : '你逃跑了...', false);

        UIManager.render(gs);
        Renderer.drawMap();
    },

    useCard(cardIndex) {
        if (!this.canUseCard()) {
            this.addLog('当前无法使用卡牌!', 'event');
            return;
        }

        const gs = this.state;
        const card = gs.hand[cardIndex];
        if (!card || gs.energy < card.cost) {
            this.addLog('能量不足!', 'damage');
            return;
        }

        const result = CombatSystem.useCard(gs, cardIndex, (msg, type) => this.addLog(msg, type));

        UIManager.render(gs);
        UIManager.updateEnemy(gs.currentEnemy);

        if (result && result.enemyCounter) {
            setTimeout(() => this.enemyAttack(), 500);
        } else if (result && result.battleEnd) {
            setTimeout(() => this.endBattle(true), 300);
        }

        this.checkGameOver();
    },

    enemyAttack() {
        if (GameState.current !== GameState.BATTLE) return;

        const gs = this.state;
        CombatSystem.enemyAttack(gs, (msg, type) => this.addLog(msg, type));

        UIManager.render(gs);
        this.checkGameOver();
    },

    drawCards(count) {
        if (!this.canDrawCards()) {
            return;
        }

        DeckManager.drawCards(this.state, count);
        UIManager.render(this.state);
    },

    discardRandomCards(count) {
        const gs = this.state;
        for (let i = 0; i < count && gs.hand.length > 0; i++) {
            const idx = Math.floor(Math.random() * gs.hand.length);
            const card = gs.hand.splice(idx, 1)[0];
            gs.discardPile.push(card);
            this.addLog(`弃牌: ${card.name}`, 'event');
        }
        UIManager.render(gs);
    },

    getRandomCard() {
        return DeckManager.getRandomCard();
    },

    addCardToDeck(card) {
        DeckManager.addCard(this.state, card);
    },

    endTurn() {
        if (!this.canEndTurn()) {
            this.addLog('当前无法结束回合!', 'event');
            return;
        }

        const gs = this.state;
        gs.turnCount++;
        gs.energy = gs.maxEnergy;
        DeckManager.drawCards(gs, 2);

        if (gs.poisoned) {
            CombatSystem.takeDamage(gs, 5);
            this.addLog('中毒回合伤害 -5HP', 'damage');
        }

        UIManager.render(gs);
        this.checkGameOver();
    },

    fleeEnemy() {
        if (!this.canFlee()) {
            this.addLog('当前无法逃跑!', 'event');
            return;
        }

        const gs = this.state;
        const result = CombatSystem.flee(
            gs,
            (msg, type) => this.addLog(msg, type),
            () => CombatSystem.enemyAttack(gs, (msg, type) => this.addLog(msg, type))
        );

        if (result.fled) {
            this.endBattle(false);
        } else {
            UIManager.render(gs);
            this.checkGameOver();
        }
    },

    confirmAction() {
        if (GameState.current === GameState.REWARD || GameState.current === GameState.DANGER) {
            this.continueGame();
        } else if (GameState.current === GameState.LEVEL_COMPLETE) {
            GameState.forceSet(GameState.EXPLORING);
            UIManager.setPanel('探索地牢', '点击地图上的格子开始探索。消耗饱食度移动，遭遇敌人时进入战斗。', false);
        }
    },

    checkGameOver() {
        if (this.state.hp <= 0) {
            GameState.forceSet(GameState.GAME_OVER);
            UIManager.showGameOver(this.state);
        }
    },

    restart() {
        UIManager.hideOverlay('gameOverOverlay');
        this.init();
        GameState.forceSet(GameState.EXPLORING);
    },

    start() {
        UIManager.hideStartOverlay();
        GameState.forceSet(GameState.EXPLORING);
        this.init();
    },

    takeDamage(amount) {
        CombatSystem.takeDamage(this.state, amount);
    },

    addLog(text, type) {
        const log = document.getElementById('logContainer');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = `[${this.state.turnCount}] ${text}`;
        log.insertBefore(entry, log.firstChild);
        if (log.children.length > 20) log.removeChild(log.lastChild);
    },

    updateUI() {
        UIManager.render(this.state);
    },

    updateEnemyUI() {
        UIManager.updateEnemy(this.state.currentEnemy);
    },

    updateButtons() {
        UIManager.updateButtons(this.state);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UIManager.showOverlay('startOverlay');
});
