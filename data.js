// ============ 卡牌数据 ============
// 费用上限: 0-4
// ============ 敌人数据 ============
const ENEMIES = [
    { id: 1, name: '骷髅兵', hp: 30, damage: 8, trait: '', rarity: 'weak' },
    { id: 2, name: '哥布林', hp: 20, damage: 6, trait: '', rarity: 'weak' },
    { id: 3, name: '巨型蜘蛛', hp: 40, damage: 8, trait: '中毒', rarity: 'weak' },
    { id: 4, name: '幽灵', hp: 20, damage: 14, trait: '闪避', rarity: 'weak' },
    { id: 5, name: '兽人战士', hp: 45, damage: 12, trait: '', rarity: 'normal' },
    { id: 6, name: '黑暗法师', hp: 25, damage: 15, trait: '', rarity: 'normal' },
    { id: 7, name: '吸血鬼', hp: 35, damage: 10, trait: '吸血', rarity: 'normal' },
    { id: 8, name: '牛头怪', hp: 60, damage: 18, trait: '', rarity: 'strong' },
    { id: 9, name: '暗影龙', hp: 80, damage: 25, trait: '', rarity: 'strong' },
    { id: 10, name: '深渊恶魔', hp: 100, damage: 30, trait: '', rarity: 'strong' }
];

// ============ 卡牌数据 ============
// 费用上限: 0-4
const CARDS = [
    // === 费用0 ===
    { id: 1, name: '轻拳', type: 'attack', cost: 0, damage: 3, desc: '伤害3' },
    { id: 2, name: '嘲讽', type: 'skill', cost: 0, draw: 1, weakenEnemy: true, desc: '抽1张，敌人伤害-50%' },
    { id: 3, name: '观察', type: 'skill', cost: 0, draw: 1, desc: '抽1张' },
    { id: 4, name: '突袭', type: 'attack', cost: 0, damage: 4, executeBonus: true, desc: '伤害4，敌人<50%HP时x2' },
    { id: 5, name: '紧急防御', type: 'defense', cost: 0, shield: 6, desc: '护盾+6' },

    // === 费用1 ===
    { id: 6, name: '防御姿态', type: 'defense', cost: 1, shield: 8, desc: '护盾+8' },
    { id: 7, name: '连击', type: 'attack', cost: 1, damage: 5, combo: true, desc: '伤害5，连击x2' },
    { id: 8, name: '进食', type: 'skill', cost: 1, restoreFood: 40, desc: '饱食度+40' },
    { id: 9, name: '快攻', type: 'attack', cost: 1, damage: 6, energyGainNext: 1, desc: '伤害6，下回合+1能量' },
    { id: 10, name: '轻伤', type: 'attack', cost: 1, damage: 5, lifesteal: 3, desc: '伤害5，吸血3HP' },
    { id: 11, name: '护盾精通', type: 'defense', cost: 1, shield: 12, shieldBonusIfDefUsed: 8, desc: '护盾12，已用防御牌则+8' },

    // === 费用2 ===
    { id: 12, name: '重拳', type: 'attack', cost: 2, damage: 12, desc: '伤害12' },
    { id: 13, name: '铁壁', type: 'defense', cost: 2, shield: 20, reduceDamage: true, desc: '护盾20，下回合-50%伤害' },
    { id: 14, name: '急迫', type: 'skill', cost: 2, energyGain: 2, hpCost: 8, desc: '能量+2，下回合-8HP' },
    { id: 15, name: '反射', type: 'defense', cost: 2, shield: 15, reflect: true, desc: '护盾15，反弹50%伤害' },
    { id: 16, name: '致命', type: 'attack', cost: 2, damage: 15, killHeal: 10, desc: '伤害15，击杀回复10HP' },
    { id: 17, name: '粉碎', type: 'attack', cost: 2, damage: 18, ignoreShield: true, desc: '伤害18，忽略护盾' },

    // === 费用3 ===
    { id: 18, name: '风暴', type: 'attack', cost: 3, damage: 15, aoe: true, desc: '全体伤害15' },
    { id: 19, name: '狂暴', type: 'skill', cost: 3, damageBoost: true, poisonSelf: 4, desc: '攻击+100%，下回合中毒4' },
    { id: 20, name: '吸血斩', type: 'attack', cost: 3, damage: 10, lifestealPercent: 0.5, desc: '伤害10，吸血50%' },
    { id: 21, name: '破甲', type: 'attack', cost: 3, damage: 20, breakArmor: true, desc: '伤害20，消除敌人护盾' },
    { id: 22, name: '战术撤退', type: 'skill', cost: 3, draw: 3, cantAttack: true, desc: '抽3张，本回合无法攻击' },
    { id: 23, name: '复仇', type: 'attack', cost: 3, damage: 25, revenge: true, desc: '伤害25，受伤害越多伤害越高' },

    // === 费用4 ===
    { id: 24, name: '必杀', type: 'attack', cost: 4, damage: 35, desc: '伤害35' },
    { id: 25, name: '坚不可摧', type: 'defense', cost: 4, shield: 40, desc: '护盾+40' },
    { id: 26, name: '暗影步', type: 'attack', cost: 4, damage: 20, invincible: 2, desc: '伤害20，2回合无敌' },
    { id: 27, name: '致命连击', type: 'attack', cost: 4, damage: 30, killHeal: 20, desc: '伤害30，击杀回复20HP' },
    { id: 28, name: '痛苦收割', type: 'attack', cost: 4, damage: 15, poisonDamage: 10, desc: '伤害15，中毒敌人额外10伤害' },
    { id: 29, name: '护盾粉碎', type: 'attack', cost: 4, damage: 0, shieldToDamage: 0.5, desc: '护盾50%转伤害' },
    { id: 30, name: '能量爆发', type: 'attack', cost: 4, damage: 0, energyToDamage: 10, desc: '消耗能量，每点+10伤害' }
];

// ============ 正面事件 ============
const POSITIVE_EVENTS = [
    { text: '生命恢复 +25', effect: (gs) => { gs.hp = Math.min(gs.maxHp, gs.hp + 25); return '生命恢复 +25'; }},
    { text: '能量上限 +1', effect: (gs) => { gs.maxEnergy += 1; gs.energy = Math.min(gs.maxEnergy, gs.energy + 1); return '能量上限 +1'; }},
    { text: '饱食度恢复 +35', effect: (gs) => { gs.food = Math.min(gs.maxFood, gs.food + 35); return '饱食度恢复 +35'; }},
    { text: '金币 +40', effect: (gs) => { gs.gold += 40; return '金币 +40'; }},
    { text: '免费抽牌 x3', effect: (gs) => { gs.freeDraws += 3; return '免费抽牌 x3'; }},
    { text: '护盾 +20', effect: (gs) => { gs.shield += 20; return '护盾 +20'; }},
    { text: '稀有卡牌', effect: () => { Game.addCardToDeck(Game.getRandomCard()); return '获得稀有卡牌!'; }},
    { text: '敌人畏缩', effect: (gs) => { gs.enemyStunned = true; return '敌人畏缩!'; }},
    { text: '商店', effect: (gs) => { return gs.gold >= 30 ? '可用金币购买恢复' : '金币不足无法购买'; }, canChoose: true, choices: [
        { text: '花费30金币恢复40HP', cost: 30, effect: (gs) => { gs.gold -= 30; gs.hp = Math.min(gs.maxHp, gs.hp + 40); return 'HP恢复 +40'; }},
        { text: '花费30金币+1能量上限', cost: 30, effect: (gs) => { gs.gold -= 30; gs.maxEnergy += 1; gs.energy += 1; return '能量上限 +1'; }}
    ]},
    { text: '宝藏', effect: (gs) => { return Math.random() < 0.5 ? '获得80金币!' : '损失20HP...'; }, random: true, positiveEffect: (gs) => { gs.gold += 80; return '获得80金币!'; }, negativeEffect: (gs) => { gs.hp = Math.max(1, gs.hp - 20); return '损失20HP...'; }},

    // === 新增增益事件 ===
    { text: '生命绽放', effect: (gs) => { gs.regenHpPerTurn = 5; return '每回合恢复5HP!'; }, buff: true },
    { text: '能量涌动', effect: (gs) => { gs.regenEnergyPerTurn = 1; return '每回合能量+1!'; }, buff: true },
    { text: '护盾护佑', effect: (gs) => { gs.regenShieldPerTurn = 3; return '每回合护盾+3!'; }, buff: true },
    { text: '战斗精通', effect: (gs) => { gs.attackBonus += 2; return '攻击+2(永久)!'; }, buff: true },
    { text: '幸运抽取', effect: (gs) => { gs.freeDraws += 1; return '每回合免费抽1张!'; }, buff: true },

    // === 整活类事件 ===
    { text: '咕噜之魂', effect: (gs) => { gs.gollumMode = true; gs.attackBonus += 3; return '咕噜附体!咔咔!攻击+3'; }, buff: true },
    { text: '临时工合同', effect: (gs) => { gs.deck.push({id: 100, name: '临时工', type: 'skill', cost: 0, draw: 1, weakenEnemy: true, desc: '抽1张，嘲讽敌人'}); return '获得临时工卡牌!'; }}
];

// ============ 负面事件 ============
const NEGATIVE_EVENTS = [
    { text: '生命损失 -20', effect: (gs) => { gs.hp = Math.max(1, gs.hp - 20); return '生命损失 -20'; }},
    { text: '饱食度损失 -30', effect: (gs) => { gs.food = Math.max(0, gs.food - 30); return '饱食度损失 -30'; }},
    { text: '金币损失 -25', effect: (gs) => { gs.gold = Math.max(0, gs.gold - 25); return '金币损失 -25'; }},
    { text: '弃牌 -2', effect: () => { Game.discardRandomCards(2); return '弃牌 -2'; }},
    { text: '中毒', effect: (gs) => { gs.poisoned = true; gs.poisonSelfTurns = 3; return '中毒3回合!'; }},
    { text: '虚弱', effect: (gs) => { gs.weakened = true; return '攻击虚弱3回合!'; }},
    { text: '诅咒', effect: (gs) => { gs.deck.push({id: 99, name: '诅咒', type: 'attack', cost: 2, damage: -5, desc: '自伤5'}); return '获得诅咒牌!'; }},
    { text: '陷阱', effect: (gs) => { gs.trapNextMove = true; return '前方有陷阱!'; }},
    { text: '掠夺', effect: (gs) => { return Math.random() < 0.5 && gs.gold >= 15 ? '损失50%金币!' : '无事发生'; }, random: true, positiveEffect: (gs) => { gs.gold = Math.floor(gs.gold * 0.5); return '损失50%金币!'; }, negativeEffect: () => { return '无事发生'; }},
    { text: '命运转盘', effect: (gs) => { return Math.random() < 0.55 ? '好运!' : '厄运...'; }, random: true, positiveEffect: (gs) => { gs.hp = Math.min(gs.maxHp, gs.hp + 20); gs.gold += 30; return '好运! +20HP +30金币'; }, negativeEffect: (gs) => { gs.hp = Math.max(1, gs.hp - 15); gs.food = Math.max(0, gs.food - 20); return '厄运... -15HP -20饱食度'; }},
    { text: '生命祭坛', effect: (gs) => { gs.hp = Math.max(1, gs.hp - 15); gs.attackBonus = (gs.attackBonus || 0) + 3; return 'HP-15换取攻击+3(永久)'; }},
    { text: '经验老兵', effect: (gs) => { gs.freeDraws += 2; gs.doubleRewardNextBattle = true; return '免费抽牌x2，战斗奖励翻倍'; }},
    { text: '盗贼偷袭', effect: (gs) => { return gs.gold >= 20 ? '损失20金币!' : 'HP-30...'; }, random: true, positiveEffect: (gs) => { gs.gold -= 20; return '损失20金币!'; }, negativeEffect: (gs) => { gs.hp = Math.max(1, gs.hp - 30); return 'HP-30...'; }},
    { text: '神秘商人', effect: (gs) => { return gs.gold >= 50 ? '可用金币购买卡牌' : '金币不足'; }, canChoose: true, choices: [
        { text: '花费50金币购买卡牌', cost: 50, effect: (gs) => { gs.gold -= 50; Game.addCardToDeck(Game.getRandomCard()); return '获得卡牌!'; }}
    ]}
];

// ============ 关卡奖励 ============
const LEVEL_REWARDS = [
    () => { Game.drawCards(3); return '抽卡x3'; },
    () => { Game.state.hp = Game.state.maxHp; return '生命恢复满'; },
    () => { Game.state.energy = Game.state.maxEnergy; return '能量恢复满'; },
    () => { Game.state.gold += 100; return '金币+100'; },
    () => { Game.addCardToDeck(Game.getRandomCard()); Game.addCardToDeck(Game.getRandomCard()); return '稀有卡牌x2'; },
    () => { Game.state.shield += 30; return '护盾+30'; },
    () => { Game.state.food = Math.min(100, Game.state.food + 50); return '饱食度+50'; },
    () => { Game.state.hp = Math.min(100, Game.state.hp + 20); Game.state.energy = Math.min(3, Game.state.energy + 1); return '全属性恢复'; }
];
