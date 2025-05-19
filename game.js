// 游戏变量
const GAME_WIDTH = 800; // 游戏宽度
const GAME_HEIGHT = 800; // 游戏高度
let player; // 玩家飞机
let enemies = []; // 敌机数组
let bullets = []; // 玩家子弹数组
let enemyBullets = []; // 敌人子弹数组
let powerups = []; // 武器升级道具数组
let explosions = []; // 爆炸效果数组
let score = 0; // 分数
let gameOver = false; // 游戏结束标志
let gameWin = false; // 游戏胜利标志
let lastFired = 0; // 上次射击时间
let lastEnemyFired = 0; // 敌人上次射击时间
let lastPowerupTime = 0; // 上次生成道具时间
let currentLevel = 1; // 当前关卡
let bossActive = false; // 是否激活BOSS
let levelTimer = 0; // 关卡计时器
let canvas, ctx; // 画布和上下文
let textures = {}; // 纹理对象
let keys = { // 键盘状态对象
    left: false, // 左方向键
    right: false, // 右方向键
    up: false, // 上方向键
    down: false, // 下方向键
    space: false // 空格键
};

// 武器等级配置
const WEAPON_CONFIGS = {
    1: { // 基本子弹
        bulletCount: 1, // 子弹数量
        damage: 1, // 伤害值
        color: '#ffff00', // 黄色
        size: {width: 4, height: 10} // 子弹尺寸
    },
    2: { // 开花弹
        bulletCount: 3, // 子弹数量
        damage: 1, // 伤害值
        color: '#00ffff', // 青色
        size: {width: 4, height: 10} // 子弹尺寸
    },
    3: { // 瀑布弹
        bulletCount: 3, // 子弹数量
        damage: 2, // 伤害值
        color: '#ff00ff', // 品红色
        size: {width: 6, height: 12} // 子弹尺寸
    },
    4: { // 究极弹
        bulletCount: 5, // 子弹数量
        damage: 3, // 伤害值
        color: '#ffffff', // 白色
        size: {width: 8, height: 15} // 子弹尺寸
    }
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
        speed: 6, // 速度
        weaponLevel: 1, // 武器等级
        health: 3, // 生命值
        invincible: false, // 是否无敌
        invincibleTimer: 0, // 无敌时间计时器
        color: '#00ff00', // 颜色
        texture: 'player' // 纹理名称
    };
    
    // 设置键盘事件
    setupInput();
    
    // 开始游戏循环
    setInterval(gameLoop, 1000 / 60); // 60FPS
    
    // 设置敌机生成
    startLevel(currentLevel);
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
    for (let i = 0; i < 500; i++) { // 绘制500颗星星
        const x = Math.floor(Math.random() * GAME_WIDTH); // 随机x坐标
        const y = Math.floor(Math.random() * GAME_HEIGHT); // 随机y坐标
        const size = Math.floor(Math.random() * 3) + 1; // 随机星星大小
        const alpha = Math.random() * 0.7 + 0.3; // 随机透明度
        
        bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // 白色星星，随机透明度
        bgCtx.fillRect(x, y, size, size); // 绘制星星
    }
    
    textures.background = bgCanvas; // 保存背景纹理
    
    // 创建玩家纹理
    const playerCanvas = createOffscreenCanvas(40, 40); // 玩家纹理画布，尺寸增大
    const playerCtx = playerCanvas.getContext('2d'); // 玩家纹理上下文
    
    // 绘制高级战斗机
    // 机身主体
    playerCtx.fillStyle = '#00ffaa'; // 青绿色
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(20, 0); // 顶点
    playerCtx.lineTo(5, 30); // 左下角
    playerCtx.lineTo(35, 30); // 右下角
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    // 机翼
    playerCtx.fillStyle = '#00ccaa'; // 深青色
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(5, 20); // 左机翼外侧
    playerCtx.lineTo(0, 28); // 左机翼尖
    playerCtx.lineTo(15, 25); // 左机翼内侧
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(35, 20); // 右机翼外侧
    playerCtx.lineTo(40, 28); // 右机翼尖
    playerCtx.lineTo(25, 25); // 右机翼内侧
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    // 尾翼
    playerCtx.fillStyle = '#00aa99'; // 蓝绿色
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(15, 30); // 左尾翼内侧
    playerCtx.lineTo(5, 40); // 左尾翼尖
    playerCtx.lineTo(17, 35); // 左尾翼连接点
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(25, 30); // 右尾翼内侧
    playerCtx.lineTo(35, 40); // 右尾翼尖
    playerCtx.lineTo(23, 35); // 右尾翼连接点
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    // 驾驶舱
    playerCtx.fillStyle = '#4444ff'; // 蓝色
    playerCtx.beginPath(); // 开始路径
    playerCtx.ellipse(20, 15, 5, 8, 0, 0, Math.PI * 2); // 椭圆形驾驶舱
    playerCtx.fill(); // 填充
    
    // 驾驶舱高光
    playerCtx.fillStyle = '#aaaaff'; // 亮蓝色
    playerCtx.beginPath(); // 开始路径
    playerCtx.ellipse(18, 13, 2, 4, 0, 0, Math.PI * 2); // 椭圆形高光
    playerCtx.fill(); // 填充
    
    // 引擎喷射
    playerCtx.fillStyle = '#ffff00'; // 黄色
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(18, 30); // 左侧
    playerCtx.lineTo(20, 38); // 中间
    playerCtx.lineTo(22, 30); // 右侧
    playerCtx.closePath(); // 闭合路径
    playerCtx.fill(); // 填充
    
    // 装甲细节
    playerCtx.strokeStyle = '#007766'; // 深青色
    playerCtx.lineWidth = 1; // 线宽
    playerCtx.beginPath(); // 开始路径
    playerCtx.moveTo(20, 5); // 顶部中央
    playerCtx.lineTo(20, 25); // 底部中央
    playerCtx.moveTo(15, 20); // 左侧中部
    playerCtx.lineTo(25, 20); // 右侧中部
    playerCtx.stroke(); // 描边
    
    textures.player = playerCanvas; // 保存玩家纹理
    
    // 创建敌机纹理（杂兵）
    const enemyCanvas = createOffscreenCanvas(40, 40); // 敌机纹理画布
    const enemyCtx = enemyCanvas.getContext('2d'); // 敌机纹理上下文
    
    // 绘制基础敌机
    // 机身
    enemyCtx.fillStyle = '#ff3333'; // 红色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.moveTo(20, 40); // 底部中点
    enemyCtx.lineTo(0, 10); // 左上角
    enemyCtx.lineTo(40, 10); // 右上角
    enemyCtx.closePath(); // 闭合路径
    enemyCtx.fill(); // 填充
    
    // 机首
    enemyCtx.fillStyle = '#990000'; // 深红色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.moveTo(15, 10); // 左边
    enemyCtx.lineTo(20, 0); // 顶部
    enemyCtx.lineTo(25, 10); // 右边
    enemyCtx.closePath(); // 闭合路径
    enemyCtx.fill(); // 填充
    
    // 机翼
    enemyCtx.fillStyle = '#cc0000'; // 中红色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.moveTo(0, 10); // 左上角
    enemyCtx.lineTo(0, 25); // 左下角
    enemyCtx.lineTo(15, 20); // 左机身连接点
    enemyCtx.closePath(); // 闭合路径
    enemyCtx.fill(); // 填充
    
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.moveTo(40, 10); // 右上角
    enemyCtx.lineTo(40, 25); // 右下角
    enemyCtx.lineTo(25, 20); // 右机身连接点
    enemyCtx.closePath(); // 闭合路径
    enemyCtx.fill(); // 填充
    
    // 武器挂载
    enemyCtx.fillStyle = '#333333'; // 深灰色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.rect(10, 25, 5, 10); // 左侧武器
    enemyCtx.rect(25, 25, 5, 10); // 右侧武器
    enemyCtx.fill(); // 填充
    
    // 驾驶舱
    enemyCtx.fillStyle = '#444444'; // 灰色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.ellipse(20, 20, 5, 8, 0, 0, Math.PI * 2); // 椭圆形驾驶舱
    enemyCtx.fill(); // 填充
    
    // 驾驶舱高光
    enemyCtx.fillStyle = '#666666'; // 亮灰色
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.ellipse(22, 18, 2, 4, 0, 0, Math.PI * 2); // 椭圆形高光
    enemyCtx.fill(); // 填充
    
    // 装甲细节
    enemyCtx.strokeStyle = '#660000'; // 深红色
    enemyCtx.lineWidth = 1; // 线宽
    enemyCtx.beginPath(); // 开始路径
    enemyCtx.moveTo(20, 10); // 顶部中央
    enemyCtx.lineTo(20, 35); // 底部中央
    enemyCtx.stroke(); // 描边
    
    textures.enemy = enemyCanvas; // 保存敌机纹理
    
    // 创建精英敌机纹理
    const eliteCanvas = createOffscreenCanvas(50, 50); // 精英敌机纹理画布
    const eliteCtx = eliteCanvas.getContext('2d'); // 精英敌机纹理上下文
    
    // 绘制精英敌机
    // 核心机身
    eliteCtx.fillStyle = '#cc00cc'; // 紫色
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.ellipse(25, 25, 15, 20, 0, 0, Math.PI * 2); // 椭圆形机身
    eliteCtx.fill(); // 填充
    
    // 前部尖锥
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.moveTo(15, 10); // 左上
    eliteCtx.lineTo(25, 0); // 顶部
    eliteCtx.lineTo(35, 10); // 右上
    eliteCtx.closePath(); // 闭合路径
    eliteCtx.fill(); // 填充
    
    // 四个机翼
    eliteCtx.fillStyle = '#aa00aa'; // 深紫色
    
    // 前上机翼
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.moveTo(10, 15); // 内侧
    eliteCtx.lineTo(0, 5); // 尖端
    eliteCtx.lineTo(15, 20); // 连接点
    eliteCtx.closePath(); // 闭合路径
    eliteCtx.fill(); // 填充
    
    // 前下机翼
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.moveTo(40, 15); // 内侧
    eliteCtx.lineTo(50, 5); // 尖端
    eliteCtx.lineTo(35, 20); // 连接点
    eliteCtx.closePath(); // 闭合路径
    eliteCtx.fill(); // 填充
    
    // 后上机翼
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.moveTo(10, 35); // 内侧
    eliteCtx.lineTo(0, 45); // 尖端
    eliteCtx.lineTo(15, 30); // 连接点
    eliteCtx.closePath(); // 闭合路径
    eliteCtx.fill(); // 填充
    
    // 后下机翼
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.moveTo(40, 35); // 内侧
    eliteCtx.lineTo(50, 45); // 尖端
    eliteCtx.lineTo(35, 30); // 连接点
    eliteCtx.closePath(); // 闭合路径
    eliteCtx.fill(); // 填充
    
    // 武器系统
    eliteCtx.fillStyle = '#ff00ff'; // 亮紫色
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.arc(25, 25, 8, 0, Math.PI * 2); // 中央武器核心
    eliteCtx.fill(); // 填充
    
    // 四个武器炮管
    eliteCtx.fillStyle = '#666666'; // 灰色
    eliteCtx.fillRect(8, 23, 10, 4); // 左炮管
    eliteCtx.fillRect(32, 23, 10, 4); // 右炮管
    eliteCtx.fillRect(23, 8, 4, 10); // 上炮管
    eliteCtx.fillRect(23, 32, 4, 10); // 下炮管
    
    // 能量脉冲效果
    eliteCtx.strokeStyle = '#ff77ff'; // 亮粉色
    eliteCtx.lineWidth = 2; // 线宽
    eliteCtx.beginPath(); // 开始路径
    eliteCtx.arc(25, 25, 12, 0, Math.PI * 2); // 能量场
    eliteCtx.stroke(); // 描边
    
    textures.elite = eliteCanvas; // 保存精英敌机纹理
    
    // 创建BOSS纹理（三种）
    for (let i = 1; i <= 3; i++) {
        const bossSize = 60 + i * 30; // 更大的BOSS尺寸
        const bossCanvas = createOffscreenCanvas(bossSize, bossSize); // BOSS纹理画布
        const bossCtx = bossCanvas.getContext('2d'); // BOSS纹理上下文
        
        // 根据关卡设置BOSS颜色
        let mainColor, secondaryColor, accentColor, energyColor, darkColor;
        switch (i) {
            case 1: 
                mainColor = '#990000'; 
                secondaryColor = '#cc0000';
                accentColor = '#ff3333'; 
                energyColor = '#ffaa00';
                darkColor = '#660000';
                break; // 红色系
            case 2: 
                mainColor = '#009900'; 
                secondaryColor = '#00cc00';
                accentColor = '#33ff33'; 
                energyColor = '#66ffaa';
                darkColor = '#006600';
                break; // 绿色系
            case 3: 
                mainColor = '#000099'; 
                secondaryColor = '#0000cc';
                accentColor = '#3333ff'; 
                energyColor = '#aa66ff';
                darkColor = '#000066';
                break; // 蓝色系
        }
        
        // 绘制不规则的主外壳（改为更具威胁性的形状）
        bossCtx.fillStyle = mainColor; // 主色调
        
        // 基础外壳 - 从椭圆形改为更具侵略性的六边形
        bossCtx.beginPath();
        const shellRadius = bossSize/2 - 5;
        // 六边形外壳
        for(let j = 0; j < 6; j++) {
            const angle = Math.PI * 2 * j / 6 - Math.PI/6;
            const x = bossSize/2 + Math.cos(angle) * shellRadius * (j % 2 ? 0.9 : 1.1); // 不规则六边形
            const y = bossSize/2 + Math.sin(angle) * shellRadius * (j % 2 ? 0.9 : 1.1);
            if(j === 0) bossCtx.moveTo(x, y);
            else bossCtx.lineTo(x, y);
        }
        bossCtx.closePath();
        bossCtx.fill();
        
        // 绘制底层装甲质感
        bossCtx.fillStyle = darkColor;
        // 创建装甲间的缝隙
        for(let j = 0; j < 6; j++) {
            const angle = Math.PI * 2 * j / 6 - Math.PI/6 + Math.PI/12; // 错开位置
            const length = shellRadius * 0.7;
            const width = shellRadius * 0.12;
            
            bossCtx.save();
            bossCtx.translate(bossSize/2, bossSize/2);
            bossCtx.rotate(angle);
            bossCtx.fillRect(-width/2, -length/2, width, length);
            bossCtx.restore();
        }
        
        // 绘制金属质感的核心装甲（同心环形装甲）
        bossCtx.fillStyle = secondaryColor; // 次色调
        bossCtx.beginPath();
        bossCtx.arc(bossSize/2, bossSize/2, shellRadius * 0.65, 0, Math.PI * 2);
        bossCtx.fill();
        
        bossCtx.fillStyle = mainColor;
        bossCtx.beginPath();
        bossCtx.arc(bossSize/2, bossSize/2, shellRadius * 0.5, 0, Math.PI * 2);
        bossCtx.fill();
        
        // 装甲板的金属反光线条
        bossCtx.strokeStyle = accentColor;
        bossCtx.lineWidth = 1;
        bossCtx.setLineDash([]);
        bossCtx.beginPath();
        bossCtx.arc(bossSize/2, bossSize/2, shellRadius * 0.65, Math.PI * 0.2, Math.PI * 0.8);
        bossCtx.stroke();
        
        bossCtx.beginPath();
        bossCtx.arc(bossSize/2, bossSize/2, shellRadius * 0.5, Math.PI * 1.2, Math.PI * 1.8);
        bossCtx.stroke();
        
        // 外部尖刺装甲（增加威胁感）
        bossCtx.fillStyle = secondaryColor;
        for(let j = 0; j < 8; j++) {
            const angle = Math.PI * 2 * j / 8;
            const spikeLength = shellRadius * 0.4;
            const spikeWidth = shellRadius * 0.15;
            
            bossCtx.save();
            bossCtx.translate(bossSize/2, bossSize/2);
            bossCtx.rotate(angle);
            bossCtx.translate(0, -shellRadius * 0.85);
            
            // 绘制尖刺
            bossCtx.beginPath();
            bossCtx.moveTo(0, 0);
            bossCtx.lineTo(-spikeWidth/2, -spikeLength);
            bossCtx.lineTo(spikeWidth/2, -spikeLength);
            bossCtx.closePath();
            bossCtx.fill();
            
            // 尖刺装饰线
            bossCtx.strokeStyle = accentColor;
            bossCtx.beginPath();
            bossCtx.moveTo(0, -spikeLength/3);
            bossCtx.lineTo(0, -spikeLength*0.9);
            bossCtx.stroke();
            
            bossCtx.restore();
        }
        
        // 绘制能量核心（更强大的脉冲核心）
        const gradientRadius = bossSize/3;
        const energyGradient = bossCtx.createRadialGradient(
            bossSize/2, bossSize/2, 0,
            bossSize/2, bossSize/2, gradientRadius
        );
        energyGradient.addColorStop(0, '#ffffff');
        energyGradient.addColorStop(0.2, energyColor);
        energyGradient.addColorStop(0.5, accentColor);
        energyGradient.addColorStop(0.7, mainColor);
        energyGradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        bossCtx.fillStyle = energyGradient; // 渐变
        bossCtx.beginPath(); // 开始路径
        bossCtx.arc(bossSize/2, bossSize/2, gradientRadius, 0, Math.PI * 2); // 能量核心
        bossCtx.fill(); // 填充
        
        // 核心几何线条（科技感）
        bossCtx.strokeStyle = '#ffffff';
        bossCtx.lineWidth = 1.5;
        bossCtx.beginPath();
        // 绘制六芒星
        for(let j = 0; j < 6; j++) {
            const angle = Math.PI * 2 * j / 6;
            const x = bossSize/2 + Math.cos(angle) * gradientRadius * 0.5;
            const y = bossSize/2 + Math.sin(angle) * gradientRadius * 0.5;
            if(j === 0) bossCtx.moveTo(x, y);
            else if(j % 2 === 0) bossCtx.lineTo(x, y); // 连接对角点
        }
        bossCtx.closePath();
        bossCtx.stroke();
        
        // 再次从起点开始连接其他点
        bossCtx.beginPath();
        for(let j = 1; j < 6; j+=2) {
            const angle = Math.PI * 2 * j / 6;
            const x = bossSize/2 + Math.cos(angle) * gradientRadius * 0.5;
            const y = bossSize/2 + Math.sin(angle) * gradientRadius * 0.5;
            if(j === 1) bossCtx.moveTo(x, y);
            else bossCtx.lineTo(x, y);
        }
        bossCtx.closePath();
        bossCtx.stroke();
        
        // 绘制外层防护罩（科技感力场）
        bossCtx.strokeStyle = accentColor; // 次要色调
        bossCtx.lineWidth = 3; // 线宽
        bossCtx.setLineDash([8, 3]); // 更科技感的虚线样式
        
        // 双层防护罩
        bossCtx.beginPath(); // 开始路径
        bossCtx.arc(bossSize/2, bossSize/2, bossSize/2 - 4, 0, Math.PI * 2); // 外层防护罩
        bossCtx.stroke(); // 描边
        
        bossCtx.beginPath(); // 开始路径
        bossCtx.arc(bossSize/2, bossSize/2, bossSize/2 - 12, 0, Math.PI * 2); // 内层防护罩
        bossCtx.stroke(); // 描边
        
        // 绘制武器系统（更具威慑力）
        const weaponCount = i + 5; // 关卡越高武器越多
        
        for (let j = 0; j < weaponCount; j++) {
            const angle = Math.PI * 2 * j / weaponCount;
            const distance = bossSize/2 - 20;
            const x = bossSize/2 + Math.cos(angle) * distance;
            const y = bossSize/2 + Math.sin(angle) * distance;
            const weaponSize = bossSize/8.5;
            
            // 武器底座
            bossCtx.fillStyle = darkColor; // 暗色调
            bossCtx.beginPath(); // 开始路径
            bossCtx.arc(x, y, weaponSize * 1.2, 0, Math.PI * 2); // 底座
            bossCtx.fill(); // 填充
            
            // 武器炮台
            bossCtx.fillStyle = secondaryColor; // 次色调
            bossCtx.beginPath(); // 开始路径
            bossCtx.arc(x, y, weaponSize, 0, Math.PI * 2); // 炮台
            bossCtx.fill(); // 填充
            
            // 炮口 - 更具威慑力的设计
            const barrelLength = weaponSize * 1.5;
            const barrelWidth = weaponSize * 0.4;
            
            bossCtx.save();
            bossCtx.translate(x, y);
            bossCtx.rotate(angle);
            
            // 炮筒
            bossCtx.fillStyle = darkColor;
            bossCtx.fillRect(-barrelWidth/2, -barrelLength, barrelWidth, barrelLength);
            
            // 炮口闪光
            bossCtx.fillStyle = energyColor;
            bossCtx.beginPath();
            bossCtx.arc(0, -barrelLength, barrelWidth/2, 0, Math.PI * 2);
            bossCtx.fill();
            
            bossCtx.restore();
            
            // 能量连接线
            bossCtx.strokeStyle = energyColor; // 能量色
            bossCtx.lineWidth = 2; // 线宽
            bossCtx.setLineDash([]); // 实线
            bossCtx.beginPath(); // 开始路径
            bossCtx.moveTo(bossSize/2, bossSize/2); // 中心
            bossCtx.lineTo(x, y); // 武器位置
            bossCtx.stroke(); // 描边
        }
        
        // 添加科技感细节线条
        bossCtx.strokeStyle = accentColor;
        bossCtx.lineWidth = 1;
        bossCtx.setLineDash([]);
        
        // 扫描线效果
        const scanLineY = bossSize/2;
        bossCtx.beginPath();
        bossCtx.moveTo(bossSize/2 - shellRadius * 0.8, scanLineY);
        bossCtx.lineTo(bossSize/2 + shellRadius * 0.8, scanLineY);
        bossCtx.stroke();
        
        // 核心闪光效果
        bossCtx.fillStyle = '#ffffff'; // 白色
        bossCtx.beginPath(); // 开始路径
        bossCtx.arc(bossSize/2 - gradientRadius/3, bossSize/2 - gradientRadius/3, gradientRadius/6, 0, Math.PI * 2); // 闪光点
        bossCtx.fill(); // 填充
        
        // 添加小型指示灯
        for(let j = 0; j < 4; j++) {
            const angle = Math.PI * 2 * j / 4;
            const radius = shellRadius * 0.75;
            const dotSize = shellRadius * 0.05;
            const x = bossSize/2 + Math.cos(angle) * radius;
            const y = bossSize/2 + Math.sin(angle) * radius;
            
            bossCtx.fillStyle = j % 2 === 0 ? energyColor : '#ffffff';
            bossCtx.beginPath();
            bossCtx.arc(x, y, dotSize, 0, Math.PI * 2);
            bossCtx.fill();
        }
        
        textures[`boss${i}`] = bossCanvas; // 保存BOSS纹理
    }
    
    // 创建子弹纹理
    const bulletCanvas = createOffscreenCanvas(8, 15); // 子弹纹理画布
    const bulletCtx = bulletCanvas.getContext('2d'); // 子弹纹理上下文
    
    // 绘制子弹
    bulletCtx.fillStyle = '#ffff00'; // 黄色
    bulletCtx.fillRect(0, 0, 8, 15); // 矩形子弹
    
    textures.bullet = bulletCanvas; // 保存子弹纹理
    
    // 创建敌人子弹纹理
    const enemyBulletCanvas = createOffscreenCanvas(6, 12); // 敌人子弹纹理画布
    const enemyBulletCtx = enemyBulletCanvas.getContext('2d'); // 敌人子弹纹理上下文
    
    // 绘制敌人子弹
    enemyBulletCtx.fillStyle = '#ff0000'; // 红色
    enemyBulletCtx.fillRect(0, 0, 6, 12); // 矩形子弹
    
    textures.enemyBullet = enemyBulletCanvas; // 保存敌人子弹纹理
    
    // 创建激光纹理
    const laserCanvas = createOffscreenCanvas(20, GAME_HEIGHT); // 激光纹理画布
    const laserCtx = laserCanvas.getContext('2d'); // 激光纹理上下文
    
    // 创建渐变
    const gradient = laserCtx.createLinearGradient(0, 0, 20, 0);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');
    
    // 绘制激光
    laserCtx.fillStyle = gradient; // 渐变
    laserCtx.fillRect(0, 0, 20, GAME_HEIGHT); // 填充矩形
    
    textures.laser = laserCanvas; // 保存激光纹理
    
    // 创建爆炸纹理
    const explosionCanvas = createOffscreenCanvas(50, 50); // 爆炸纹理画布
    const explosionCtx = explosionCanvas.getContext('2d'); // 爆炸纹理上下文
    
    // 创建渐变
    const explosionGradient = explosionCtx.createRadialGradient(25, 25, 0, 25, 25, 25);
    explosionGradient.addColorStop(0, '#ffffff');
    explosionGradient.addColorStop(0.3, '#ffff00');
    explosionGradient.addColorStop(0.6, '#ff6600');
    explosionGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    // 绘制爆炸
    explosionCtx.fillStyle = explosionGradient; // 渐变
    explosionCtx.beginPath(); // 开始路径
    explosionCtx.arc(25, 25, 25, 0, Math.PI * 2); // 圆形爆炸
    explosionCtx.fill(); // 填充
    
    textures.explosion = explosionCanvas; // 保存爆炸纹理
    
    // 创建道具纹理
    const powerupTypes = ['weapon', 'health', 'shield'];
    const powerupColors = {
        'weapon': '#ffff00', // 黄色（武器升级）
        'health': '#00ff00', // 绿色（生命值）
        'shield': '#0099ff'  // 蓝色（护盾）
    };
    
    powerupTypes.forEach(type => {
        // 根据类型确定画布大小
        let canvasSize = 20; // 默认尺寸
        
        // 宝箱需要更大的尺寸
        if (type === 'weapon') {
            canvasSize = 30; // 增大宝箱尺寸
        }
        
        const powerupCanvas = createOffscreenCanvas(canvasSize, canvasSize); // 道具纹理画布
        const powerupCtx = powerupCanvas.getContext('2d'); // 道具纹理上下文
        
        // 根据类型绘制道具
        switch (type) {
            case 'weapon':
                // 华贵宝箱 - 增大尺寸后的绘制
                // 宝箱底座 - 金色
                powerupCtx.fillStyle = '#d4af37'; // 金色
                powerupCtx.fillRect(6, 15, 18, 11); // 宝箱主体
                
                // 宝箱盖 - 金色弧形
                powerupCtx.beginPath();
                powerupCtx.moveTo(6, 15);
                powerupCtx.lineTo(6, 12);
                powerupCtx.quadraticCurveTo(15, 6, 24, 12);
                powerupCtx.lineTo(24, 15);
                powerupCtx.closePath();
                powerupCtx.fill();
                
                // 宝箱锁扣 - 深金色
                powerupCtx.fillStyle = '#aa8c2c'; // 深金色
                powerupCtx.fillRect(13.5, 13.5, 3, 4.5);
                
                // 宝箱花纹装饰
                powerupCtx.strokeStyle = '#ffcf40'; // 亮金色
                powerupCtx.lineWidth = 0.8;
                powerupCtx.strokeRect(8, 17, 14, 7);
                
                // 内部装饰线
                powerupCtx.beginPath();
                powerupCtx.moveTo(8, 20);
                powerupCtx.lineTo(22, 20);
                powerupCtx.stroke();
                
                // 宝箱上的宝石
                powerupCtx.fillStyle = '#ff3366'; // 红宝石色
                powerupCtx.beginPath();
                powerupCtx.arc(15, 10, 2.5, 0, Math.PI * 2);
                powerupCtx.fill();
                
                // 宝石高光
                powerupCtx.fillStyle = '#ffffff';
                powerupCtx.globalAlpha = 0.7;
                powerupCtx.beginPath();
                powerupCtx.arc(14, 9, 0.8, 0, Math.PI * 2);
                powerupCtx.fill();
                powerupCtx.globalAlpha = 1.0;
                
                // 侧边宝石装饰
                powerupCtx.fillStyle = '#00ccff'; // 蓝宝石色
                powerupCtx.beginPath();
                powerupCtx.arc(7, 17, 1.2, 0, Math.PI * 2);
                powerupCtx.fill();
                
                powerupCtx.fillStyle = '#33ff66'; // 绿宝石色
                powerupCtx.beginPath();
                powerupCtx.arc(23, 17, 1.2, 0, Math.PI * 2);
                powerupCtx.fill();
                
                // 金色光芒效果
                powerupCtx.strokeStyle = '#ffec8b'; // 淡金色
                powerupCtx.lineWidth = 0.5;
                for (let i = 0; i < 8; i++) {
                    const angle = Math.PI * 2 * i / 8;
                    const length = 4 + Math.random() * 3;
                    powerupCtx.beginPath();
                    powerupCtx.moveTo(15, 15);
                    powerupCtx.lineTo(
                        15 + Math.cos(angle) * length,
                        15 + Math.sin(angle) * length
                    );
                    powerupCtx.stroke();
                }
                
                // 闪光效果
                powerupCtx.fillStyle = '#fffacd'; // 淡黄色
                powerupCtx.globalAlpha = 0.5;
                powerupCtx.beginPath();
                powerupCtx.arc(21, 19, 1.5, 0, Math.PI * 2);
                powerupCtx.fill();
                
                powerupCtx.beginPath();
                powerupCtx.arc(9, 22, 1, 0, Math.PI * 2);
                powerupCtx.fill();
                powerupCtx.globalAlpha = 1.0;
                break;
                
            case 'health':
                // 医疗包样式
                // 白色背景方盒
                powerupCtx.fillStyle = '#ffffff'; // 白色底色
                powerupCtx.fillRect(4, 5, 12, 10); // 方形医疗包主体
                
                // 盒子边框
                powerupCtx.strokeStyle = '#dddddd'; // 浅灰色边框
                powerupCtx.lineWidth = 1;
                powerupCtx.strokeRect(4, 5, 12, 10);
                
                // 红色十字标志
                powerupCtx.fillStyle = '#ff0000'; // 红色
                // 水平部分
                powerupCtx.fillRect(6, 9, 8, 2);
                // 垂直部分
                powerupCtx.fillRect(9, 6, 2, 8);
                
                // 光泽效果
                powerupCtx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // 半透明白色
                powerupCtx.beginPath();
                powerupCtx.moveTo(4, 5); // 左上角
                powerupCtx.lineTo(7, 5); // 上边中点
                powerupCtx.lineTo(5, 9); // 左边中点
                powerupCtx.closePath();
                powerupCtx.fill();
                
                // 投影效果
                powerupCtx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 半透明黑色
                powerupCtx.beginPath();
                powerupCtx.moveTo(16, 5); // 右上角
                powerupCtx.lineTo(16, 15); // 右下角
                powerupCtx.lineTo(13, 15); // 下边中点
                powerupCtx.closePath();
                powerupCtx.fill();
                break;
                
            case 'shield':
                // 护盾图标（圆环）
                powerupCtx.fillStyle = powerupColors[type]; // 根据类型设置颜色
                powerupCtx.beginPath(); // 开始路径
                powerupCtx.arc(10, 10, 8, 0, Math.PI * 2); // 圆形
                powerupCtx.fill(); // 填充
                
                // 绘制道具边框
                powerupCtx.strokeStyle = '#ffffff'; // 白色边框
                powerupCtx.lineWidth = 2; // 边框宽度
                powerupCtx.beginPath(); // 开始路径
                powerupCtx.arc(10, 10, 9, 0, Math.PI * 2); // 圆形
                powerupCtx.stroke(); // 描边
                
                powerupCtx.fillStyle = '#ffffff'; // 白色
                powerupCtx.beginPath();
                powerupCtx.arc(10, 10, 4, 0, Math.PI * 2);
                powerupCtx.stroke();
                break;
        }
        
        textures[type] = powerupCanvas; // 保存道具纹理
    });
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
    levelTimer++; // 关卡计时器递增
    
    // 更新逻辑
    if (!gameOver && !gameWin) {
        // 更新玩家
        updatePlayer(keys);
        
        // 更新敌机
        updateEnemies();
        
        // 更新子弹
        updateBullets();
        
        // 更新敌人子弹
        updateEnemyBullets();
        
        // 更新爆炸效果
        updateExplosions();
        
        // 更新道具
        updatePowerups();
        
        // 自动发射玩家子弹
        if (now - lastFired > 150) { // 射击间隔150毫秒
            fireBullet();
            lastFired = now; // 更新上次射击时间
        }
        
        // 敌人发射子弹
        if (now - lastEnemyFired > 800 && enemies.length > 0) { // 敌人射击间隔800毫秒
            fireEnemyBullet();
            lastEnemyFired = now; // 更新敌人上次射击时间
        }
        
        // 生成道具
        if (now - lastPowerupTime > 10000) { // 每10秒生成一个道具
            spawnPowerup();
            lastPowerupTime = now; // 更新上次生成道具时间
        }
        
        // 检测碰撞
        checkCollisions();
        
        // 检查关卡进度
        checkLevelProgress();
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
    
    // 更新无敌状态
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
}

// 更新敌机
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]; // 获取敌机
        
        // 移动敌机
        switch (enemy.type) {
            case 'minion':
                // 基础杂兵移动
                if (enemy.pattern === 'straight') {
                    // 直线移动
                    enemy.y += enemy.speed; // 向下移动
                } else if (enemy.pattern === 'wave') {
                    // 波浪移动
                    enemy.y += enemy.speed; // 向下移动
                    enemy.x += Math.sin(enemy.y / 30) * 2; // 波浪移动
                    
                    // 确保不超出屏幕边界
                    if (enemy.x < 0) enemy.x = 0;
                    if (enemy.x > GAME_WIDTH - enemy.width) enemy.x = GAME_WIDTH - enemy.width;
                }
                break;
                
            case 'elite':
                // 精英敌机移动
                if (enemy.pattern === 'straight') {
                    // 直线移动
                    enemy.y += enemy.speed; // 向下移动
                } else if (enemy.pattern === 'zigzag') {
                    // 之字形移动
                    enemy.y += enemy.speed; // 向下移动
                    enemy.x += Math.sin(enemy.y / 50) * 3; // 之字形移动
                    
                    // 确保不超出屏幕边界
                    if (enemy.x < 0) enemy.x = 0;
                    if (enemy.x > GAME_WIDTH - enemy.width) enemy.x = GAME_WIDTH - enemy.width;
                }
                
                // 精英敌机自动发射子弹
                const now = Date.now();
                if (now - enemy.lastFired > enemy.fireRate) {
                    // 发射扇形弹幕
                    fireEnemyBulletPattern(enemy, 'fan');
                    enemy.lastFired = now;
                }
                break;
                
            case 'boss':
                // BOSS移动
                if (enemy.y < enemy.hoverY) {
                    // 先向下移动到悬停位置
                    enemy.y += enemy.speed;
                } else {
                    // 根据移动模式移动
                    switch (enemy.pattern) {
                        case 'hover':
                            // 悬停，微小摆动
                            enemy.x += Math.sin(Date.now() / 1000) * 0.5;
                            break;
                            
                        case 'patrol':
                            // 左右巡逻
                            enemy.x += enemy.direction * enemy.speed;
                            
                            // 到达边界时转向
                            if (enemy.x <= enemy.patrolMin) {
                                enemy.direction = 1;
                            } else if (enemy.x >= enemy.patrolMax) {
                                enemy.direction = -1;
                            }
                            break;
                            
                        case 'complex':
                            // 复杂移动模式
                            enemy.moveTimer++;
                            
                            if (enemy.moveTimer % 300 < 150) {
                                // 在目标点附近做圆周运动
                                enemy.x = enemy.targetX + Math.sin(enemy.moveTimer / 30) * 100;
                                enemy.y = enemy.targetY + Math.cos(enemy.moveTimer / 30) * 50;
                            } else {
                                // 随机变换目标点
                                if (enemy.moveTimer % 300 === 150) {
                                    enemy.targetX = Math.random() * (GAME_WIDTH - 150);
                                    enemy.targetY = Math.random() * 200 + 50;
                                }
                                
                                // 向目标点移动
                                const dx = enemy.targetX - enemy.x;
                                const dy = enemy.targetY - enemy.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                
                                if (dist > 5) {
                                    enemy.x += dx / dist * enemy.speed;
                                    enemy.y += dy / dist * enemy.speed;
                                }
                            }
                            break;
                    }
                }
                
                // BOSS自动发射子弹
                const bossNow = Date.now();
                if (bossNow - enemy.lastFired > enemy.fireRate) {
                    // 根据阶段发射不同的弹幕
                    fireEnemyBulletPattern(enemy, enemy.bulletPattern);
                    enemy.lastFired = bossNow;
                }
                
                // 检查BOSS阶段转换
                checkBossPhase(enemy);
                break;
        }
        
        // 超出屏幕底部，移除敌机（仅对非BOSS敌机）
        if (enemy.type !== 'boss' && enemy.y > GAME_HEIGHT) {
            enemies.splice(i, 1); // 移除敌机
        }
    }
}

// 检查BOSS阶段转换
function checkBossPhase(boss) {
    // 根据生命值百分比确定阶段
    const healthPercent = boss.health / boss.maxHealth;
    
    if (healthPercent <= 0.4 && boss.phase < 3) {
        // 进入第三阶段
        boss.phase = 3;
        boss.fireRate = boss.fireRate * 0.6; // 提高射速
        // 更新子弹模式
        switch (currentLevel) {
            case 1: boss.bulletPattern = 'circle'; break;
            case 2: boss.bulletPattern = 'laser'; break;
            case 3: boss.bulletPattern = 'hell'; break;
        }
    } else if (healthPercent <= 0.7 && boss.phase < 2) {
        // 进入第二阶段
        boss.phase = 2;
        boss.fireRate = boss.fireRate * 0.8; // 提高射速
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

// 更新敌人子弹
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i]; // 获取子弹
        
        // 移动子弹
        bullet.y += bullet.speed; // 向下移动
        
        // 如果是追踪子弹
        if (bullet.tracking && !gameOver) {
            // 计算朝向玩家的方向
            const dx = player.x + player.width / 2 - bullet.x;
            const dy = player.y + player.height / 2 - bullet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 调整子弹速度向量
            bullet.x += dx / dist * bullet.speed * 0.3;
        } else if (bullet.pattern === 'spiral') {
            // 螺旋移动
            bullet.x += Math.sin(bullet.y / 20) * 2;
        } else if (bullet.direction) {
            // 有自定义方向的子弹
            bullet.x += bullet.direction.x * bullet.speed;
            bullet.y += bullet.direction.y * bullet.speed;
        }
        
        // 超出屏幕，移除子弹
        if (bullet.y > GAME_HEIGHT || bullet.y < -bullet.height || 
            bullet.x < -bullet.width || bullet.x > GAME_WIDTH) {
            enemyBullets.splice(i, 1); // 移除子弹
        }
    }
}

// 发射敌人子弹图案
function fireEnemyBulletPattern(enemy, pattern) {
    const now = Date.now();
    
    switch (pattern) {
        case 'single': // 单发子弹
            // 创建敌人子弹
            const bullet = {
                x: enemy.x + enemy.width / 2 - 2, // 敌人中心位置
                y: enemy.y + enemy.height, // 敌人底部位置
                width: 4, // 宽度
                height: 10, // 高度
                speed: 5, // 速度
                damage: enemy.damage || 1, // 伤害值
                texture: 'enemyBullet' // 纹理名称
            };
            enemyBullets.push(bullet);
            break;
            
        case 'fan': // 扇形弹幕
            // 发射5发扇形子弹
            for (let i = -2; i <= 2; i++) {
                const direction = {
                    x: i * 0.2,
                    y: 1
                };
                
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 2, // 敌人中心位置
                    y: enemy.y + enemy.height, // 敌人底部位置
                    width: 4, // 宽度
                    height: 10, // 高度
                    speed: 4, // 速度
                    damage: enemy.damage || 1, // 伤害值
                    direction: direction, // 移动方向
                    texture: 'enemyBullet' // 纹理名称
                };
                enemyBullets.push(bullet);
            }
            break;
            
        case 'spread': // 分散弹幕
            // 发射8个方向的子弹
            for (let i = 0; i < 8; i++) {
                const angle = Math.PI * 2 * i / 8;
                const direction = {
                    x: Math.sin(angle),
                    y: Math.cos(angle)
                };
                
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 2, // 敌人中心位置
                    y: enemy.y + enemy.height / 2, // 敌人中心位置
                    width: 4, // 宽度
                    height: 10, // 高度
                    speed: 3, // 速度
                    damage: enemy.damage || 1, // 伤害值
                    direction: direction, // 移动方向
                    texture: 'enemyBullet' // 纹理名称
                };
                enemyBullets.push(bullet);
            }
            break;
            
        case 'cross': // 十字弹幕
            // 发射十字形弹幕
            const directions = [
                {x: 0, y: 1}, // 下
                {x: 1, y: 0}, // 右
                {x: 0, y: -1}, // 上
                {x: -1, y: 0}, // 左
                {x: 0.7, y: 0.7}, // 右下
                {x: 0.7, y: -0.7}, // 右上
                {x: -0.7, y: 0.7}, // 左下
                {x: -0.7, y: -0.7} // 左上
            ];
            
            for (const dir of directions) {
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 2, // 敌人中心位置
                    y: enemy.y + enemy.height / 2, // 敌人中心位置
                    width: 4, // 宽度
                    height: 10, // 高度
                    speed: 4, // 速度
                    damage: enemy.damage || 1, // 伤害值
                    direction: dir, // 移动方向
                    texture: 'enemyBullet' // 纹理名称
                };
                enemyBullets.push(bullet);
            }
            break;
            
        case 'spiral': // 螺旋弹幕
            // 发射螺旋弹幕
            for (let i = 0; i < 16; i++) {
                const angle = Math.PI * 2 * i / 16 + now / 1000; // 旋转角度
                const direction = {
                    x: Math.sin(angle),
                    y: Math.cos(angle)
                };
                
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 2, // 敌人中心位置
                    y: enemy.y + enemy.height / 2, // 敌人中心位置
                    width: 4, // 宽度
                    height: 10, // 高度
                    speed: 3, // 速度
                    damage: enemy.damage || 1, // 伤害值
                    direction: direction, // 移动方向
                    pattern: 'spiral', // 移动模式
                    texture: 'enemyBullet' // 纹理名称
                };
                enemyBullets.push(bullet);
            }
            break;
            
        case 'tracking': // 追踪弹幕
            // 发射3发追踪玩家的子弹
            for (let i = 0; i < 3; i++) {
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 2 + (i - 1) * 10, // 敌人中心位置
                    y: enemy.y + enemy.height, // 敌人底部位置
                    width: 5, // 宽度
                    height: 12, // 高度
                    speed: 3, // 速度
                    damage: enemy.damage || 1, // 伤害值
                    tracking: true, // 追踪标志
                    texture: 'enemyBullet' // 纹理名称
                };
                enemyBullets.push(bullet);
            }
            break;
            
        case 'circle': // 圆形弹幕
            // 发射16发圆形排列的子弹
            for (let i = 0; i < 16; i++) {
                const angle = Math.PI * 2 * i / 16;
                const direction = {
                    x: Math.sin(angle),
                    y: Math.cos(angle)
                };
                
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 2, // 敌人中心位置
                    y: enemy.y + enemy.height / 2, // 敌人中心位置
                    width: 6, // 宽度
                    height: 12, // 高度
                    speed: 3, // 速度
                    damage: enemy.damage || 2, // 伤害值
                    direction: direction, // 移动方向
                    texture: 'enemyBullet' // 纹理名称
                };
                enemyBullets.push(bullet);
            }
            break;
            
        case 'laser': // 激光弹幕
            // 发射大型激光束
            const laser = {
                x: enemy.x + enemy.width / 2 - 10, // 敌人中心位置
                y: enemy.y + enemy.height, // 敌人底部位置
                width: 20, // 宽度
                height: GAME_HEIGHT, // 高度等于屏幕高度
                speed: 0, // 无需移动
                damage: enemy.damage * 2 || 4, // 高伤害
                timer: 60, // 持续时间（帧数）
                warningTimer: 30, // 警告时间
                isLaser: true, // 激光标志
                texture: 'laser' // 纹理名称
            };
            enemyBullets.push(laser);
            break;
            
        case 'hell': // 地狱弹幕
            // 发射多种组合弹幕
            fireEnemyBulletPattern(enemy, 'circle');
            setTimeout(() => fireEnemyBulletPattern(enemy, 'tracking'), 200);
            setTimeout(() => fireEnemyBulletPattern(enemy, 'spiral'), 400);
            break;
    }
}

// 启动关卡
function startLevel(level) {
    // 清空所有敌机和子弹
    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerups = [];
    
    // 重置关卡计时器
    levelTimer = 0;
    bossActive = false;
    
    // 根据关卡设置难度
    switch(level) {
        case 1:
            // 第一关：基础敌机，60秒后出现BOSS
            setInterval(() => {
                if (!gameOver && !gameWin && !bossActive && levelTimer < 3600) { // 60秒 * 60帧
                    spawnEnemy('minion');
                }
            }, 1200); // 每1.2秒生成一个基础敌机
            break;
        case 2:
            // 第二关：基础敌机和精英敌机，45秒后出现BOSS
            setInterval(() => {
                if (!gameOver && !gameWin && !bossActive && levelTimer < 2700) { // 45秒 * 60帧
                    spawnEnemy(Math.random() < 0.7 ? 'minion' : 'elite');
                }
            }, 1000); // 每1秒生成一个敌机
            break;
        case 3:
            // 第三关：基础敌机和精英敌机，30秒后出现BOSS
            setInterval(() => {
                if (!gameOver && !gameWin && !bossActive && levelTimer < 1800) { // 30秒 * 60帧
                    spawnEnemy(Math.random() < 0.5 ? 'minion' : 'elite');
                }
            }, 800); // 每0.8秒生成一个敌机
            break;
    }
}

// 检查关卡进度
function checkLevelProgress() {
    // 检查是否应该生成BOSS
    if (!bossActive) {
        if ((currentLevel === 1 && levelTimer >= 3600) || // 第一关60秒后
            (currentLevel === 2 && levelTimer >= 2700) || // 第二关45秒后
            (currentLevel === 3 && levelTimer >= 1800)) { // 第三关30秒后
            spawnBoss();
            bossActive = true;
        }
    }
    
    // 检查是否所有BOSS都被击败
    if (bossActive && enemies.length === 0) {
        // 关卡完成
        if (currentLevel < 3) {
            // 进入下一关
            currentLevel++;
            startLevel(currentLevel);
        } else {
            // 游戏胜利
            gameWin = true;
        }
    }
}

// 生成敌机
function spawnEnemy(type = 'minion') {
    if (gameOver || gameWin) return; // 游戏结束，不生成敌机
    
    let enemy;
    
    switch(type) {
        case 'minion': // 基础杂兵
            enemy = {
                type: 'minion',
                x: Math.random() * (GAME_WIDTH - 30), // 随机X坐标
                y: -30, // 屏幕顶部以上
                width: 30, // 宽度
                height: 30, // 高度
                speed: Math.random() * 1.5 + 1, // 随机速度 (1-2.5)
                health: 1, // 生命值
                damage: 1, // 伤害值
                score: 100, // 分数
                pattern: Math.random() < 0.7 ? 'straight' : 'wave', // 移动模式：直线或波浪
                waveOffset: Math.random() * GAME_WIDTH, // 波浪移动的偏移量
                texture: 'enemy' // 纹理名称
            };
            break;
        
        case 'elite': // 精英敌机
            enemy = {
                type: 'elite',
                x: Math.random() * (GAME_WIDTH - 40), // 随机X坐标
                y: -40, // 屏幕顶部以上
                width: 40, // 宽度
                height: 40, // 高度
                speed: Math.random() * 1 + 1, // 随机速度 (1-2)
                health: 3, // 生命值
                damage: 2, // 伤害值
                score: 300, // 分数
                pattern: Math.random() < 0.5 ? 'straight' : 'zigzag', // 移动模式：直线或之字形
                fireRate: 2000, // 射击频率
                lastFired: 0, // 上次射击时间
                texture: 'elite' // 纹理名称
            };
            break;
    }
    
    enemies.push(enemy); // 添加到敌机数组
}

// 生成BOSS
function spawnBoss() {
    // 根据当前关卡创建不同的BOSS
    let boss;
    
    switch(currentLevel) {
        case 1:
            boss = {
                type: 'boss',
                x: GAME_WIDTH / 2 - 50, // 居中
                y: -100, // 屏幕顶部以上
                width: 100, // 宽度
                height: 100, // 高度
                speed: 1, // 速度
                health: 100, // 生命值
                maxHealth: 100, // 最大生命值
                damage: 3, // 伤害值
                score: 1000, // 分数
                phase: 1, // 阶段
                pattern: 'hover', // 移动模式：悬停
                targetX: GAME_WIDTH / 2 - 50, // 目标X坐标
                hoverY: 100, // 悬停高度
                fireRate: 1500, // 射击频率
                lastFired: 0, // 上次射击时间
                bulletPattern: 'spread', // 子弹模式：扇形
                texture: 'boss1' // 纹理名称
            };
            break;
        
        case 2:
            boss = {
                type: 'boss',
                x: GAME_WIDTH / 2 - 60, // 居中
                y: -120, // 屏幕顶部以上
                width: 120, // 宽度
                height: 120, // 高度
                speed: 1.5, // 速度
                health: 250, // 生命值
                maxHealth: 50, // 最大生命值
                damage: 4, // 伤害值
                score: 2000, // 分数
                phase: 1, // 阶段
                pattern: 'patrol', // 移动模式：巡逻
                direction: 1, // 移动方向
                patrolMin: 100, // 巡逻最小X坐标
                patrolMax: GAME_WIDTH - 220, // 巡逻最大X坐标
                hoverY: 120, // 悬停高度
                fireRate: 1200, // 射击频率
                lastFired: 0, // 上次射击时间
                bulletPattern: 'cross', // 子弹模式：十字
                texture: 'boss2' // 纹理名称
            };
            break;
        
        case 3:
            boss = {
                type: 'boss',
                x: GAME_WIDTH / 2 - 75, // 居中
                y: -150, // 屏幕顶部以上
                width: 150, // 宽度
                height: 150, // 高度
                speed: 2, // 速度
                health: 380, // 生命值
                maxHealth: 380, // 最大生命值
                damage: 5, // 伤害值
                score: 3000, // 分数
                phase: 1, // 阶段
                pattern: 'complex', // 移动模式：复杂
                moveTimer: 0, // 移动计时器
                targetX: GAME_WIDTH / 2 - 75, // 目标X坐标
                targetY: 150, // 目标Y坐标
                fireRate: 1000, // 射击频率
                lastFired: 0, // 上次射击时间
                bulletPattern: 'spiral', // 子弹模式：螺旋
                texture: 'boss3' // 纹理名称
            };
            break;
    }
    
    enemies.push(boss); // 添加到敌机数组
}

// 发射子弹
function fireBullet() {
    // 根据武器等级创建子弹
    const weaponConfig = WEAPON_CONFIGS[player.weaponLevel];
    
    // 计算子弹位置
    const centerX = player.x + player.width / 2;
    
    // 根据子弹数量创建子弹
    for (let i = 0; i < weaponConfig.bulletCount; i++) {
        // 计算子弹偏移量
        let offsetX = 0;
        if (weaponConfig.bulletCount > 1) {
            // 多发子弹时，计算分散偏移
            offsetX = (i - (weaponConfig.bulletCount - 1) / 2) * 10;
        }
        
        // 创建子弹
        const bullet = {
            x: centerX - weaponConfig.size.width / 2 + offsetX, // 考虑偏移的位置
            y: player.y - weaponConfig.size.height, // 玩家顶部位置
            width: weaponConfig.size.width, // 宽度
            height: weaponConfig.size.height, // 高度
            speed: 10, // 速度
            damage: weaponConfig.damage, // 伤害值
            color: weaponConfig.color, // 颜色
            texture: 'bullet' // 纹理名称
        };
        
        bullets.push(bullet); // 添加到子弹数组
    }
}

// 敌人发射子弹
function fireEnemyBullet() {
    // 随机选择一个敌人发射子弹
    if (enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]; // 随机选择敌人
        
        // 创建敌人子弹
        const bullet = {
            x: randomEnemy.x + randomEnemy.width / 2 - 2, // 敌人中心位置
            y: randomEnemy.y + randomEnemy.height, // 敌人底部位置
            width: 4, // 宽度
            height: 10, // 高度
            speed: 5, // 速度
            texture: 'enemyBullet' // 纹理名称
        };
        
        enemyBullets.push(bullet); // 添加到敌人子弹数组
    }
}

// 生成道具
function spawnPowerup() {
    if (gameOver || gameWin) return; // 游戏结束，不生成道具
    
    // 随机道具类型
    const types = ['weapon', 'health', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // 根据类型设置尺寸
    let width = 20, height = 20; // 默认尺寸
    if (type === 'weapon') {
        width = height = 30; // 宝箱使用更大的尺寸
    }
    
    // 创建道具
    const powerup = {
        x: Math.random() * (GAME_WIDTH - width), // 随机X坐标
        y: -height, // 屏幕顶部以上
        width: width, // 宽度
        height: height, // 高度
        speed: 2, // 速度
        type: type, // 道具类型
        texture: type // 纹理名称
    };
    
    powerups.push(powerup); // 添加到道具数组
}

// 更新道具
function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i]; // 获取道具
        
        // 移动道具
        powerup.y += powerup.speed; // 向下移动
        
        // 超出屏幕底部，移除道具
        if (powerup.y > GAME_HEIGHT) {
            powerups.splice(i, 1); // 移除道具
        }
    }
}

// 更新爆炸效果
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i]; // 获取爆炸效果
        
        // 更新爆炸效果
        if (explosion.update()) {
            explosions.splice(i, 1); // 移除爆炸效果
        }
    }
}

// 检测碰撞
function checkCollisions() {
    // 检测玩家子弹和敌机碰撞
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]; // 获取子弹
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j]; // 获取敌机
            
            // 检测碰撞
            if (isColliding(bullet, enemy)) {
                // 处理敌机受伤
                enemy.health -= bullet.damage;
                
                // 创建爆炸效果
                createExplosion(bullet.x, bullet.y, 'small');
                
                // 移除子弹
                bullets.splice(i, 1); // 移除子弹
                
                // 检查敌机是否被击败
                if (enemy.health <= 0) {
                    // 创建爆炸效果
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'large');
                    
                    // 移除敌机
                    enemies.splice(j, 1); // 移除敌机
                    
                    // 增加分数
                    score += enemy.score || 100; // 增加分数
                    
                    // 有概率掉落道具
                    if (Math.random() < 0.2) {
                        // 随机决定道具类型
                        const powerupType = Math.random() < 0.7 ? 'weapon' : 'health';
                        
                        // 根据类型设置尺寸
                        let width = 20, height = 20; // 默认尺寸
                        if (powerupType === 'weapon') {
                            width = height = 30; // 宝箱使用更大的尺寸
                        }
                        
                        const powerup = {
                            x: enemy.x + enemy.width / 2 - width / 2, // 敌机中心位置
                            y: enemy.y + enemy.height / 2 - height / 2, // 敌机中心位置
                            width: width, // 宽度
                            height: height, // 高度
                            speed: 2, // 速度
                            type: powerupType, // 道具类型
                            texture: powerupType // 纹理名称
                        };
                        
                        powerups.push(powerup); // 添加到道具数组
                    }
                }
                
                break; // 一颗子弹只能击中一架敌机
            }
        }
    }
    
    // 检测玩家和敌机碰撞
    if (!player.invincible) {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]; // 获取敌机
            
            // 检测碰撞
            if (isColliding(player, enemy)) {
                // 处理玩家受伤
                playerHit(enemy.damage || 1);
                
                // 创建爆炸效果
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'large');
                
                // 移除敌机
                enemies.splice(i, 1); // 移除敌机
                break; // 一次碰撞足以结束处理
            }
        }
    }
    
    // 检测敌人子弹和玩家碰撞
    if (!player.invincible) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i]; // 获取敌人子弹
            
            // 检测碰撞
            if (isColliding(bullet, player)) {
                // 处理玩家受伤
                playerHit(bullet.damage || 1);
                
                // 创建爆炸效果
                createExplosion(bullet.x, bullet.y, 'small');
                
                // 移除子弹
                enemyBullets.splice(i, 1); // 移除子弹
                break; // 一次碰撞足以结束处理
            }
        }
    }
    
    // 检测玩家和道具碰撞
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i]; // 获取道具
        
        // 检测碰撞
        if (isColliding(player, powerup)) {
            // 处理道具效果
            switch (powerup.type) {
                case 'weapon':
                    // 提升武器等级
                    if (player.weaponLevel < 4) {
                        player.weaponLevel++;
                    } else {
                        // 已达最高等级，加分
                        score += 500;
                    }
                    break;
                    
                case 'health':
                    // 恢复生命值
                    player.health = Math.min(player.health + 1, 5);
                    break;
                    
                case 'shield':
                    // 给玩家添加护盾
                    player.invincible = true;
                    player.invincibleTimer = 300; // 5秒无敌
                    break;
            }
            
            // 移除道具
            powerups.splice(i, 1); // 移除道具
        }
    }
}

// 处理玩家受伤
function playerHit(damage) {
    // 减少生命值
    player.health -= damage;
    
    // 检查是否游戏结束
    if (player.health <= 0) {
        gameOver = true; // 游戏结束
        createExplosion(player.x + player.width / 2, player.y + player.height / 2, 'large');
    } else {
        // 短暂无敌
        player.invincible = true;
        player.invincibleTimer = 120; // 2秒无敌
    }
}

// 创建爆炸效果
function createExplosion(x, y, size = 'medium') {
    let width, height;
    
    // 根据大小设置爆炸尺寸
    switch (size) {
        case 'small': width = height = 20; break;
        case 'medium': width = height = 30; break;
        case 'large': width = height = 50; break;
    }
    
    const explosion = {
        x: x - width / 2, // 居中X坐标
        y: y - height / 2, // 居中Y坐标
        width: width, // 宽度
        height: height, // 高度
        frame: 0, // 当前帧
        maxFrames: 5, // 最大帧数
        size: size, // 大小
        texture: 'explosion', // 纹理名称
        update: function() {
            this.frame++; // 更新帧数
            return this.frame >= this.maxFrames; // 返回是否完成
        }
    };
    
    explosions.push(explosion); // 添加到爆炸效果数组
}

// 碰撞检测
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.fillStyle = '#000000'; // 黑色背景
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // 填充矩形
    
    // 绘制背景
    ctx.drawImage(textures.background, 0, 0); // 绘制背景
    
    // 绘制玩家（如果无敌则闪烁）
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.drawImage(textures.player, player.x, player.y); // 绘制玩家
        
        // 如果有护盾，绘制护盾效果
        if (player.invincible) {
            ctx.strokeStyle = '#0099ff'; // 蓝色
            ctx.lineWidth = 2; // 线宽
            ctx.beginPath(); // 开始路径
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 
                    player.width / 2 + 5, 0, Math.PI * 2); // 圆形护盾
            ctx.stroke(); // 描边
        }
    }
    
    // 绘制敌机
    for (const enemy of enemies) {
        // 根据敌机类型选择纹理
        const texture = textures[enemy.texture];
        if (texture) {
            // BOSS特殊渲染效果
            if (enemy.type === 'boss') {
                // 为BOSS添加动态能量场效果
                // 脉动光环
                const pulseSize = Math.sin(Date.now() / 200) * 5 + 10; // 脉动大小
                const pulseOpacity = Math.sin(Date.now() / 300) * 0.3 + 0.5; // 脉动透明度
                
                // 设置BOSS光环颜色
                let energyGlowColor;
                if (enemy.texture === 'boss1') energyGlowColor = 'rgba(255, 50, 0, ' + pulseOpacity + ')';
                else if (enemy.texture === 'boss2') energyGlowColor = 'rgba(0, 255, 50, ' + pulseOpacity + ')';
                else energyGlowColor = 'rgba(50, 0, 255, ' + pulseOpacity + ')';
                
                // 绘制能量光环
                ctx.beginPath();
                ctx.arc(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.width / 2 + pulseSize,
                    0, Math.PI * 2
                );
                
                // 创建径向渐变
                const energyGlow = ctx.createRadialGradient(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.width / 2,
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.width / 2 + pulseSize
                );
                
                energyGlow.addColorStop(0, energyGlowColor);
                energyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = energyGlow;
                ctx.fill();
                
                // 武器充能效果
                if (Date.now() - enemy.lastFired < enemy.fireRate / 2) {
                    const chargePercent = (Date.now() - enemy.lastFired) / (enemy.fireRate / 2);
                    const weaponCount = enemy.phase + 4; // 根据阶段增加武器数量
                    
                    for (let i = 0; i < weaponCount; i++) {
                        const angle = Math.PI * 2 * i / weaponCount;
                        const distance = enemy.width / 2 - 10;
                        const x = enemy.x + enemy.width / 2 + Math.cos(angle) * distance;
                        const y = enemy.y + enemy.height / 2 + Math.sin(angle) * distance;
                        
                        // 绘制充能效果
                        ctx.beginPath();
                        ctx.arc(x, y, 5 * chargePercent, 0, Math.PI * 2);
                        ctx.fillStyle = energyGlowColor.replace(')', ', ' + chargePercent + ')');
                        ctx.fill();
                    }
                }
            }
            
            // 绘制敌机贴图
            ctx.drawImage(texture, enemy.x, enemy.y); // 绘制敌机
            
            // 如果是BOSS，绘制血条
            if (enemy.type === 'boss') {
                // 计算血条宽度
                const healthBarWidth = enemy.width;
                const currentHealthWidth = (enemy.health / enemy.maxHealth) * healthBarWidth;
                
                // 绘制血条背景
                ctx.fillStyle = '#333333'; // 深灰色
                ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth, 5); // 背景
                
                // 绘制当前血量
                // 根据血量百分比改变颜色
                const healthPercent = enemy.health / enemy.maxHealth;
                let healthColor;
                if (healthPercent > 0.6) {
                    healthColor = '#00ff00'; // 绿色 (健康)
                } else if (healthPercent > 0.3) {
                    healthColor = '#ffff00'; // 黄色 (警告)
                } else {
                    healthColor = '#ff0000'; // 红色 (危险)
                }
                
                ctx.fillStyle = healthColor;
                ctx.fillRect(enemy.x, enemy.y - 10, currentHealthWidth, 5); // 血量
                
                // 绘制阶段指示器
                for (let i = 1; i <= 3; i++) {
                    const phaseX = enemy.x + healthBarWidth * (1 - i * 0.3);
                    ctx.strokeStyle = enemy.phase >= i ? '#ffff00' : '#666666'; // 当前阶段为黄色
                    ctx.beginPath(); // 开始路径
                    ctx.moveTo(phaseX, enemy.y - 12); // 上部
                    ctx.lineTo(phaseX, enemy.y - 3); // 下部
                    ctx.stroke(); // 描边
                }
            }
        }
    }
    
    // 绘制子弹
    for (const bullet of bullets) {
        // 使用自定义颜色绘制子弹
        ctx.fillStyle = bullet.color || '#ffff00'; // 使用子弹颜色，默认为黄色
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height); // 绘制子弹
    }
    
    // 绘制敌人子弹
    for (const bullet of enemyBullets) {
        if (bullet.isLaser) {
            // 激光子弹特殊处理
            if (bullet.warningTimer > 0) {
                // 警告阶段，绘制红色警告框
                ctx.strokeStyle = '#ff0000'; // 红色
                ctx.lineWidth = 2; // 线宽
                ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height); // 绘制警告框
                bullet.warningTimer--; // 减少警告时间
            } else {
                // 激光阶段
                ctx.drawImage(textures.laser, bullet.x, bullet.y); // 绘制激光
                bullet.timer--; // 减少持续时间
                if (bullet.timer <= 0) {
                    // 移除激光
                    const index = enemyBullets.indexOf(bullet);
                    if (index !== -1) enemyBullets.splice(index, 1);
                }
            }
        } else {
            // 普通子弹
            ctx.drawImage(textures.enemyBullet, bullet.x, bullet.y); // 绘制敌人子弹
        }
    }
    
    // 绘制道具
    for (const powerup of powerups) {
        const texture = textures[powerup.texture];
        if (texture) {
            // 如果是宝箱，先绘制光环效果
            if (powerup.type === 'weapon') {
                // 创建闪耀光环
                const gradient = ctx.createRadialGradient(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width / 2,
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width * 0.8
                );
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.7)'); // 金色
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');   // 透明
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width * 0.8, 
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // 脉动效果 - 使用正弦函数使光环大小随时间变化
                const pulseSize = Math.sin(Date.now() / 200) * 4 + 5; // 脉动大小 1-9
                ctx.strokeStyle = 'rgba(255, 223, 0, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width / 2 + pulseSize, 
                    0, Math.PI * 2
                );
                ctx.stroke();
            } 
            // 如果是医疗包，添加红色光晕
            else if (powerup.type === 'health') {
                // 脉动效果 - 使用正弦函数使红色光环产生呼吸效果
                const pulseIntensity = Math.sin(Date.now() / 300) * 0.2 + 0.5; // 0.3-0.7之间呼吸
                
                // 创建红色光环
                const gradient = ctx.createRadialGradient(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width / 4,
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width * 0.8
                );
                gradient.addColorStop(0, `rgba(255, 50, 50, ${pulseIntensity})`); // 红色
                gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');   // 透明
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2, 
                    powerup.width * 0.8, 
                    0, Math.PI * 2
                );
                ctx.fill();
            }
            
            // 绘制道具贴图
            ctx.drawImage(texture, powerup.x, powerup.y); // 绘制道具
        }
    }
    
    // 绘制爆炸效果
    for (const explosion of explosions) {
        // 根据帧数调整透明度
        const alpha = 1 - explosion.frame / explosion.maxFrames;
        ctx.globalAlpha = alpha; // 设置透明度
        
        // 根据大小调整绘制
        const scale = explosion.size === 'large' ? 1 : 
                       explosion.size === 'medium' ? 0.6 : 0.4;
                       
        // 绘制爆炸
        ctx.drawImage(textures.explosion, 
                       explosion.x, explosion.y, 
                       explosion.width, explosion.height); // 绘制爆炸
                       
        ctx.globalAlpha = 1; // 恢复透明度
    }
    
    // 绘制UI
    drawUI();
    
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
    } else if (gameWin) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 半透明黑色
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // 填充矩形
        
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.font = '48px Arial'; // 字体
        ctx.textAlign = 'center'; // 居中对齐
        ctx.fillText('恭喜通关!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50); // 绘制胜利消息
        ctx.font = '24px Arial'; // 字体
        ctx.fillText(`最终分数: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2); // 绘制分数
        ctx.fillText('按F5刷新重新开始', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50); // 绘制重新开始
    }
}

// 绘制UI
function drawUI() {
    // 绘制分数
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.font = '24px Arial'; // 字体
    ctx.textAlign = 'left'; // 左对齐
    ctx.fillText(`分数: ${score}`, 10, 30); // 绘制分数
    
    // 绘制生命值
    ctx.fillText(`生命: `, 10, 60); // 绘制生命标签
    for (let i = 0; i < player.health; i++) {
        ctx.fillStyle = '#ff0000'; // 红色
        ctx.fillRect(80 + i * 25, 45, 20, 20); // 绘制生命图标
    }
    
    // 绘制武器等级
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.fillText(`武器: ${player.weaponLevel}`, 10, 90); // 绘制武器等级
    
    // 绘制关卡信息
    ctx.textAlign = 'right'; // 右对齐
    ctx.fillText(`关卡: ${currentLevel}`, GAME_WIDTH - 10, 30); // 绘制关卡
    
    // 如果BOSS激活，绘制BOSS信息
    if (bossActive) {
        ctx.fillText(`BOSS战斗中`, GAME_WIDTH - 10, 60); // 绘制BOSS提示
    }
}

// 当页面加载完成，初始化游戏
window.onload = init; 