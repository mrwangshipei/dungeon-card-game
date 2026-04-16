// ============ 卡组管理器 ============
const DeckManager = {
    generateStartingDeck() {
        const deck = [];
        for (let i = 0; i < 3; i++) deck.push({...CARDS[0]});
        for (let i = 0; i < 2; i++) deck.push({...CARDS[1]});
        for (let i = 0; i < 2; i++) deck.push({...CARDS[3]});
        deck.push({...CARDS[5]});
        deck.push({...CARDS[6]});
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
        for (let i = 0; i < count; i++) {
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
        const weights = [3, 3, 3, 4, 4, 4, 4, 3, 3, 3];
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.floor(Math.random() * total);
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r < 0) return {...CARDS[i]};
        }
        return {...CARDS[0]};
    },

    reshuffleDiscardToDeck(gs) {
        if (gs.deck.length === 0 && gs.discardPile.length > 0) {
            gs.deck = [...gs.discardPile];
            gs.discardPile = [];
            this.shuffle(gs.deck);
        }
    }
};
