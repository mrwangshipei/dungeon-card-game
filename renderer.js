// ============ Canvas 渲染器 ============
const Renderer = {
    canvas: null,
    ctx: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / 44);
            const y = Math.floor((e.clientY - rect.top) / 44);
            if (x >= 0 && x < 10 && y >= 0 && y < 10) {
                Game.handleTileClick(x, y);
            }
        });
    },

    drawMap() {
        const gs = Game.state;
        const ctx = this.ctx;

        ctx.fillStyle = '#1a0a2e';
        ctx.fillRect(0, 0, 440, 440);

        const tileSize = 44;
        const offset = 0;

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const px = offset + x * tileSize;
                const py = offset + y * tileSize;
                const tile = gs.map[y][x];
                const explored = gs.explored[y][x];

                ctx.strokeStyle = '#3d2a5d';
                ctx.strokeRect(px, py, tileSize, tileSize);

                if (!explored) {
                    ctx.fillStyle = '#0d0518';
                    ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
                    continue;
                }

                ctx.fillStyle = '#2d1b3d';
                ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);

                if (tile.type === 'start') {
                    this.drawRune(px + tileSize/2, py + tileSize/2, '#44ff44');
                } else if (tile.type === 'exit') {
                    this.drawRune(px + tileSize/2, py + tileSize/2, '#ffd700');
                } else if (tile.type === 'enemy' && tile.revealed) {
                    this.drawEnemyIcon(px + tileSize/2, py + tileSize/2, tile.enemy.name);
                } else if (tile.type === 'reward' && tile.revealed) {
                    this.drawChest(px + tileSize/2, py + tileSize/2);
                } else if (tile.type === 'danger' && tile.revealed) {
                    this.drawDanger(px + tileSize/2, py + tileSize/2);
                }
            }
        }

        const playerPx = offset + gs.playerX * tileSize + tileSize/2;
        const playerPy = offset + gs.playerY * tileSize + tileSize/2;
        this.drawPlayer(playerPx, playerPy);

        const adjacent = Game.getAdjacentTiles();
        adjacent.forEach(({x, y}) => {
            if (x >= 0 && x < 10 && y >= 0 && y < 10 && gs.explored[y][x]) {
                const px = offset + x * tileSize;
                const py = offset + y * tileSize;
                ctx.strokeStyle = 'rgba(212,175,55,0.6)';
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
                ctx.lineWidth = 1;
            }
        });
    },

    drawRune(x, y, color) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 90) * Math.PI / 180;
            const r = 15;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8.66, 5);
        ctx.lineTo(-8.66, 5);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    },

    drawChest(x, y) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#d4af37';
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 8;

        ctx.fillRect(x - 12, y - 6, 24, 16);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x - 10, y - 4, 20, 12);

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x, y + 2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawDanger(x, y) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#8b0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x + 10, y + 8);
        ctx.lineTo(x - 10, y + 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 2, y - 4, 4, 8);
        ctx.beginPath();
        ctx.arc(x, y + 5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawEnemyIcon(x, y, name) {
        const ctx = this.ctx;
        const colors = {
            '骷髅兵': '#aaa',
            '哥布林': '#4a8b4a',
            '巨型蜘蛛': '#8b4513',
            '幽灵': '#aaccff',
            '兽人战士': '#8b4513',
            '黑暗法师': '#6a0dad',
            '吸血鬼': '#8b0000',
            '牛头怪': '#5a3a2a',
            '暗影龙': '#2a1a3a',
            '深渊恶魔': '#4a004a'
        };

        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = colors[name] || '#888';
        ctx.shadowColor = colors[name] || '#888';
        ctx.shadowBlur = 5;

        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-4, -3, 3, 0, Math.PI * 2);
        ctx.arc(4, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawPlayer(x, y) {
        const ctx = this.ctx;
        const gold = Game.state.gold;

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = '#1a1a3a';
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-8, 15);
        ctx.lineTo(8, 15);
        ctx.lineTo(10, -5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f5deb3';
        ctx.beginPath();
        ctx.arc(0, -10, 8, 0, Math.PI * 2);
        ctx.fill();

        const hairColors = ['#ff1493', '#00ff00', '#ff4500', '#9400d3', '#00bfff'];
        const hairColor = hairColors[Math.floor(gold / 50) % hairColors.length];
        ctx.fillStyle = hairColor;
        ctx.shadowColor = hairColor;
        ctx.shadowBlur = 8;

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const len = i % 2 === 0 ? 15 : 12;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle - 0.2) * 6, Math.sin(angle - 0.2) * 6 - 8);
            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len - 8);
            ctx.lineTo(Math.cos(angle + 0.2) * 6, Math.sin(angle + 0.2) * 6 - 8);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-3, -11, 2, 0, Math.PI * 2);
        ctx.arc(3, -11, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -10, 10, -Math.PI * 0.8, Math.PI * 0.8);
        ctx.stroke();

        ctx.restore();
    }
};
