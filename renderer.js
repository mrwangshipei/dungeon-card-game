// ============ Canvas 渲染器 ============
const Renderer = {
    canvas: null,
    ctx: null,
    nodeWidth: 80,
    nodeHeight: 50,
    levelOffset: 30,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleClick(x, y);
        });
    },

    handleClick(x, y) {
        const gs = Game.state;
        if (!gs || !gs.mapTree) return;

        const canMove = Game.canMove();
        if (!canMove) return;

        const availableNodes = Game.getAvailableNodes();

        for (const node of availableNodes) {
            const pos = this.getNodePosition(node);
            if (x >= pos.x && x <= pos.x + this.nodeWidth &&
                y >= pos.y && y <= pos.y + this.nodeHeight) {
                Game.handleNodeClick(node);
                return;
            }
        }
    },

    getNodePosition(node) {
        if (!node) return { x: 0, y: 0 };

        const gs = Game.state;
        const canvasWidth = this.canvas.width;
        const startX = (canvasWidth - this.nodeWidth) / 2;

        // 计算节点的深度相对于当前节点
        const depthFromCurrent = this.getDepthFromNode(gs.currentNode, node);
        const baseY = 80 + depthFromCurrent * (this.nodeHeight + this.levelOffset);

        // X位置根据路径计算
        let offsetX = 0;
        let current = gs.currentNode;
        while (current && current !== node) {
            // 找到node是current的左还是右子节点
            if (current.left && this.isNodeInSubtree(current.left, node)) {
                offsetX -= this.nodeWidth + 20;
                current = current.left;
            } else {
                offsetX += this.nodeWidth + 20;
                current = current.right;
            }
        }

        const baseX = startX + offsetX;
        return { x: baseX, y: baseY };
    },

    getDepthFromNode(from, to) {
        if (!from || !to) return 0;
        if (from === to) return 0;

        // 计算to在from的子树中的深度
        const fromDepth = this.getNodeDepth(from);
        const toDepth = this.getNodeDepth(to);
        return toDepth - fromDepth;
    },

    getNodeDepth(node) {
        if (!node) return 0;
        let depth = 0;
        let current = node;
        while (current) {
            depth++;
            current = current.parent;
        }
        return depth;
    },

    isNodeInSubtree(root, target) {
        if (!root || !target) return false;
        if (root === target) return true;
        return this.isNodeInSubtree(root.left, target) || this.isNodeInSubtree(root.left, target);
    },

    drawMap() {
        const gs = Game.state;
        if (!gs || !gs.mapTree) return;

        const ctx = this.ctx;
        ctx.fillStyle = '#1a0a2e';
        ctx.fillRect(0, 0, 440, 440);

        const canMove = Game.canMove();
        const availableNodes = canMove ? Game.getAvailableNodes() : [];

        // 绘制连接线
        this.drawConnections(gs.mapTree, null, canMove);

        // 绘制节点
        this.drawNodes(gs.mapTree, canMove, availableNodes);
    },

    drawConnections(node, parent, canMove) {
        if (!node) return;
        const ctx = this.ctx;

        if (parent) {
            const parentPos = this.getNodePosition(parent);
            const nodePos = this.getNodePosition(node);

            ctx.strokeStyle = node.visited ? '#4a3a6a' : '#2a1a4a';
            ctx.lineWidth = node.visited ? 3 : 2;

            // 画连接线
            ctx.beginPath();
            ctx.moveTo(parentPos.x + this.nodeWidth / 2, parentPos.y + this.nodeHeight);
            ctx.lineTo(nodePos.x + this.nodeWidth / 2, nodePos.y);
            ctx.stroke();
        }

        // 只绘制可见的子节点（当前节点的下2层）
        if (parent) {
            const depthFromCurrent = this.getDepthFromNode(Game.state.currentNode, node);
            if (depthFromCurrent > 2) return;
        }

        this.drawConnections(node.left, node, canMove);
        this.drawConnections(node.right, node, canMove);
    },

    drawNodes(node, canMove, availableNodes) {
        if (!node) return;
        const ctx = this.ctx;

        // 计算可见性
        const gs = Game.state;
        const depthFromCurrent = this.getDepthFromNode(gs.currentNode, node);
        const isAvailable = availableNodes.includes(node);

        const pos = this.getNodePosition(node);

        // 绘制背景
        let bgColor;
        if (!node.revealed && !isAvailable) {
            bgColor = '#050208';
        } else if (isAvailable && canMove) {
            bgColor = '#5d4b7d';
        } else if (node.visited) {
            bgColor = '#3d2b5d';
        } else {
            bgColor = '#2d1b3d';
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(pos.x, pos.y, this.nodeWidth, this.nodeHeight);

        // 边框
        ctx.strokeStyle = isAvailable && canMove ? '#44ff44' : '#3d2a5d';
        ctx.lineWidth = isAvailable && canMove ? 3 : 1;
        ctx.strokeRect(pos.x, pos.y, this.nodeWidth, this.nodeHeight);

        // 绘制图标和文字
        ctx.globalAlpha = node.revealed || isAvailable ? 1 : 0.3;

        const centerX = pos.x + this.nodeWidth / 2;
        const centerY = pos.y + this.nodeHeight / 2;

        if (node.type === 'exit') {
            this.drawRune(centerX, centerY, '#ffd700');
        } else if (node.type === 'enemy' && node.revealed) {
            this.drawEnemyIcon(centerX, centerY, node.enemy ? node.enemy.name : '?');
        } else if (node.type === 'reward' && node.revealed) {
            this.drawChest(centerX, centerY);
        } else if (node.type === 'danger' && node.revealed) {
            this.drawDanger(centerX, centerY);
        } else if (node.visited) {
            // 已访问节点显示勾
            ctx.fillStyle = '#44ff44';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓', centerX, centerY + 7);
        } else {
            // 未访问节点显示问号
            ctx.fillStyle = '#888';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', centerX, centerY + 7);
        }

        ctx.globalAlpha = 1;

        // 绘制子节点
        if (depthFromCurrent < 2) {
            this.drawNodes(node.left, canMove, availableNodes);
            this.drawNodes(node.right, canMove, availableNodes);
        }
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
