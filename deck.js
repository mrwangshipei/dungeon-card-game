// ============ 卡组管理器 ============
const DeckManager = {
    generateStartingDeck() {
        const deck = [];
        // 费用0
        for (let i = 0; i < 3; i++) deck.push({...CARDS[0]}); // 轻拳 x3
        for (let i = 0; i < 2; i++) deck.push({...CARDS[1]}); // 嘲讽 x2
        deck.push({...CARDS[2]}); // 观察 x1
        deck.push({...CARDS[4]}); // 紧急防御 x1

        // 费用1
        for (let i = 0; i < 2; i++) deck.push({...CARDS[5]}); // 防御姿态 x2
        for (let i = 0; i < 2; i++) deck.push({...CARDS[6]}); // 连击 x2
        for (let i = 0; i < 2; i++) deck.push({...CARDS[7]}); // 进食 x2
        deck.push({...CARDS[8]}); // 快攻 x1

        // 费用2
        deck.push({...CARDS[11]}); // 重拳 x1
        deck.push({...CARDS[12]}); // 铁壁 x1
        deck.push({...CARDS[14]}); // 致命 x1

        this.shuffle(deck);
        return deck;
    },

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    drawCards(gs, count) {
        // 免费抽牌次数先扣除
        if (gs.freeDraws > 0) {
            const freeCount = Math.min(gs.freeDraws, count);
            gs.freeDraws -= freeCount;
            count -= freeCount;
            if (count === 0) return;
        }

        for (let i = 0; i < count; i++) {
            // 抽牌消耗饱食度
            if (gs.food > 0) {
                gs.food = Math.max(0, gs.food - 3);
            } else {
                gs.hp = Math.max(1, gs.hp - 5);
            }

            if (gs.deck.length === 0) {
                if (gs.discardPile.length === 0) {
                    gs.deck = this.generateStartingDeck();
                } else {
                    gs.deck = [...gs.discardPile];
                    gs.discardPile = [];
                    this.shuffle(gs.deck);
                }
            }
            if (gs.deck.length > 0) {
                gs.hand.push(gs.deck.pop());
            }
        }
    },

    discardCard(gs, card) {
        gs.discardPile.push(card);
    },

    discardFromHand(gs, cardIndex) {
        const card = gs.hand.splice(cardIndex, 1)[0];
        gs.discardPile.push(card);
        return card;
    },

    discardRandom(gs, count) {
        for (let i = 0; i < count && gs.hand.length > 0; i++) {
            const idx = Math.floor(Math.random() * gs.hand.length);
            gs.hand.splice(idx, 1);
        }
    },

    addCard(gs, card) {
        gs.deck.push(card);
    },

    getRandomCard() {
        // 随机抽取一张非0费卡牌（高费稀有）
        const highCostCards = CARDS.filter(c => c.cost >= 2);
        return {...highCostCards[Math.floor(Math.random() * highCostCards.length)]};
    },

    reshuffleDiscardToDeck(gs) {
        if (gs.deck.length === 0 && gs.discardPile.length > 0) {
            gs.deck = [...gs.discardPile];
            gs.discardPile = [];
            this.shuffle(gs.deck);
        }
    }
};
