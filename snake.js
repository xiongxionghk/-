// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// 游戏设置
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 蛇的初始位置和方向
let snake = [
    {x: 10, y: 10}
];
let dx = 0;
let dy = 0;

// 食物位置
let apple = {
    x: 15,
    y: 15
};

// 游戏状态
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameInterval;

// 生成随机位置
function randomTile() {
    return Math.floor(Math.random() * tileCount);
}

// 生成新的食物位置
function generateApple() {
    apple.x = randomTile();
    apple.y = randomTile();
    
    // 确保食物不会出现在蛇的身体上
    for (let segment of snake) {
        if (segment.x === apple.x && segment.y === apple.y) {
            generateApple();
            return;
        }
    }
}

// 绘制游戏界面
function drawGame() {
    // 清空画布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线（可选）
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // 绘制蛇
    ctx.fillStyle = '#0f0'; // 蛇头颜色
    ctx.fillRect(snake[0].x * gridSize + 1, snake[0].y * gridSize + 1, gridSize - 2, gridSize - 2);
    
    ctx.fillStyle = '#090'; // 蛇身颜色
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
    }
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * gridSize + 1, apple.y * gridSize + 1, gridSize - 2, gridSize - 2);
    
    // 如果游戏暂停，显示暂停提示
    if (gamePaused) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 - 20, 120, 40);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', canvas.width / 2, canvas.height / 2 + 5);
    }
}

// 更新游戏状态
function update() {
    if (!gameRunning || gamePaused) return;
    
    // 移动蛇头
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 检查撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // 检查是否撞到自己
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        scoreElement.textContent = score;
        generateApple();
    } else {
        snake.pop();
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 开始游戏
function startGame() {
    if (!gameRunning && dx === 0 && dy === 0) {
        // 只有在游戏未开始且蛇没有移动时才能开始
        return;
    }
    gameRunning = true;
    gamePaused = false;
    gameOverElement.style.display = 'none';
    gameInterval = setInterval(gameLoop, 150);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    if (gamePaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(gameLoop, 150);
    }
}

// 重新开始游戏
function restartGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    gamePaused = false;
    gameOverElement.style.display = 'none';
    clearInterval(gameInterval);
    generateApple();
    drawGame();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    // 空格键暂停/继续
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
        return;
    }
    
    if (!gameRunning || gamePaused) return;
    
    let moved = false;
    
    // 方向键控制，防止蛇反向移动
    switch (e.code) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
                moved = true;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
                moved = true;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
                moved = true;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
                moved = true;
            }
            break;
    }
    
    // 开始游戏（第一次按方向键）
    if (moved && !gameRunning) {
        startGame();
    }
});

// 游戏主循环
function gameLoop() {
    update();
    drawGame();
}

// 初始化游戏
function init() {
    generateApple();
    drawGame();
    
    // 添加触摸控制支持（移动设备）
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!gameRunning || gamePaused) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0 && dx !== -1) {
                dx = 1; dy = 0; // 右
            } else if (deltaX < 0 && dx !== 1) {
                dx = -1; dy = 0; // 左
            }
        } else {
            // 垂直滑动
            if (deltaY > 0 && dy !== -1) {
                dx = 0; dy = 1; // 下
            } else if (deltaY < 0 && dy !== 1) {
                dx = 0; dy = -1; // 上
            }
        }
        
        if (!gameRunning) {
            startGame();
        }
    });
}

// 启动游戏
init();