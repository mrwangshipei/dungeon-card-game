// ============ 战斗系统 ============
const CombatSystem = {
    useCard(gs, cardIndex, addLogFn) {
        const card = gs.hand[cardIndex];
        if (!card || gs.energy < card.cost) {
            addLogFn('能量不足!', 'damage');
            return false;
        }

        // 战术撤退：检查是否无法攻击
        if (gs.cantAttackThisTurn && card.type === 'attack') {
            addLogFn('本回合无法攻击!', 'damage');
            return false;
        }

        gs.energy -= card.cost;
        DeckManager.discardFromHand(gs, cardIndex);

        // 技能卡效果
        if (card.type === 'skill') {
            if (card.draw) {
                DeckManager.drawCards(gs, card.draw);
                addLogFn(`使用 ${card.name}, 抽 ${card.draw} 张牌!`, 'event');
            }
            if (card.restoreFood) {
                gs.food = Math.min(gs.maxFood, gs.food + card.restoreFood);
                addLogFn(`使用 ${card.name}, 饱食度 +${card.restoreFood}!`, 'heal');
            }
            if (card.energyGain) {
                gs.energy += card.energyGain;
                gs.nextTurnHpCost = card.hpCost;
                addLogFn(`使用 ${card.name}, 能量 +${card.energyGain}!`, 'event');
            }
            if (card.weakenEnemy) {
                gs.enemyWeakened = true;
                addLogFn(`使用 ${card.name}, 敌人伤害-50%!`, 'event');
            }
            if (card.damageBoost) {
                gs.attackBoosted = true;
                gs.poisonSelfTurns = card.poisonSelf;
                addLogFn(`使用 ${card.name}, 攻击+100%!`, 'event');
            }
            if (card.cantAttack) {
                gs.cantAttackThisTurn = true;
                addLogFn(`使用 ${card.name}, 本回合无法攻击!`, 'event');
            }
        }

        // 防御卡效果
        if (card.type === 'defense') {
            let shieldAmount = card.shield;
            // 护盾精通：若本回合已用防御牌，额外+8
            if (card.shieldBonusIfDefUsed && gs.defenseUsedThisTurn) {
                shieldAmount += card.shieldBonusIfDefUsed;
                addLogFn(`护盾精通触发! +${card.shieldBonusIfDefUsed}`, 'event');
            }
            gs.shield += shieldAmount;
            gs.defenseUsedThisTurn = true;
            addLogFn(`使用 ${card.name}, 护盾 +${shieldAmount}!`, 'event');

            if (card.reduceDamage) {
                gs.reduceNextDamage = true;
                addLogFn(`下回合伤害-50%!`, 'event');
            }
            if (card.reflect) {
                gs.reflectNextAttack = true;
                addLogFn(`下次攻击反弹50%!`, 'event');
            }
        }

        // 攻击卡效果
        if (card.type === 'attack') {
            let damage = card.damage;

            // 能量爆发：消耗所有能量转伤害
            if (card.energyToDamage) {
                const bonusDamage = gs.energy * card.energyToDamage;
                damage += bonusDamage;
                gs.energy = 0;
                addLogFn(`能量转化! +${bonusDamage}伤害`, 'event');
            }

            // 护盾粉碎：护盾转伤害
            if (card.shieldToDamage && gs.shield > 0) {
                const bonusDamage = Math.floor(gs.shield * card.shieldToDamage);
                damage += bonusDamage;
                gs.shield = 0;
                addLogFn(`护盾粉碎! +${bonusDamage}伤害`, 'event');
            }

            // 复仇：受到伤害越多伤害越高
            if (card.revenge) {
                const damageTaken = gs.maxHp - gs.hp;
                const revengeBonus = Math.floor(damageTaken / 5) * 3;
                if (revengeBonus > 0) {
                    damage += revengeBonus;
                    addLogFn(`复仇之力! +${revengeBonus}伤害`, 'event');
                }
            }

            // 攻击加成（狂暴）
            if (gs.attackBoosted) {
                damage *= 2;
                gs.attackBoosted = false;
            }

            // 永久攻击加成
            if (gs.attackBonus) {
                damage += gs.attackBonus;
            }

            // 虚弱状态减半
            if (gs.weakened) damage = Math.floor(damage / 2);

            // 连击效果
            if (card.combo && gs.comboUsedThisTurn) {
                damage *= 2;
                addLogFn(`连击触发! 伤害 x2`, 'event');
            }
            gs.comboUsedThisTurn = true;

            // 突袭：敌人HP<50%时伤害翻倍
            if (card.executeBonus && gs.currentEnemy.currentHp < gs.currentEnemy.maxHp * 0.5) {
                damage *= 2;
                addLogFn(`突袭! 伤害 x2`, 'event');
            }

            // 破碎甲：消除敌人护盾
            if (card.breakArmor) {
                gs.currentEnemy.shield = 0;
                addLogFn(`破甲! 敌人护盾归零`, 'event');
            }

            // 忽略护盾伤害
            let actualDamage = damage;
            if (!card.ignoreShield && gs.currentEnemy.shield && gs.currentEnemy.shield > 0) {
                const shieldAbsorbed = Math.min(gs.currentEnemy.shield, damage);
                gs.currentEnemy.shield -= shieldAbsorbed;
                actualDamage = damage - shieldAbsorbed;
                addLogFn(`护盾吸收 ${shieldAbsorbed}`, 'event');
            }

            // 造成伤害
            gs.currentEnemy.currentHp -= actualDamage;
            addLogFn(`使用 ${card.name}, 造成 ${actualDamage} 伤害!`, 'damage');

            // 反射伤害
            if (gs.reflectNextAttack && actualDamage > 0) {
                const reflectedDamage = Math.floor(actualDamage * 0.5);
                gs.currentEnemy.currentHp -= reflectedDamage;
                gs.reflectNextAttack = false;
                addLogFn(`反射伤害 +${reflectedDamage}`, 'event');
            }

            // 吸血效果
            if (card.lifesteal) {
                gs.hp = Math.min(gs.maxHp, gs.hp + card.lifesteal);
                addLogFn(`吸血 +${card.lifesteal}HP`, 'heal');
            }
            if (card.lifestealPercent) {
                const healAmount = Math.floor(actualDamage * card.lifestealPercent);
                gs.hp = Math.min(gs.maxHp, gs.hp + healAmount);
                addLogFn(`吸血 +${healAmount}HP`, 'heal');
            }

            // 击杀回复
            if (card.killHeal && gs.currentEnemy.currentHp <= 0) {
                gs.hp = Math.min(gs.maxHp, gs.hp + card.killHeal);
                addLogFn(`击杀回复 +${card.killHeal}HP`, 'heal');
            }

            // 痛苦收割：中毒敌人额外伤害
            if (card.poisonDamage && gs.currentEnemy.poisoned) {
                gs.currentEnemy.currentHp -= card.poisonDamage;
                addLogFn(`痛苦收割 +${card.poisonDamage}`, 'damage');
            }

            // 无敌
            if (card.invincible) {
                gs.invincibleTurns = card.invincible;
                addLogFn(`无敌 ${card.invincible} 回合!`, 'event');
            }

            // 快攻：下回合能量+1
            if (card.energyGainNext) {
                gs.nextTurnEnergyBonus = card.energyGainNext;
                addLogFn(`下回合能量+${card.energyGainNext}!`, 'event');
            }

            if (gs.currentEnemy.currentHp > 0 && !gs.enemyStunned) {
                return { enemyCounter: true };
            } else if (gs.enemyStunned) {
                gs.enemyStunned = false;
                addLogFn('敌人畏缩无法攻击!', 'event');
            }
        }

        if (gs.currentEnemy && gs.currentEnemy.currentHp <= 0) {
            return { battleEnd: true, victory: true };
        }

        return { success: true };
    },

    enemyAttack(gs, addLogFn) {
        if (!gs.currentEnemy) return;

        let damage = gs.currentEnemy.damage;

        // 无敌效果
        if (gs.invincibleTurns && gs.invincibleTurns > 0) {
            gs.invincibleTurns--;
            addLogFn('无敌状态! 伤害免疫', 'event');
            return;
        }

        // 敌人虚弱效果
        if (gs.enemyWeakened) {
            damage = Math.floor(damage * 0.5);
            gs.enemyWeakened = false;
            addLogFn('敌人虚弱，伤害-50%!', 'event');
        }

        // 减伤效果
        if (gs.reduceNextDamage) {
            damage = Math.floor(damage * 0.5);
            gs.reduceNextDamage = false;
            addLogFn('减伤触发，伤害-50%!', 'event');
        }

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

        // 中毒敌人
        if (gs.currentEnemy.trait === '中毒') {
            gs.currentEnemy.poisoned = true;
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
        gs.currentEnemy = { ...enemy, currentHp: enemy.hp, maxHp: enemy.hp, shield: 0, poisoned: false };
        gs.enemyStunned = false;
        gs.hand = [];
        gs.energy = gs.maxEnergy;
        gs.comboUsedThisTurn = false;
        gs.attackBoosted = false;
        gs.enemyWeakened = false;
        gs.reduceNextDamage = false;
        gs.poisonSelfTurns = 0;
        gs.nextTurnHpCost = 0;
        gs.invincibleTurns = 0;
        gs.cantAttackThisTurn = false;
        gs.defenseUsedThisTurn = false;
        gs.reflectNextAttack = false;
        gs.nextTurnEnergyBonus = 0;
        DeckManager.drawCards(gs, 4);
    },

    endBattle(gs, victory, addLogFn) {
        if (victory) {
            let goldReward = Math.floor(Math.random() * 30) + 10 * gs.level;
            if (gs.doubleRewardNextBattle) {
                goldReward *= 2;
                gs.doubleRewardNextBattle = false;
                addLogFn('双倍奖励!', 'gold');
            }
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
        if (gs.enemyWeakened) damage = Math.floor(damage * 0.5);
        if (gs.weakened) damage = Math.floor(damage / 2);
        return damage;
    },

    // 每回合开始时调用
    onTurnStart(gs, addLogFn) {
        // 咕噜之魂效果
        if (gs.gollumMode) {
            addLogFn('咔咔!', 'event');
        }

        // 生命绽放：每回合恢复5HP
        if (gs.regenHpPerTurn) {
            gs.hp = Math.min(gs.maxHp, gs.hp + gs.regenHpPerTurn);
            addLogFn(`生命绽放 +${gs.regenHpPerTurn}HP`, 'heal');
        }

        // 能量涌动：每回合能量+1
        if (gs.regenEnergyPerTurn) {
            gs.energy = Math.min(gs.maxEnergy, gs.energy + gs.regenEnergyPerTurn);
            addLogFn(`能量涌动 +${gs.regenEnergyPerTurn}能量`, 'event');
        }

        // 护盾护佑：每回合护盾+3
        if (gs.regenShieldPerTurn) {
            gs.shield += gs.regenShieldPerTurn;
            addLogFn(`护盾护佑 +${gs.regenShieldPerTurn}护盾`, 'event');
        }

        // 幸运抽取：每回合免费抽1张
        if (gs.freeDraws > 0) {
            DeckManager.drawCards(gs, 1);
        }

        // 急迫卡牌的HP惩罚
        if (gs.nextTurnHpCost && gs.nextTurnHpCost > 0) {
            gs.hp = Math.max(1, gs.hp - gs.nextTurnHpCost);
            addLogFn(`急迫反噬! -${gs.nextTurnHpCost}HP`, 'damage');
            gs.nextTurnHpCost = 0;
        }

        // 狂暴的中毒效果
        if (gs.poisonSelfTurns && gs.poisonSelfTurns > 0) {
            gs.poisoned = true;
            gs.poisonSelfTurns--;
            if (gs.poisonSelfTurns === 0) {
                gs.poisoned = false;
            }
        }

        // 中毒伤害
        if (gs.poisoned) {
            gs.hp = Math.max(1, gs.hp - 5);
            addLogFn('中毒伤害 -5HP', 'damage');
        }

        // 敌人中毒
        if (gs.currentEnemy && gs.currentEnemy.poisoned) {
            gs.currentEnemy.currentHp -= 5;
            addLogFn('敌人中毒 -5HP', 'damage');
        }

        // 重置回合状态
        gs.comboUsedThisTurn = false;
        gs.defenseUsedThisTurn = false;
        gs.cantAttackThisTurn = false;

        // 下回合能量加成（快攻）
        if (gs.nextTurnEnergyBonus && gs.nextTurnEnergyBonus > 0) {
            gs.energy = Math.min(gs.maxEnergy, gs.energy + gs.nextTurnEnergyBonus);
            addLogFn(`能量恢复 +${gs.nextTurnEnergyBonus}!`, 'event');
            gs.nextTurnEnergyBonus = 0;
        }
    }
};
