// 游戏变量
const GAME_WIDTH = 800; // 游戏宽度
const GAME_HEIGHT = 600; // 游戏高度
let player; // 玩家飞机
let enemies = []; // 敌机数组
let bullets = []; // 子弹数组
let score = 0; // 分数
let gameOver = false; // 游戏结束标志
let lastFired = 0; // 上次射击时间
let canvas, ctx; // 画布和上下文
let textures = {}; // 纹理对象
let keys = { // 键盘状态对象
    left: false, // 左方向键
    right: false, // 右方向键
    up: false, // 上方向键
    down: false, // 下方向键
    space: false // 空格键
};

// 游戏初始化
function init() {
    // 创建画布
    canvas = document.createElement('canvas'); // 创建画布元素
    canvas.width = GAME_WIDTH; // 设置宽度
    canvas.height = GAME_HEIGHT; // 设置高度
    ctx = canvas.getContext('2d'); // 获取2D上下文
    
    // 将画布添加到容器
    const container = document.getElementById('game-container'); // 获取容器
    if (container) {
        container.appendChild(canvas); // 添加画布到容器
    } else {
        document.body.appendChild(canvas); // 添加到body
    }
    
    // 创建纹理
    createTextures();
    
    // 创建玩家
    player = {
        x: GAME_WIDTH / 2, // X坐标
        y: GAME_HEIGHT - 100, // Y坐标
        width: 30, // 宽度
        height: 30, // 高度
        speed: 5, // 速度
        color: '#00ff00', // 颜色
        texture: 'player' // 纹理名称
    };
    
    // 设置键盘事件
    setupInput();
    
    // 开始游戏循环
    setInterval(gameLoop, 1000 / 60); // 60FPS
    
    // 设置敌机生成定时器
    setInterval(spawnEnemy, 1000); // 每秒生成一个敌机
}

// 创建纹理
function createTextures() {
    // 创建离屏画布用于生成纹理
    function createOffscreenCanvas(width, height) {
        const offCanvas = document.createElement('canvas'); // 创建离屏画布
        offCanvas.width = width; // 设置宽度
        offCanvas.height = height; // 设置高度
        return offCanvas; // 返回离屏画布
    }
    
    // 创建背景纹理
    const bgCanvas = createOffscreenCanvas(GAME_WIDTH, GAME_HEIGHT); // 背景纹理画布
    const bgCtx = bgCanvas.getContext('2d'); // 背景纹理上下文
    
    // 绘制黑色背景
    bgCtx.fillStyle = '#000000'; // 黑色
    bgCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // 填充矩形
    
    // 添加星星
    for (let i = 0; i < 300; i++) { // 绘制300颗星星
        const x = Math.floor(Math.random() * GAME_WIDTH); // 随机x坐标
        const y = Math.floor(Math.random() * GAME_HEIGHT); // 随机y坐标
        const size = Math.floor(Math.random() * 3) + 1; // 随机星星大小
        const alpha = Math.random() * 0.7 + 0.3; // 随机透明度
        
        bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // 白色星星，随机透明度
        bgCtx.fillRect(x, y, size, size); // 绘制星星
    }
    
    textures.background = bgCanvas; // 保存背景纹理
    
    // 创建玩家纹理
    const playerCanvas = createOffscreenCanvas(30, 30); // 玩家纹理画布
    const playerCtx = playerCanvas.getContext('2d'); // 玩家纹理上下文
    
    // 绘制飞机主体
    playerCtx.fillStyle = '#00ff00'; // 绿色
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(15, 0); // 三角形顶点
    playerCtx.lineTo(0, 30); // 三角形左底点
    playerCtx.lineTo(30, 30); // 三角形右底点
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    // 绘制机翼
    playerCtx.fillStyle = '#33ff33'; // 淡绿色
    playerCtx.fillRect(0, 20, 30, 5); // 机翼
    
    // 绘制舱室
    playerCtx.fillStyle = '#0000ff'; // 蓝色
    playerCtx.fillRect(12, 15, 6, 10); // 舱室
    
    textures.player = playerCanvas; // 保存玩家纹理
    
    // 创建敌机纹理
    const enemyCanvas = createOffscreenCanvas(30, 30); // 敌机纹理画布
    const enemyCtx = enemyCanvas.getContext('2d'); // 敌机纹理上下文
    
    // 绘制敌机主体
    enemyCtx.fillStyle = '#ff0000'; // 红色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.moveTo(15, 30); // 三角形底部中点
    enemyCtx.lineTo(0, 0); // 三角形左顶点
    enemyCtx.lineTo(30, 0); // 三角形右顶点
    enemyCtx.closePath(); // 闭合路径
    enemyCtx.fill(); // 填充
    
    // 绘制机翼
    enemyCtx.fillStyle = '#ff5555'; // 淡红色
    enemyCtx.fillRect(0, 5, 30, 5); // 机翼
    
    // 绘制舱室
    enemyCtx.fillStyle = '#ffff00'; // 黄色
    enemyCtx.fillRect(12, 5, 6, 10); // 舱室
    
    textures.enemy = enemyCanvas; // 保存敌机纹理
    
    // 创建子弹纹理
    const bulletCanvas = createOffscreenCanvas(4, 10); // 子弹纹理画布
    const bulletCtx = bulletCanvas.getContext('2d'); // 子弹纹理上下文
    
    // 绘制子弹
    bulletCtx.fillStyle = '#ffff00'; // 黄色
    bulletCtx.fillRect(0, 0, 4, 10); // 矩形子弹
    
    textures.bullet = bulletCanvas; // 保存子弹纹理
    
    // 创建爆炸纹理
    const explosionCanvas = createOffscreenCanvas(30, 30); // 爆炸纹理画布
    const explosionCtx = explosionCanvas.getContext('2d'); // 爆炸纹理上下文
    
    // 绘制爆炸
    explosionCtx.fillStyle = '#ff6600'; // 橙色
    explosionCtx.beginPath(); // 开始路径
    explosionCtx.arc(15, 15, 15, 0, Math.PI * 2); // 圆形爆炸
    explosionCtx.fill(); // 填充
    
    // 绘制爆炸光芒
    explosionCtx.fillStyle = '#ffff00'; // 黄色
    explosionCtx.beginPath(); // 开始路径
    explosionCtx.arc(15, 15, 10, 0, Math.PI * 2); // 内圆
    explosionCtx.fill(); // 填充
    
    // 绘制爆炸中心
    explosionCtx.fillStyle = '#ffffff'; // 白色
    explosionCtx.beginPath(); // 开始路径
    explosionCtx.arc(15, 15, 5, 0, Math.PI * 2); // 中心
    explosionCtx.fill(); // 填充
    
    textures.explosion = explosionCanvas; // 保存爆炸纹理
}

// 设置输入控制
function setupInput() {
    // 监听键盘按下事件
    window.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') keys.left = true; // 左方向键
        if (e.key === 'ArrowRight') keys.right = true; // 右方向键
        if (e.key === 'ArrowUp') keys.up = true; // 上方向键
        if (e.key === 'ArrowDown') keys.down = true; // 下方向键
        if (e.key === ' ') keys.space = true; // 空格键
    });
    
    // 监听键盘抬起事件
    window.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowLeft') keys.left = false; // 左方向键
        if (e.key === 'ArrowRight') keys.right = false; // 右方向键
        if (e.key === 'ArrowUp') keys.up = false; // 上方向键
        if (e.key === 'ArrowDown') keys.down = false; // 下方向键
        if (e.key === ' ') keys.space = false; // 空格键
    });
}

// 游戏主循环
function gameLoop() {
    const now = Date.now(); // 当前时间
    
    // 更新逻辑
    if (!gameOver) {
        // 更新玩家
        updatePlayer(keys);
        
        // 更新敌机
        updateEnemies();
        
        // 更新子弹
        updateBullets();
        
        // 检测射击
        if (keys.space && now - lastFired > 250) { // 射击间隔250毫秒
            fireBullet();
            lastFired = now; // 更新上次射击时间
        }
        
        // 检测碰撞
        checkCollisions();
    }
    
    // 渲染画面
    render();
}

// 更新玩家
function updatePlayer(keys) {
    // 移动控制
    if (keys.left && player.x > 0) {
        player.x -= player.speed; // 向左移动
    }
    if (keys.right && player.x < GAME_WIDTH - player.width) {
        player.x += player.speed; // 向右移动
    }
    if (keys.up && player.y > 0) {
        player.y -= player.speed; // 向上移动
    }
    if (keys.down && player.y < GAME_HEIGHT - player.height) {
        player.y += player.speed; // 向下移动
    }
}

// 更新敌机
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]; // 获取敌机
        
        // 移动敌机
        enemy.y += enemy.speed; // 向下移动
        
        // 超出屏幕底部，移除敌机
        if (enemy.y > GAME_HEIGHT) {
            enemies.splice(i, 1); // 移除敌机
        }
    }
}

// 更新子弹
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]; // 获取子弹
        
        // 移动子弹
        bullet.y -= bullet.speed; // 向上移动
        
        // 超出屏幕顶部，移除子弹
        if (bullet.y < -bullet.height) {
            bullets.splice(i, 1); // 移除子弹
        }
    }
}

// 生成敌机
function spawnEnemy() {
    if (gameOver) return; // 游戏结束，不生成敌机
    
    // 创建敌机
    const enemy = {
        x: Math.random() * (GAME_WIDTH - 30), // 随机X坐标
        y: -30, // 屏幕顶部以上
        width: 30, // 宽度
        height: 30, // 高度
        speed: Math.random() * 3 + 2, // 随机速度 (2-5)
        texture: 'enemy' // 纹理名称
    };
    
    enemies.push(enemy); // 添加到敌机数组
}

// 发射子弹
function fireBullet() {
    // 创建子弹
    const bullet = {
        x: player.x + player.width / 2 - 2, // 玩家中心位置
        y: player.y - 10, // 玩家顶部位置
        width: 4, // 宽度
        height: 10, // 高度
        speed: 10, // 速度
        texture: 'bullet' // 纹理名称
    };
    
    bullets.push(bullet); // 添加到子弹数组
}

// 检测碰撞
function checkCollisions() {
    // 检测子弹和敌机碰撞
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]; // 获取子弹
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j]; // 获取敌机
            
            // 检测碰撞
            if (isColliding(bullet, enemy)) {
                // 创建爆炸效果
                createExplosion(enemy.x, enemy.y);
                
                // 移除子弹和敌机
                bullets.splice(i, 1); // 移除子弹
                enemies.splice(j, 1); // 移除敌机
                
                // 增加分数
                score += 100; // 每击落一架敌机得100分
                
                break; // 一颗子弹只能击中一架敌机
            }
        }
    }
    
    // 检测玩家和敌机碰撞
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i]; // 获取敌机
        
        // 检测碰撞
        if (isColliding(player, enemy)) {
            gameOver = true; // 游戏结束
            break; // 一次碰撞足以结束游戏
        }
    }
}

// 碰撞检测
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// 创建爆炸效果
function createExplosion(x, y) {
    const explosion = {
        x: x, // X坐标
        y: y, // Y坐标
        width: 30, // 宽度
        height: 30, // 高度
        frame: 0, // 当前帧
        maxFrames: 5, // 最大帧数
        texture: 'explosion', // 纹理名称
        update: function() {
            this.frame++; // 更新帧数
            return this.frame >= this.maxFrames; // 返回是否完成
        }
    };
    
    // 添加爆炸效果（这里简化了，直接在渲染时处理）
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.fillStyle = '#000000'; // 黑色背景
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // 填充矩形
    
    // 绘制背景
    ctx.drawImage(textures.background, 0, 0); // 绘制背景
    
    // 绘制玩家
    ctx.drawImage(textures.player, player.x, player.y); // 绘制玩家
    
    // 绘制敌机
    for (const enemy of enemies) {
        ctx.drawImage(textures.enemy, enemy.x, enemy.y); // 绘制敌机
    }
    
    // 绘制子弹
    for (const bullet of bullets) {
        ctx.drawImage(textures.bullet, bullet.x, bullet.y); // 绘制子弹
    }
    
    // 绘制分数
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.font = '24px Arial'; // 字体
    ctx.fillText(`分数: ${score}`, 10, 30); // 绘制分数
    
    // 游戏结束显示
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 半透明黑色
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // 填充矩形
        
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.font = '48px Arial'; // 字体
        ctx.textAlign = 'center'; // 居中对齐
        ctx.fillText('游戏结束', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50); // 绘制游戏结束
        ctx.font = '24px Arial'; // 字体
        ctx.fillText(`最终分数: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2); // 绘制分数
        ctx.fillText('按F5刷新重新开始', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50); // 绘制重新开始
    }
}

// 当页面加载完成，初始化游戏
window.onload = init; 