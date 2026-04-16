// ============ 卡牌数据 ============
const CARDS = [
    { id: 1, name: '轻斩', type: 'attack', cost: 0, damage: 5, desc: '伤害5' },
    { id: 2, name: '挥砍', type: 'attack', cost: 1, damage: 6, desc: '伤害6' },
    { id: 3, name: '穿刺', type: 'attack', cost: 1, damage: 7, desc: '伤害7' },
    { id: 4, name: '斩击', type: 'attack', cost: 1, damage: 10, desc: '伤害10' },
    { id: 5, name: '猛击', type: 'attack', cost: 2, damage: 12, desc: '伤害12' },
    { id: 6, name: '护盾', type: 'defense', cost: 1, shield: 12, desc: '护盾+12' },
    { id: 7, name: '抽牌', type: 'skill', cost: 1, draw: 2, desc: '抽2张' },
    { id: 8, name: '重击', type: 'attack', cost: 2, damage: 18, desc: '伤害18' },
    { id: 9, name: '风暴', type: 'attack', cost: 3, damage: 25, desc: '伤害25' },
    { id: 10, name: '必杀', type: 'attack', cost: 3, damage: 30, desc: '伤害30' }
];

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

// ============ 正面事件 ============
const POSITIVE_EVENTS = [
    { text: '生命恢复 +20', effect: (gs) => { gs.hp = Math.min(100, gs.hp + 20); return '生命恢复 +20'; }},
    { text: '能量恢复 +1', effect: (gs) => { gs.energy = Math.min(3, gs.energy + 1); return '能量恢复 +1'; }},
    { text: '饱食度恢复 +30', effect: (gs) => { gs.food = Math.min(100, gs.food + 30); return '饱食度恢复 +30'; }},
    { text: '获得金币 +50', effect: (gs) => { gs.gold += 50; return '获得金币 +50'; }},
    { text: '抽牌 +2', effect: () => { Game.drawCards(2); return '抽牌 +2'; }},
    { text: '获得临时护盾 +15', effect: (gs) => { gs.shield += 15; return '获得护盾 +15'; }},
    { text: '获得经验值 +100', effect: () => '经验值 +100'},
    { text: '获得稀有卡牌', effect: () => { Game.addCardToDeck(Game.getRandomCard()); return '获得稀有卡牌!'; }},
    { text: '敌人畏缩（跳过下一回合）', effect: (gs) => { gs.enemyStunned = true; return '敌人畏缩!'; }},
    { text: '全属性提升', effect: (gs) => { gs.hp = Math.min(100, gs.hp + 10); gs.food = Math.min(100, gs.food + 10); return '全属性小幅度提升!'; }}
];

// ============ 负面事件 ============
const NEGATIVE_EVENTS = [
    { text: '损失生命值 -15', effect: () => { Game.takeDamage(15); return '损失生命值 -15'; }},
    { text: '损失能量 -1', effect: (gs) => { gs.energy = Math.max(0, gs.energy - 1); return '能量 -1'; }},
    { text: '损失饱食度 -20', effect: (gs) => { gs.food = Math.max(0, gs.food - 20); return '饱食度 -20'; }},
    { text: '损失金币 -30', effect: (gs) => { gs.gold = Math.max(0, gs.gold - 30); return '金币 -30'; }},
    { text: '随机弃牌 -2', effect: () => { Game.discardRandomCards(2); return '弃牌 -2'; }},
    { text: '中毒（每步损失5HP）', effect: (gs) => { gs.poisoned = true; return '你中毒了!'; }},
    { text: '虚弱（伤害减半）', effect: (gs) => { gs.weakened = true; return '你变得虚弱!'; }},
    { text: '受到敌人攻击', effect: () => { Game.takeDamage(10); return '受到攻击! -10HP'; }},
    { text: '获得负面卡牌', effect: (gs) => { gs.deck.push({id: 0, name: '诅咒', type: 'attack', cost: 2, damage: -5, desc: '自伤5'}); return '获得负面卡牌'; }},
    { text: '随机属性下降', effect: (gs) => { gs.hp = Math.max(1, gs.hp - 10); return '属性下降!'; }}
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
