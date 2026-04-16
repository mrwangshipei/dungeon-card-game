// ============ 游戏状态机 ============
const GameState = {
    // 状态枚举
    START: 'start',
    EXPLORING: 'exploring',
    BATTLE: 'battle',
    REWARD: 'reward',
    DANGER: 'danger',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'game_over',

    // 当前状态
    current: 'start',

    // 状态转换映射：当前状态 -> 允许转换到的状态
    transitions: {
        'start': ['exploring'],
        'exploring': ['battle', 'reward', 'danger', 'level_complete', 'game_over'],
        'reward': ['exploring'],
        'danger': ['exploring', 'game_over'],
        'battle': ['exploring', 'game_over'],
        'level_complete': ['exploring'],
        'game_over': ['start']
    },

    // 每个状态允许的动作
    allowedActions: {
        'start': ['start'],
        'exploring': ['move', 'drawCards', 'endTurn', 'viewDeck'],
        'reward': ['confirm', 'continue'],
        'danger': ['confirm', 'continue'],
        'battle': ['useCard', 'endTurn', 'flee', 'drawCards'],
        'level_complete': ['confirm', 'continue'],
        'game_over': ['restart']
    },

    // 状态转换
    setState(newState) {
        const allowed = this.transitions[this.current];
        if (allowed && allowed.includes(newState)) {
            this.current = newState;
            return true;
        }
        console.warn(`不允许从 ${this.current} 转换到 ${newState}`);
        return false;
    },

    // 检查动作是否允许
    canDo(action) {
        const actions = this.allowedActions[this.current];
        return actions && actions.includes(action);
    },

    // 强制设置状态（不检查转换）
    forceSet(newState) {
        this.current = newState;
    },

    // 获取当前状态描述
    getDescription() {
        const descriptions = {
            'start': '开始界面',
            'exploring': '探索地图',
            'battle': '战斗中',
            'reward': '获得奖励',
            'danger': '遭遇危险',
            'level_complete': '关卡完成',
            'game_over': '游戏结束'
        };
        return descriptions[this.current] || '未知状态';
    },

    // 重置状态
    reset() {
        this.current = 'start';
    }
};
