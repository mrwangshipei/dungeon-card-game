// ============ 战斗系统 ============
const CombatSystem = {
    useCard(gs, cardIndex, addLogFn) {
        const card = gs.hand[cardIndex];
        if (!card || gs.energy < card.cost) {
            addLogFn('能量不足!', 'damage');
            return false;
        }

        gs.energy -= card.cost;

        if (card.type === 'attack') {
            let damage = card.damage;
            if (gs.weakened) damage = Math.floor(damage / 2);
            gs.currentEnemy.currentHp -= damage;
            addLogFn(`使用 ${card.name}, 造成 ${damage} 伤害!`, 'damage');

            if (gs.currentEnemy.currentHp > 0 && !gs.enemyStunned) {
                return { enemyCounter: true };
            } else if (gs.enemyStunned) {
                gs.enemyStunned = false;
                addLogFn('敌人畏缩无法攻击!', 'event');
            }
        } else if (card.type === 'defense') {
            gs.shield += card.shield;
            addLogFn(`使用 ${card.name}, 护盾 +${card.shield}!`, 'event');
        } else if (card.type === 'skill') {
            DeckManager.drawCards(gs, card.draw);
            addLogFn(`使用 ${card.name}, 抽 ${card.draw} 张牌!`, 'event');
        }

        DeckManager.discardFromHand(gs, cardIndex);

        if (gs.currentEnemy && gs.currentEnemy.currentHp <= 0) {
            return { battleEnd: true, victory: true };
        }

        return { success: true };
    },

    enemyAttack(gs, addLogFn) {
        if (!gs.currentEnemy) return;

        let damage = gs.currentEnemy.damage;
        if (gs.weakened) damage = Math.floor(damage / 2);

        if (gs.shield > 0) {
            const absorbed = Math.min(gs.shield, damage);
            gs.shield -= absorbed;
            damage -= absorbed;
            addLogFn(`护盾吸收 ${absorbed} 伤害`, 'event');
        }

        if (damage > 0) {
            gs.hp -= damage;
            addLogFn(`敌人攻击! -${damage}HP`, 'damage');
        }

        if (gs.currentEnemy.trait === '吸血' && damage > 0) {
            gs.currentEnemy.currentHp = Math.min(gs.currentEnemy.maxHp, gs.currentEnemy.currentHp + 5);
            addLogFn('敌人吸血 +5HP', 'damage');
        }
    },

    takeDamage(gs, amount) {
        if (gs.shield > 0) {
            const absorbed = Math.min(gs.shield, amount);
            gs.shield -= absorbed;
            amount -= absorbed;
        }
        gs.hp = Math.max(0, gs.hp - amount);
    },

    startBattle(gs, enemy) {
        gs.currentEnemy = { ...enemy, currentHp: enemy.hp, maxHp: enemy.hp };
        gs.enemyStunned = false;
        gs.hand = [];
        gs.energy = gs.maxEnergy;
        DeckManager.drawCards(gs, 4);
    },

    endBattle(gs, victory, addLogFn) {
        if (victory) {
            const goldReward = Math.floor(Math.random() * 30) + 10 * gs.level;
            gs.gold += goldReward;
            addLogFn(`胜利! 获得 ${goldReward} 金币`, 'gold');

            if (Math.random() < 0.3) {
                const event = POSITIVE_EVENTS[Math.floor(Math.random() * POSITIVE_EVENTS.length)];
                const msg = event.effect(gs);
                addLogFn('战斗奖励: ' + msg, 'event');
            }

            gs.hand.forEach(c => gs.discardPile.push(c));
            gs.hand = [];
        }

        gs.currentEnemy = null;
    },

    flee(gs, addLogFn, enemyAttackFn) {
        if (Math.random() < 0.5) {
            addLogFn('逃跑成功!', 'event');
            return { success: true, fled: true };
        } else {
            addLogFn('逃跑失败!', 'damage');
            enemyAttackFn();
            return { success: true, fled: false };
        }
    },

    getEnemyDamage(gs) {
        let damage = gs.currentEnemy.damage;
        if (gs.weakened) damage = Math.floor(damage / 2);
        return damage;
    }
};
