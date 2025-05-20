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
let isMobile = false; // 是否为移动设备
let isJoystickActive = false; // 摇杆是否激活
let joystickPosition = { x: 0, y: 0 }; // 摇杆位置
let joystickThumbPosition = { x: 0, y: 0 }; // 摇杆手柄位置
let joystickVector = { x: 0, y: 0 }; // 摇杆向量
let touchId = null; // 触摸ID，用于追踪多点触控
let gameLoopId = null; // 游戏循环ID
let lastFrameTime = 0; // 上一帧时间
let mobileSetting = { // 移动设备设置
    particleCount: 0.5, // 粒子效果数量缩放比例
    lowGraphics: false, // 是否启用低画质模式
    fps: 60 // 帧率
};
let debugInfo = { // 调试信息
    isMobileDetected: false, // 是否检测到移动设备
    touchEventsSupported: false, // 是否支持触摸事件
    joystickActive: false, // 摇杆是否激活
    lastTouchPos: {x: 0, y: 0}, // 最后触摸位置
    lastJoystickVector: {x: 0, y: 0} // 最后摇杆向量
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

// 加载状态变量
let loadingStatus = {
    phaser: false, // Phaser库加载状态
    textures: false, // 纹理加载状态
    initialized: false, // 初始化状态
    progress: 0, // 加载进度
    messages: [], // 加载消息
    startTime: 0, // 开始加载时间
    timeout: 10000 // 超时时间 (10秒)
};

// 暴露更新加载状态函数到全局作用域，以便其他脚本调用
window.updateLoadingStatus = updateLoadingStatus;

// 更新加载状态
function updateLoadingStatus(component, status, message) {
    // 更新组件状态
    if (component) {
        loadingStatus[component] = status;
    }
    
    // 添加消息到日志
    if (message) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        loadingStatus.messages.push(logMessage);
        
        // 更新状态文本
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        
        // 更新日志显示
        const logElement = document.getElementById('loading-log');
        if (logElement) {
            logElement.innerHTML += logMessage + '<br>';
            logElement.scrollTop = logElement.scrollHeight;
        }
    }
    
    // 计算总进度
    let totalProgress = 0;
    
    // Phaser库加载权重30%
    if (loadingStatus.phaser) totalProgress += 30;
    
    // 纹理加载权重40%
    if (loadingStatus.textures) totalProgress += 40;
    
    // 初始化权重30%
    if (loadingStatus.initialized) totalProgress += 30;
    
    // 更新进度条
    loadingStatus.progress = totalProgress;
    const progressBar = document.getElementById('loading-progress-bar');
    if (progressBar) {
        progressBar.style.width = totalProgress + '%';
    }
    
    // 检查是否超时
    const currentTime = Date.now();
    if (loadingStatus.startTime && (currentTime - loadingStatus.startTime > loadingStatus.timeout)) {
        // 显示调试按钮
        const forceButton = document.getElementById('force-continue');
        if (forceButton) {
            forceButton.style.display = 'block';
        }
        
        const logElement = document.getElementById('loading-log');
        if (logElement) {
            logElement.style.display = 'block';
        }
        
        // 更新状态文本
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = "加载超时，请检查控制台或点击强制继续";
            statusElement.style.color = '#ff5555';
        }
        
        // 重置超时检查，避免重复触发
        loadingStatus.startTime = 0;
    }
    
    // 如果全部加载完成，隐藏加载指示器
    if (totalProgress >= 100) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            // 延迟一秒隐藏，让用户看到100%
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 1000);
        }
    }
}

// 强制继续游戏
function forceContinueGame() {
    // 更新所有状态为完成
    loadingStatus.phaser = true;
    loadingStatus.textures = true;
    loadingStatus.initialized = true;
    
    // 更新进度条
    updateLoadingStatus(null, null, "强制继续游戏...");
    
    // 隐藏加载指示器
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // 如果游戏已经初始化，不要重复初始化
    if (!gameLoopId) {
        // 尝试继续初始化游戏
        init();
    }
}

// 创建游戏纹理
function createTextures() {
    updateLoadingStatus(null, null, "创建游戏纹理...");
    
    // 创建离屏画布来生成纹理
    const createOffscreenTexture = (width, height, callback) => {
        const offCanvas = document.createElement('canvas'); // 创建离屏画布
        offCanvas.width = width; // 设置宽度
        offCanvas.height = height; // 设置高度
        const offCtx = offCanvas.getContext('2d'); // 获取上下文
        callback(offCtx); // 绘制内容
        return offCanvas; // 返回画布作为纹理
    };
    
    // 背景纹理
    updateLoadingStatus(null, null, "创建背景纹理...");
    textures.background = createOffscreenTexture(GAME_WIDTH, GAME_HEIGHT, (ctx) => {
        // 深色背景
        ctx.fillStyle = '#000'; // 黑色背景
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // 填充整个画布
        
        // 绘制星星
        ctx.fillStyle = '#FFF'; // 白色星星
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * GAME_WIDTH; // 随机X坐标
            const y = Math.random() * GAME_HEIGHT; // 随机Y坐标
            const size = Math.random() * 2 + 1; // 随机大小
            ctx.fillRect(x, y, size, size); // 绘制星星
        }
        
        // 添加一些远景星云
        ctx.fillStyle = 'rgba(50, 30, 100, 0.2)'; // 紫色星云
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * GAME_WIDTH; // 随机X坐标
            const y = Math.random() * GAME_HEIGHT; // 随机Y坐标
            const radius = Math.random() * 150 + 50; // 随机半径
            
            // 绘制模糊星云
            ctx.beginPath(); // 开始路径
            ctx.arc(x, y, radius, 0, Math.PI * 2); // 绘制圆形
            ctx.fill(); // 填充
        }
    });
    
    // 玩家飞机纹理
    updateLoadingStatus(null, null, "创建玩家飞机纹理...");
    textures.player = createOffscreenTexture(30, 30, (ctx) => {
        // 飞机主体
        ctx.fillStyle = '#0088ff'; // 蓝色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(15, 0); // 顶点
        ctx.lineTo(30, 30); // 右下
        ctx.lineTo(15, 25); // 底部中点
        ctx.lineTo(0, 30); // 左下
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 飞机窗口
        ctx.fillStyle = '#44ffff'; // 青色
        ctx.beginPath(); // 开始路径
        ctx.arc(15, 10, 5, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // 引擎光芒
        ctx.fillStyle = '#ffaa00'; // 橙色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(10, 25); // 左上
        ctx.lineTo(15, 35); // 下方
        ctx.lineTo(20, 25); // 右上
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
    });
    
    // 基本敌机纹理
    textures.enemy = createOffscreenTexture(30, 30, (ctx) => {
        // 敌机主体 - 战斗机形状，头部朝下
        ctx.fillStyle = '#cc3333'; // 红色机身
        ctx.beginPath(); // 开始路径
        ctx.moveTo(15, 30); // 机头（朝下）
        ctx.lineTo(25, 20); // 右翼前沿
        ctx.lineTo(30, 10); // 右翼延伸
        ctx.lineTo(25, 8); // 右翼后缘
        ctx.lineTo(20, 10); // 右机身
        ctx.lineTo(18, 0); // 右尾翼
        ctx.lineTo(12, 0); // 左尾翼
        ctx.lineTo(10, 10); // 左机身
        ctx.lineTo(5, 8); // 左翼后缘
        ctx.lineTo(0, 10); // 左翼延伸
        ctx.lineTo(5, 20); // 左翼前沿
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 驾驶舱玻璃
        ctx.fillStyle = '#aaddff'; // 淡蓝色
        ctx.beginPath(); // 开始路径
        ctx.ellipse(15, 22, 4, 6, 0, 0, Math.PI * 2); // 椭圆形玻璃罩
        ctx.fill(); // 填充
        
        // 驾驶舱玻璃反光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // 半透明白色
        ctx.beginPath(); // 开始路径
        ctx.ellipse(14, 23, 2, 3, 0, 0, Math.PI * 2); // 椭圆形反光
        ctx.fill(); // 填充
        
        // 机身纹路
        ctx.strokeStyle = '#880000'; // 深红色
        ctx.lineWidth = 0.8; // 线宽
        
        // 机翼
        ctx.beginPath(); // 开始路径
        ctx.moveTo(5, 15); // 左侧
        ctx.lineTo(25, 15); // 右侧
        ctx.stroke(); // 描边
        
        // 机尾
        ctx.beginPath(); // 开始路径
        ctx.moveTo(15, 10); // 下部
        ctx.lineTo(15, 0); // 尾部
        ctx.stroke(); // 描边
        
        // 引擎喷射
        const engineGlow = ctx.createLinearGradient(15, 5, 15, -5);
        engineGlow.addColorStop(0, '#ff6600'); // 橙色
        engineGlow.addColorStop(1, 'rgba(255, 102, 0, 0)'); // 透明
        
        ctx.fillStyle = engineGlow; // 使用渐变
        ctx.beginPath(); // 开始路径
        ctx.moveTo(13, 0); // 左边
        ctx.lineTo(15, -5); // 顶部
        ctx.lineTo(17, 0); // 右边
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
    });
    
    // 精英敌机纹理
    textures.elite = createOffscreenTexture(40, 40, (ctx) => {
        // 军用战斗机外观 - 头部朝下
        
        // 基础梯形机身
        ctx.fillStyle = '#404060'; // 暗蓝灰色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(20, 40); // 机头（朝下）
        ctx.lineTo(28, 28); // 右前机身
        ctx.lineTo(32, 20); // 右翼连接点
        ctx.lineTo(28, 12); // 右后机身
        ctx.lineTo(24, 5); // 右侧尾部
        ctx.lineTo(16, 5); // 左侧尾部
        ctx.lineTo(12, 12); // 左后机身
        ctx.lineTo(8, 20); // 左翼连接点
        ctx.lineTo(12, 28); // 左前机身
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 机翼 - 左
        ctx.fillStyle = '#303050'; // 稍深一点的灰蓝色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(8, 20); // 翼根
        ctx.lineTo(0, 16); // 前缘尖端
        ctx.lineTo(5, 12); // 后缘
        ctx.lineTo(12, 12); // 与机身连接点
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 机翼 - 右
        ctx.beginPath(); // 开始路径
        ctx.moveTo(32, 20); // 翼根
        ctx.lineTo(40, 16); // 前缘尖端
        ctx.lineTo(35, 12); // 后缘
        ctx.lineTo(28, 12); // 与机身连接点
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 尾翼
        ctx.fillStyle = '#303050'; // 稍深一点的灰蓝色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(16, 5); // 左连接点
        ctx.lineTo(14, 0); // 左尾尖
        ctx.lineTo(26, 0); // 右尾尖
        ctx.lineTo(24, 5); // 右连接点
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 垂直尾翼
        ctx.beginPath(); // 开始路径
        ctx.moveTo(20, 10); // 底部
        ctx.lineTo(20, 18); // 顶部前
        ctx.lineTo(24, 12); // 顶部后
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 驾驶舱玻璃罩 - 高级战机使用梯形玻璃罩
        ctx.fillStyle = '#80d0ff'; // 蓝色玻璃
        ctx.beginPath(); // 开始路径
        ctx.moveTo(20, 35); // 前端（朝下）
        ctx.lineTo(24, 30); // 右前
        ctx.lineTo(24, 25); // 右后
        ctx.lineTo(16, 25); // 左后
        ctx.lineTo(16, 30); // 左前
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 玻璃罩反光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // 白色反光
        ctx.beginPath(); // 开始路径
        ctx.moveTo(20, 34); // 前端
        ctx.lineTo(22, 32); // 右前
        ctx.lineTo(22, 29); // 右后
        ctx.lineTo(18, 29); // 左后
        ctx.lineTo(18, 32); // 左前
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 机身细节 - 面板线
        ctx.strokeStyle = '#aaaacc'; // 亮灰色线条
        ctx.lineWidth = 0.5; // 细线
        
        // 机身线
        ctx.beginPath(); // 开始路径
        ctx.moveTo(20, 25); // 驾驶舱后
        ctx.lineTo(20, 10); // 尾部前
        ctx.stroke(); // 描边
        
        // 机翼线
        ctx.beginPath(); // 开始路径
        ctx.moveTo(3, 15); // 左翼
        ctx.lineTo(37, 15); // 右翼
        ctx.stroke(); // 描边
        
        // 引擎喷射 - 制作双引擎效果
        const engineGlow = ctx.createLinearGradient(20, 5, 20, -5);
        engineGlow.addColorStop(0, '#4488ff'); // 蓝色
        engineGlow.addColorStop(0.3, '#00ddff'); // 青色
        engineGlow.addColorStop(1, 'rgba(0, 153, 255, 0)'); // 透明
        
        // 左引擎
        ctx.fillStyle = engineGlow; // 使用渐变
        ctx.beginPath(); // 开始路径
        ctx.moveTo(17, 0); // 左边
        ctx.lineTo(16, -5); // 底部
        ctx.lineTo(19, 0); // 右边
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 右引擎
        ctx.beginPath(); // 开始路径
        ctx.moveTo(21, 0); // 左边
        ctx.lineTo(24, -5); // 底部
        ctx.lineTo(23, 0); // 右边
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 武器挂点
        ctx.fillStyle = '#252540'; // 深灰色
        
        // 左武器
        ctx.beginPath(); // 开始路径
        ctx.rect(6, 18, 6, 2); // 左侧武器舱
        ctx.fill(); // 填充
        
        // 右武器
        ctx.beginPath(); // 开始路径
        ctx.rect(28, 18, 6, 2); // 右侧武器舱
        ctx.fill(); // 填充
        
        // 中央武器
        ctx.beginPath(); // 开始路径
        ctx.rect(19, 25, 2, 5); // 中央机炮
        ctx.fill(); // 填充
    });
    
    // BOSS 1纹理
    textures.boss1 = createOffscreenTexture(100, 100, (ctx) => {
        // BOSS主体
        ctx.fillStyle = '#880000'; // 深红色
        ctx.beginPath(); // 开始路径
        ctx.arc(50, 50, 40, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // BOSS外壳
        ctx.strokeStyle = '#ff0000'; // 红色
        ctx.lineWidth = 5; // 线宽
        ctx.beginPath(); // 开始路径
        ctx.arc(50, 50, 45, 0, Math.PI * 2); // 绘制圆形
        ctx.stroke(); // 描边
        
        // BOSS核心
        ctx.fillStyle = '#ffff00'; // 黄色
        ctx.beginPath(); // 开始路径
        ctx.arc(50, 50, 15, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // BOSS眼睛
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.beginPath(); // 开始路径
        ctx.arc(35, 40, 5, 0, Math.PI * 2); // 左眼
        ctx.arc(65, 40, 5, 0, Math.PI * 2); // 右眼
        ctx.fill(); // 填充
        
        ctx.fillStyle = '#000000'; // 黑色
        ctx.beginPath(); // 开始路径
        ctx.arc(35, 40, 2, 0, Math.PI * 2); // 左眼瞳孔
        ctx.arc(65, 40, 2, 0, Math.PI * 2); // 右眼瞳孔
        ctx.fill(); // 填充
        
        // BOSS武器安装点
        ctx.fillStyle = '#555555'; // 灰色
        for (let i = 0; i < 4; i++) {
            const angle = Math.PI * 2 * i / 4; // 角度
            const x = 50 + Math.cos(angle) * 35; // X坐标
            const y = 50 + Math.sin(angle) * 35; // Y坐标
            
            ctx.beginPath(); // 开始路径
            ctx.arc(x, y, 8, 0, Math.PI * 2); // 绘制圆形
            ctx.fill(); // 填充
        }
    });
    
    // BOSS 2纹理
    textures.boss2 = createOffscreenTexture(120, 120, (ctx) => {
        // BOSS主体
        ctx.fillStyle = '#005500'; // 深绿色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(60, 20); // 顶点
        ctx.lineTo(100, 60); // 右上
        ctx.lineTo(100, 90); // 右下
        ctx.lineTo(60, 110); // 底部
        ctx.lineTo(20, 90); // 左下
        ctx.lineTo(20, 60); // 左上
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // BOSS装甲
        ctx.fillStyle = '#00aa00'; // 绿色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(60, 30); // 顶点
        ctx.lineTo(90, 60); // 右上
        ctx.lineTo(90, 85); // 右下
        ctx.lineTo(60, 100); // 底部
        ctx.lineTo(30, 85); // 左下
        ctx.lineTo(30, 60); // 左上
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // BOSS核心
        ctx.fillStyle = '#00ff00'; // 亮绿色
        ctx.beginPath(); // 开始路径
        ctx.arc(60, 65, 20, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // BOSS武器
        ctx.fillStyle = '#888888'; // 灰色
        ctx.fillRect(25, 70, 20, 5); // 左侧武器
        ctx.fillRect(75, 70, 20, 5); // 右侧武器
        
        // 能量纹路
        ctx.strokeStyle = '#00ff88'; // 青色
        ctx.lineWidth = 2; // 线宽
        
        // 左侧纹路
        ctx.beginPath(); // 开始路径
        ctx.moveTo(30, 60); // 起点
        ctx.lineTo(40, 50); // 转折点
        ctx.lineTo(60, 50); // 终点
        ctx.stroke(); // 描边
        
        // 右侧纹路
        ctx.beginPath(); // 开始路径
        ctx.moveTo(90, 60); // 起点
        ctx.lineTo(80, 50); // 转折点
        ctx.lineTo(60, 50); // 终点
        ctx.stroke(); // 描边
    });
    
    // BOSS 3纹理
    textures.boss3 = createOffscreenTexture(150, 150, (ctx) => {
        // BOSS主体
        ctx.fillStyle = '#000088'; // 深蓝色
        ctx.beginPath(); // 开始路径
        ctx.arc(75, 75, 50, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // 外部环
        ctx.strokeStyle = '#0000ff'; // 蓝色
        ctx.lineWidth = 8; // 线宽
        ctx.beginPath(); // 开始路径
        ctx.arc(75, 75, 60, 0, Math.PI * 2); // 绘制圆形
        ctx.stroke(); // 描边
        
        // 内部核心
        ctx.fillStyle = '#8888ff'; // 淡蓝色
        ctx.beginPath(); // 开始路径
        ctx.arc(75, 75, 25, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // 能量光芒
        const gradient = ctx.createRadialGradient(75, 75, 20, 75, 75, 30);
        gradient.addColorStop(0, '#ffffff'); // 白色中心
        gradient.addColorStop(1, '#0088ff'); // 蓝色边缘
        
        ctx.fillStyle = gradient; // 使用渐变
        ctx.beginPath(); // 开始路径
        ctx.arc(75, 75, 30, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // BOSS武器节点
        ctx.fillStyle = '#333333'; // 深灰色
        for (let i = 0; i < 8; i++) {
            const angle = Math.PI * 2 * i / 8; // 角度
            const x = 75 + Math.cos(angle) * 50; // X坐标
            const y = 75 + Math.sin(angle) * 50; // Y坐标
            
            ctx.beginPath(); // 开始路径
            ctx.arc(x, y, 10, 0, Math.PI * 2); // 绘制圆形
            ctx.fill(); // 填充
            
            // 武器发光
            ctx.fillStyle = '#00ffff'; // 青色
            ctx.beginPath(); // 开始路径
            ctx.arc(x, y, 5, 0, Math.PI * 2); // 绘制圆形
            ctx.fill(); // 填充
            
            ctx.fillStyle = '#333333'; // 恢复颜色
        }
    });
    
    // 玩家子弹纹理
    textures.bullet = createOffscreenTexture(10, 15, (ctx) => {
        // 子弹主体
        ctx.fillStyle = '#ffff00'; // 黄色
        ctx.fillRect(0, 0, 10, 15); // 填充矩形
        
        // 子弹头
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(0, 0); // 左上
        ctx.lineTo(10, 0); // 右上
        ctx.lineTo(5, -5); // 顶点
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
    });
    
    // 敌人子弹纹理
    textures.enemyBullet = createOffscreenTexture(8, 12, (ctx) => {
        // 子弹主体
        ctx.fillStyle = '#ff0000'; // 红色
        ctx.fillRect(0, 0, 8, 12); // 填充矩形
        
        // 子弹尾部
        ctx.fillStyle = '#ffaa00'; // 橙色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(0, 12); // 左下
        ctx.lineTo(8, 12); // 右下
        ctx.lineTo(4, 15); // 底点
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
    });
    
    // 激光纹理
    textures.laser = createOffscreenTexture(20, GAME_HEIGHT, (ctx) => {
        // 激光主体
        const gradient = ctx.createLinearGradient(0, 0, 20, 0);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)'); // 透明红色
        gradient.addColorStop(0.2, 'rgba(255, 0, 0, 0.3)'); // 半透明红色
        gradient.addColorStop(0.5, 'rgba(255, 150, 150, 0.8)'); // 亮红色
        gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.3)'); // 半透明红色
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // 透明红色
        
        ctx.fillStyle = gradient; // 使用渐变
        ctx.fillRect(0, 0, 20, GAME_HEIGHT); // 填充矩形
        
        // 激光中心线
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.fillRect(8, 0, 4, GAME_HEIGHT); // 填充矩形
        
        // 激光脉冲效果
        for (let i = 0; i < GAME_HEIGHT; i += 50) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // 白色
            ctx.fillRect(5, i, 10, 20); // 填充矩形
        }
    });
    
    // 爆炸纹理
    textures.explosion = createOffscreenTexture(150, 150, (ctx) => {
        // 爆炸中心
        const gradient = ctx.createRadialGradient(75, 75, 0, 75, 75, 75);
        gradient.addColorStop(0, '#ffffff'); // 白色中心
        gradient.addColorStop(0.2, '#ffff00'); // 黄色
        gradient.addColorStop(0.4, '#ff8800'); // 橙色
        gradient.addColorStop(0.7, '#ff0000'); // 红色
        gradient.addColorStop(1, 'rgba(120, 0, 0, 0)'); // 透明红色
        
        ctx.fillStyle = gradient; // 使用渐变
        ctx.beginPath(); // 开始路径
        ctx.arc(75, 75, 75, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // 爆炸光芒
        ctx.strokeStyle = '#ff8800'; // 橙色
        ctx.lineWidth = 3; // 线宽
        
        for (let i = 0; i < 16; i++) {
            const angle = Math.PI * 2 * i / 16; // 角度
            const innerRadius = 20; // 内部半径
            const outerRadius = 60 + Math.random() * 20; // 外部半径
            
            ctx.beginPath(); // 开始路径
            ctx.moveTo(
                75 + Math.cos(angle) * innerRadius, 
                75 + Math.sin(angle) * innerRadius
            ); // 起点
            ctx.lineTo(
                75 + Math.cos(angle) * outerRadius, 
                75 + Math.sin(angle) * outerRadius
            ); // 终点
            ctx.stroke(); // 描边
        }
    });
    
    // 特殊武器箱纹理 - 科技感设计
    textures.weapon = createOffscreenTexture(30, 30, (ctx) => {
        // 基础外壳 - 深色金属质感
        ctx.fillStyle = '#1a1a2e'; // 深蓝色金属底色
        ctx.fillRect(0, 0, 30, 30); // 填充矩形
        
        // 金属边框 - 带有发光效果
        ctx.strokeStyle = '#4d9be6'; // 蓝色
        ctx.lineWidth = 2; // 线宽
        ctx.strokeRect(2, 2, 26, 26); // 描边矩形
        
        // 内层金属面板
        ctx.fillStyle = '#20315a'; // 深蓝色金属
        ctx.fillRect(4, 4, 22, 22); // 填充矩形
        
        // 数字显示屏
        ctx.fillStyle = '#061836'; // 深蓝色屏幕
        ctx.fillRect(7, 7, 16, 7); // 填充矩形
        
        // 数字显示
        ctx.fillStyle = '#00eeff'; // 青色发光文字
        ctx.font = 'bold 6px Arial'; // 字体
        ctx.textAlign = 'center'; // 居中对齐
        ctx.fillText('UPG+', 15, 12.5); // 绘制文本
        
        // 扫描线效果
        ctx.fillStyle = 'rgba(0, 238, 255, 0.3)'; // 半透明青色
        for(let i = 7; i < 14; i += 2) {
            ctx.fillRect(7, i, 16, 0.5); // 细线条
        }
        
        // 控制面板
        ctx.fillStyle = '#152642'; // 深蓝色控制面板
        ctx.fillRect(7, 16, 16, 7); // 填充矩形
        
        // 发光按钮
        ctx.fillStyle = '#ff3300'; // 红色
        ctx.beginPath(); // 开始路径
        ctx.arc(11, 19.5, 1.5, 0, Math.PI * 2); // 左按钮
        ctx.fill(); // 填充
        
        ctx.fillStyle = '#22ff00'; // 绿色
        ctx.beginPath();
        ctx.arc(15, 19.5, 1.5, 0, Math.PI * 2); // 中按钮
        ctx.fill(); // 填充
        
        ctx.fillStyle = '#ff00cc'; // 粉色
        ctx.beginPath(); // 开始路径
        ctx.arc(19, 19.5, 1.5, 0, Math.PI * 2); // 右按钮
        ctx.fill(); // 填充
        
        // 按钮发光效果
        ctx.beginPath();
        ctx.arc(11, 19.5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 51, 0, 0.2)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(15, 19.5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 255, 0, 0.2)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(19, 19.5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 204, 0.2)';
        ctx.fill();
        
        // 数据线/电路图案
        ctx.strokeStyle = '#00ccff'; // 亮蓝色
        ctx.lineWidth = 0.5; // 细线
        
        // 左侧数据线
        ctx.beginPath();
        ctx.moveTo(4, 10);
        ctx.lineTo(7, 10);
        ctx.stroke();
        
        // 右侧数据线
        ctx.beginPath();
        ctx.moveTo(23, 10);
        ctx.lineTo(26, 10);
        ctx.stroke();
        
        // 底部数据线
        ctx.beginPath();
        ctx.moveTo(10, 23);
        ctx.lineTo(10, 26);
        ctx.moveTo(15, 23);
        ctx.lineTo(15, 26);
        ctx.moveTo(20, 23);
        ctx.lineTo(20, 26);
        ctx.stroke();
        
        // 顶部悬浮全息投影效果
        ctx.beginPath();
        ctx.arc(15, 4, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fill();
        
        // 全息投影光线
        ctx.beginPath();
        ctx.moveTo(15, 4);
        ctx.lineTo(18, 1);
        ctx.moveTo(15, 4);
        ctx.lineTo(12, 1);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.stroke();
        
        // 渐变光效
        const glow = ctx.createRadialGradient(15, 15, 5, 15, 15, 20);
        glow.addColorStop(0, 'rgba(0, 150, 255, 0)'); 
        glow.addColorStop(0.5, 'rgba(0, 200, 255, 0.05)');
        glow.addColorStop(1, 'rgba(0, 100, 255, 0)'); 
        
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 30, 30);
        
        // 高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(26, 4);
        ctx.lineTo(4, 26);
        ctx.closePath();
        ctx.fill();
    });
    
    // 生命道具纹理
    textures.health = createOffscreenTexture(20, 20, (ctx) => {
        // 生命药包主体
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.fillRect(0, 0, 20, 20); // 填充矩形
        
        // 红十字
        ctx.fillStyle = '#ff0000'; // 红色
        ctx.fillRect(2, 8, 16, 4); // 水平线
        ctx.fillRect(8, 2, 4, 16); // 垂直线
        
        // 边框
        ctx.strokeStyle = '#880000'; // 深红色
        ctx.lineWidth = 2; // 线宽
        ctx.strokeRect(1, 1, 18, 18); // 描边矩形
    });
    
    // 护盾道具纹理
    textures.shield = createOffscreenTexture(20, 20, (ctx) => {
        // 盾牌形状背景
        ctx.fillStyle = '#0044aa'; // 深蓝色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(10, 1); // 顶部中点
        ctx.lineTo(19, 5); // 右上
        ctx.lineTo(19, 15); // 右下
        ctx.lineTo(10, 19); // 底部中点
        ctx.lineTo(1, 15); // 左下
        ctx.lineTo(1, 5); // 左上
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 盾牌边缘 - 发光效果
        ctx.strokeStyle = '#00a2ff'; // 亮蓝色
        ctx.lineWidth = 1.5; // 线宽
        ctx.stroke(); // 描边
        
        // 盾牌内层
        ctx.fillStyle = '#002266'; // 更深的蓝色
        ctx.beginPath(); // 开始路径
        ctx.moveTo(10, 3); // 顶部中点
        ctx.lineTo(17, 6); // 右上
        ctx.lineTo(17, 14); // 右下
        ctx.lineTo(10, 17); // 底部中点
        ctx.lineTo(3, 14); // 左下
        ctx.lineTo(3, 6); // 左上
        ctx.closePath(); // 闭合路径
        ctx.fill(); // 填充
        
        // 六边形能量结构
        ctx.strokeStyle = '#39c2ff'; // 明亮的蓝色
        ctx.lineWidth = 0.8; // 线宽
        ctx.beginPath(); // 开始路径
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI * 2 * i / 6;
            const x = 10 + Math.cos(angle) * 6;
            const y = 10 + Math.sin(angle) * 6;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath(); // 闭合路径
        ctx.stroke(); // 描边
        
        // 能量点
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI * 2 * i / 6;
            const x = 10 + Math.cos(angle) * 6;
            const y = 10 + Math.sin(angle) * 6;
            
            ctx.fillStyle = '#80e5ff'; // 淡蓝色
            ctx.beginPath(); // 开始路径
            ctx.arc(x, y, 1, 0, Math.PI * 2); // 绘制圆形
            ctx.fill(); // 填充
        }
        
        // 盾牌中心点 - 核心能量
        ctx.fillStyle = '#ffffff'; // 白色
        ctx.beginPath(); // 开始路径
        ctx.arc(10, 10, 2.5, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // 脉动能量场
        const gradient = ctx.createRadialGradient(10, 10, 2.5, 10, 10, 10);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // 近乎不透明的白色
        gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.6)'); // 半透明的亮蓝色
        gradient.addColorStop(0.7, 'rgba(0, 130, 255, 0.3)'); // 更透明的蓝色
        gradient.addColorStop(1, 'rgba(0, 80, 255, 0)'); // 完全透明
        
        ctx.fillStyle = gradient; // 使用渐变
        ctx.beginPath(); // 开始路径
        ctx.arc(10, 10, 10, 0, Math.PI * 2); // 绘制圆形
        ctx.fill(); // 填充
        
        // 增加发光线
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)'; // 淡蓝色半透明
        ctx.lineWidth = 0.5; // 线宽
        ctx.beginPath(); // 开始路径
        ctx.arc(10, 10, 9, 0, Math.PI * 2); // 绘制圆形
        ctx.stroke(); // 描边
    });
    
    // 所有纹理创建完成
    updateLoadingStatus('textures', true, "所有纹理创建完成");
}

// 设置键盘输入
function setupInput() {
    // 键盘按下事件
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft': // 左方向键
                keys.left = true;
                break;
            case 'ArrowRight': // 右方向键
                keys.right = true;
                break;
            case 'ArrowUp': // 上方向键
                keys.up = true;
                break;
            case 'ArrowDown': // 下方向键
                keys.down = true;
                break;
            case ' ': // 空格键
                keys.space = true;
                break;
        }
    });
    
    // 键盘释放事件
    document.addEventListener('keyup', function(e) {
        switch(e.key) {
            case 'ArrowLeft': // 左方向键
                keys.left = false;
                break;
            case 'ArrowRight': // 右方向键
                keys.right = false;
                break;
            case 'ArrowUp': // 上方向键
                keys.up = false;
                break;
            case 'ArrowDown': // 下方向键
                keys.down = false;
                break;
            case ' ': // 空格键
                keys.space = false;
                break;
        }
    });
}

// 游戏初始化
function init() {
    updateLoadingStatus(null, null, "初始化游戏...");
    
    // 检查Phaser库是否加载
    if (window.Phaser) {
        updateLoadingStatus('phaser', true, "Phaser库已加载");
    } else {
        // 检查全局加载状态
        if (window.gameLoadingStatus) {
            if (window.gameLoadingStatus.phaserLoaded) {
                updateLoadingStatus('phaser', true, "Phaser库已加载 (通过全局状态确认)");
            } else if (window.gameLoadingStatus.error) {
                updateLoadingStatus('phaser', false, "Phaser库加载失败: " + window.gameLoadingStatus.error);
                
                // 显示调试按钮和日志
                const forceButton = document.getElementById('force-continue');
                if (forceButton) {
                    forceButton.style.display = 'block';
                }
                
                const logElement = document.getElementById('loading-log');
                if (logElement) {
                    logElement.style.display = 'block';
                }
                
                // 我们仍然可以尝试继续
                updateLoadingStatus(null, null, "尝试在没有Phaser库的情况下继续...");
            } else {
                updateLoadingStatus(null, null, "Phaser库状态未知，尝试继续...");
            }
        } else {
            updateLoadingStatus(null, null, "警告: Phaser库未加载，尝试继续...");
        }
    }
    
    // 检测是否为移动设备
    updateLoadingStatus(null, null, "检测设备类型...");
    checkDeviceType();
    
    // 创建画布
    updateLoadingStatus(null, null, "创建游戏画布...");
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
    updateLoadingStatus(null, null, "创建玩家角色...");
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
    updateLoadingStatus(null, null, "设置输入控制...");
    setupInput();
    
    // 设置移动设备触摸控制
    if (isMobile) {
        updateLoadingStatus(null, null, "设置触摸控制...");
        setupTouchControls();
        
        // 更新控制提示文本
        const controlsHint = document.querySelector('.controls-hint');
        if (controlsHint) {
            controlsHint.textContent = '使用虚拟摇杆移动飞机，自动射击';
            controlsHint.style.display = 'none'; // 隐藏键盘提示
        }
        
        // 显示移动提示
        const mobileHint = document.querySelector('.mobile-hint');
        if (mobileHint) {
            mobileHint.style.display = 'block';
        }
        
        // 显示移动控制器
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'block';
        }
        
        // 阻止页面滑动
        preventPageScroll();
    } else {
        // 桌面设备
        // 隐藏移动提示
        const mobileHint = document.querySelector('.mobile-hint');
        if (mobileHint) {
            mobileHint.style.display = 'none';
        }
        
        // 显示键盘提示
        const controlsHint = document.querySelector('.controls-hint');
        if (controlsHint) {
            controlsHint.style.display = 'block';
        }
        
        // 隐藏移动控制器
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }
    
    // 适配游戏尺寸
    updateLoadingStatus(null, null, "调整游戏尺寸...");
    resizeGame();
    
    // 添加窗口大小改变事件监听
    window.addEventListener('resize', resizeGame);
    
    // 标记初始化完成
    updateLoadingStatus('initialized', true, "游戏初始化完成");
    
    // 开始第一关
    updateLoadingStatus(null, null, "开始游戏...");
    startLevel(currentLevel);
    
    // 使用requestAnimationFrame启动游戏循环
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 阻止页面滑动
function preventPageScroll() {
    // 阻止整个页面的默认滑动行为
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // 阻止游戏容器的默认滑动行为
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    }
    
    // 阻止画布的默认滑动行为
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // 阻止控制区域的默认滑动行为
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    }
}

// 检测设备类型
function checkDeviceType() {
    // 检查是否为移动设备
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const userAgentMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // 如果不是通过用户代理检测到的，检查触摸功能
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 如果屏幕宽度小于850，也视为移动设备
    const smallScreen = window.innerWidth <= 850;
    
    // 保存调试信息
    debugInfo.userAgentMobile = userAgentMobile;
    debugInfo.touchSupported = touchSupported;
    debugInfo.smallScreen = smallScreen;
    
    // 任何一种情况视为移动设备
    isMobile = userAgentMobile || touchSupported || smallScreen;
    debugInfo.isMobileDetected = isMobile;
    
    // 在控制台输出检测结果
    console.log("移动设备检测结果:", isMobile);
    console.log("- 用户代理检测:", userAgentMobile);
    console.log("- 触摸功能检测:", touchSupported);
    console.log("- 屏幕尺寸检测:", smallScreen, window.innerWidth);
}

// 设置触摸控制
function setupTouchControls() {
    // 获取DOM元素
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    const joystickArea = document.getElementById('joystick-area');
    const mobileControls = document.getElementById('mobile-controls');
    
    // 检查元素是否存在
    if (!joystickBase || !joystickThumb || !joystickArea || !mobileControls) {
        console.error("触摸控制元素未找到:", {
            joystickBase: !!joystickBase,
            joystickThumb: !!joystickThumb,
            joystickArea: !!joystickArea,
            mobileControls: !!mobileControls
        });
        return;
    }
    
    // 确保移动控制显示
    mobileControls.style.display = 'block';
    
    // 初始化向量
    joystickVector = { x: 0, y: 0 };
    
    // 触摸开始事件
    joystickArea.addEventListener('touchstart', function(e) {
        console.log("触摸开始事件触发");
        if (touchId !== null) {
            console.log("已有触摸进行中，忽略");
            return; // 已有触摸进行中
        }
        
        e.preventDefault();
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        
        // 在触摸位置显示摇杆
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // 更新调试信息
        debugInfo.lastTouchPos = {x: touchX, y: touchY};
        console.log("触摸位置:", touchX, touchY);
        
        // 显示并定位摇杆基座到触摸位置
        joystickBase.style.display = 'flex';
        joystickBase.style.left = (touchX - joystickBase.clientWidth / 2) + 'px';
        joystickBase.style.top = (touchY - joystickBase.clientHeight / 2) + 'px';
        
        // 显示并定位摇杆手柄到基座中心
        joystickThumb.style.display = 'block';
        joystickThumb.style.left = (touchX - joystickThumb.clientWidth / 2) + 'px';
        joystickThumb.style.top = (touchY - joystickThumb.clientHeight / 2) + 'px';
        
        // 更新摇杆位置变量
        joystickPosition = { x: touchX, y: touchY };
        joystickThumbPosition = { x: touchX, y: touchY };
        
        isJoystickActive = true;
        debugInfo.joystickActive = true;
    });
    
    // 触摸移动事件
    window.addEventListener('touchmove', function(e) {
        if (!isJoystickActive) {
            return;
        }
        
        e.preventDefault();
        
        // 查找对应ID的触摸点
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === touchId) {
                console.log("触摸移动:", touch.clientX, touch.clientY);
                updateJoystickPosition(touch.clientX, touch.clientY);
                break;
            }
        }
    }, { passive: false });
    
    // 触摸结束事件
    window.addEventListener('touchend', function(e) {
        // 查找对应ID的触摸点
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === touchId) {
                console.log("触摸结束");
                resetJoystick();
                touchId = null;
                debugInfo.joystickActive = false;
                break;
            }
        }
    });
    
    // 触摸取消事件
    window.addEventListener('touchcancel', function(e) {
        // 查找对应ID的触摸点
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === touchId) {
                console.log("触摸取消");
                resetJoystick();
                touchId = null;
                debugInfo.joystickActive = false;
                break;
            }
        }
    });
    
    console.log("触摸控制初始化完成");
}

// 更新摇杆位置
function updateJoystickPosition(touchX, touchY) {
    // 获取元素
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    
    if (!joystickBase || !joystickThumb) {
        console.error("无法找到摇杆元素");
        return;
    }
    
    // 获取基座位置和尺寸
    const baseRect = joystickBase.getBoundingClientRect();
    const baseX = baseRect.left + baseRect.width / 2;
    const baseY = baseRect.top + baseRect.height / 2;
    
    // 计算触摸点和基座中心的距离
    const deltaX = touchX - baseX;
    const deltaY = touchY - baseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 计算摇杆的最大移动半径（基座半径的70%）
    const maxRadius = baseRect.width * 0.35;
    
    // 限制摇杆移动范围
    let limitedX, limitedY;
    if (distance > maxRadius) {
        // 超出最大半径，沿着同一方向缩放到最大半径
        const ratio = maxRadius / distance;
        limitedX = baseX + deltaX * ratio;
        limitedY = baseY + deltaY * ratio;
    } else {
        // 在最大半径内，使用实际触摸位置
        limitedX = touchX;
        limitedY = touchY;
    }
    
    // 更新摇杆手柄位置
    joystickThumb.style.left = (limitedX - joystickThumb.clientWidth / 2) + 'px';
    joystickThumb.style.top = (limitedY - joystickThumb.clientHeight / 2) + 'px';
    
    // 更新摇杆向量（归一化，用于控制移动）
    // 将移动范围从-maxRadius~maxRadius归一化到-1~1
    joystickVector.x = (limitedX - baseX) / maxRadius;
    joystickVector.y = (limitedY - baseY) / maxRadius;
    
    // 存储当前位置，用于后续计算
    joystickThumbPosition = { x: limitedX, y: limitedY };
    
    // 更新调试信息
    debugInfo.lastJoystickVector = {x: joystickVector.x, y: joystickVector.y};
}

// 重置摇杆位置
function resetJoystick() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    
    if (!joystickBase || !joystickThumb) return;
    
    // 隐藏摇杆组件
    joystickBase.style.display = 'none';
    joystickThumb.style.display = 'none';
    
    // 重置摇杆向量
    joystickVector = { x: 0, y: 0 };
    isJoystickActive = false;
}

// 调整游戏尺寸
function resizeGame() {
    const container = document.getElementById('game-container');
    if (!container) return;
    
    // 获取容器尺寸
    const containerWidth = container.clientWidth;
    const containerHeight = containerWidth; // 保持1:1比例
    
    // 计算缩放比例
    const scaleX = containerWidth / GAME_WIDTH;
    const scaleY = containerHeight / GAME_HEIGHT;
    
    // 应用缩放
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
    
    // 重新检测是否为移动设备
    const wasMobile = isMobile;
    checkDeviceType();
    
    // 如果移动设备状态发生变化，更新控制方式
    if (isMobile !== wasMobile) {
        // 如果变成了移动设备
        if (isMobile) {
            setupTouchControls();
            // 更新控制提示文本
            const controlsHint = document.querySelector('.controls-hint');
            if (controlsHint) {
                controlsHint.textContent = '使用虚拟摇杆移动飞机，自动射击';
            }
            
            // 显示移动控制器
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'block';
            }
            
            // 显示移动提示
            const mobileHint = document.querySelector('.mobile-hint');
            if (mobileHint) {
                mobileHint.style.display = 'block';
            }
            
            // 隐藏电脑提示
            const desktopHint = document.querySelector('.controls-hint');
            if (desktopHint) {
                desktopHint.style.display = 'none';
            }
            
            // 阻止页面滑动
            preventPageScroll();
        } else {
            // 变成了桌面设备
            // 隐藏移动控制器
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'none';
            }
            
            // 隐藏移动提示
            const mobileHint = document.querySelector('.mobile-hint');
            if (mobileHint) {
                mobileHint.style.display = 'none';
            }
            
            // 显示电脑提示
            const desktopHint = document.querySelector('.controls-hint');
            if (desktopHint) {
                desktopHint.style.display = 'block';
                desktopHint.textContent = '电脑端：使用方向键移动飞机，自动射击';
            }
            
            // 重置摇杆状态
            resetJoystick();
            touchId = null;
        }
    }
    
    // 为低端设备优化图形设置
    if (isMobile) {
        // 检测性能
        optimizeForMobile();
    }
}

// 为移动设备优化性能
function optimizeForMobile() {
    // 检测设备性能
    const devicePerformance = detectPerformance();
    
    // 根据性能优化设置
    if (devicePerformance === 'low') {
        // 低性能设备
        mobileSetting.particleCount = 0.3; // 减少粒子数量
        mobileSetting.lowGraphics = true; // 启用低画质模式
        mobileSetting.fps = 30; // 降低帧率
    } else if (devicePerformance === 'medium') {
        // 中等性能设备
        mobileSetting.particleCount = 0.5; // 中等粒子数量
        mobileSetting.lowGraphics = false; // 正常画质
        mobileSetting.fps = 45; // 中等帧率
    } else {
        // 高性能设备
        mobileSetting.particleCount = 0.8; // 接近PC的粒子数量
        mobileSetting.lowGraphics = false; // 正常画质
        mobileSetting.fps = 60; // 高帧率
    }
}

// 检测设备性能
function detectPerformance() {
    // 基于屏幕尺寸和像素密度的初步判断
    const pixelRatio = window.devicePixelRatio || 1;
    const screenWidth = window.screen.width * pixelRatio;
    const screenHeight = window.screen.height * pixelRatio;
    
    // 计算设备像素总数
    const totalPixels = screenWidth * screenHeight;
    
    // 基于内存情况的判断（如果可用）
    const deviceMemory = navigator.deviceMemory || 4; // 默认假设4GB
    
    // 综合评分
    let performanceScore = 0;
    
    // 基于屏幕分辨率加分
    if (totalPixels < 1000000) performanceScore += 1; // 低分辨率
    else if (totalPixels < 2000000) performanceScore += 2; // 中等分辨率
    else performanceScore += 3; // 高分辨率
    
    // 基于内存加分
    if (deviceMemory <= 2) performanceScore += 1; // 低内存
    else if (deviceMemory <= 4) performanceScore += 2; // 中等内存
    else performanceScore += 3; // 高内存
    
    // 根据综合评分判断性能级别
    if (performanceScore <= 3) return 'low'; // 低性能设备
    else if (performanceScore <= 4) return 'medium'; // 中等性能设备
    else return 'high'; // 高性能设备
}

// 游戏主循环
function gameLoop(timestamp) {
    // 如果是第一帧或者没有timestamp，设置lastFrameTime为当前时间
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }
    
    // 计算帧间隔时间
    const deltaTime = timestamp - lastFrameTime;
    
    // 根据设定的FPS计算是否需要跳过这一帧
    const targetFrameInterval = 1000 / mobileSetting.fps;
    
    // 如果帧间隔时间小于目标帧间隔，跳过这一帧
    if (deltaTime < targetFrameInterval && isMobile) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }
    
    // 更新上一帧时间
    lastFrameTime = timestamp;
    
    const now = Date.now(); // 当前时间
    levelTimer++; // 关卡计时器递增
    
    // 更新逻辑
    if (!gameOver && !gameWin) {
        // 更新玩家
        if (isMobile && isJoystickActive) {
            // 使用虚拟摇杆控制
            updatePlayerWithJoystick();
        } else {
            // 使用键盘控制
            updatePlayer(keys);
        }
        
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
    
    // 添加调试信息渲染
    if (isMobile) {
        renderDebugInfo();
    }
    
    // 继续请求下一帧
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 渲染调试信息
function renderDebugInfo() {
    if (!ctx) return;
    
    // 设置调试面板样式
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 100, 230, 140);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // 显示调试信息
    ctx.fillText(`移动设备: ${debugInfo.isMobileDetected}`, 20, 120);
    ctx.fillText(`用户代理: ${debugInfo.userAgentMobile}`, 20, 140);
    ctx.fillText(`触摸支持: ${debugInfo.touchSupported}`, 20, 160);
    ctx.fillText(`屏幕尺寸: ${window.innerWidth}x${window.innerHeight}`, 20, 180);
    ctx.fillText(`摇杆激活: ${debugInfo.joystickActive}`, 20, 200);
    ctx.fillText(`摇杆向量: x:${debugInfo.lastJoystickVector.x.toFixed(2)}, y:${debugInfo.lastJoystickVector.y.toFixed(2)}`, 20, 220);
}

// 使用摇杆更新玩家位置
function updatePlayerWithJoystick() {
    // 计算移动距离
    const dx = joystickVector.x * player.speed;
    const dy = joystickVector.y * player.speed;
    
    console.log("摇杆更新:", dx, dy);
    
    // 更新玩家位置
    let newX = player.x + dx;
    let newY = player.y + dy;
    
    // 确保玩家不会超出边界
    newX = Math.max(0, Math.min(newX, GAME_WIDTH - player.width));
    newY = Math.max(0, Math.min(newY, GAME_HEIGHT - player.height));
    
    // 应用新位置
    player.x = newX;
    player.y = newY;
    
    // 更新无敌状态
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
            player.shieldActive = false; // 重置护盾状态
        }
    }
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
                health: 1000, // 生命值
                maxHealth: 1000, // 最大生命值
                damage: 1, // 伤害值
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
                health: 3000, // 生命值
                maxHealth: 3000, // 最大生命值
                damage: 2, // 伤害值
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
                health: 10000, // 生命值
                maxHealth: 10000, // 最大生命值
                damage: 2, // 伤害值
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
        
        // 增加爆炸效果帧计数
        explosion.frame++;
        
        // 检查是否完成爆炸动画
        if (explosion.frame >= explosion.maxFrames) {
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
                    player.invincibleTimer = 600; // 10秒无敌（60帧/秒）
                    player.shieldActive = true; // 激活护盾特效
                    player.shieldRadius = player.width / 2 + 10; // 初始护盾半径
                    player.shieldPulse = 0; // 护盾脉动计时器
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
        player.shieldActive = false; // 取消护盾效果
    }
}

// 创建爆炸效果
function createExplosion(x, y, size = 'medium') {
    // 获取爆炸尺寸
    let width, height;
    
    if (size === 'large') {
        width = height = 150;
    } else if (size === 'medium') {
        width = height = 80;
    } else { // small
        width = height = 40;
    }
    
    // 如果是移动设备并且开启了低画质模式，则减小爆炸效果
    if (isMobile && mobileSetting.lowGraphics) {
        width = height = width * 0.7; // 减小70%
    }
    
    // 设置爆炸效果数量
    const maxFrames = isMobile ? 10 : 20; // 移动设备减少帧数
    
    explosions.push({
        x: x - width / 2, // 居中X坐标
        y: y - height / 2, // 居中Y坐标
        width: width, // 宽度
        height: height, // 高度
        frame: 0, // 当前帧
        maxFrames: maxFrames, // 最大帧数
        size: size // 爆炸大小
    });
    
    // 如果是移动设备，根据性能设置减少爆炸粒子数量
    if (isMobile && size !== 'small') {
        // 跳过创建额外的小爆炸效果
        if (mobileSetting.particleCount < 0.5) {
            return;
        }
        
        // 减少小爆炸的数量
        const particleCount = Math.floor(5 * mobileSetting.particleCount);
        
        // 添加额外的小爆炸
        for (let i = 0; i < particleCount; i++) {
            const offsetX = (Math.random() - 0.5) * width;
            const offsetY = (Math.random() - 0.5) * height;
            
            setTimeout(() => {
                explosions.push({
                    x: x + offsetX - 20, // 小爆炸X坐标
                    y: y + offsetY - 20, // 小爆炸Y坐标
                    width: 40, // 小爆炸宽度
                    height: 40, // 小爆炸高度
                    frame: 0, // 当前帧
                    maxFrames: Math.floor(maxFrames * 0.8), // 更短的动画
                    size: 'small' // 小爆炸
                });
            }, Math.random() * 200); // 随机延迟
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
            // 判断是否是护盾道具激活的无敌
            if (player.shieldActive) {
                // 更新护盾脉动效果
                player.shieldPulse = (player.shieldPulse + 0.05) % (Math.PI * 2);
                const pulseValue = Math.sin(player.shieldPulse) * 3;
                
                // 绘制外部能量场
                const outerRadius = player.shieldRadius + pulseValue;
                const gradient = ctx.createRadialGradient(
                    player.x + player.width / 2, 
                    player.y + player.height / 2,
                    player.width / 2,
                    player.x + player.width / 2, 
                    player.y + player.height / 2,
                    outerRadius
                );
                
                gradient.addColorStop(0, 'rgba(50, 150, 255, 0.1)');
                gradient.addColorStop(0.7, 'rgba(80, 180, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    outerRadius,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // 绘制护盾边缘
                ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(player.shieldPulse) * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    outerRadius - 2,
                    0, Math.PI * 2
                );
                ctx.stroke();
                
                // 绘制护盾六边形结构
                ctx.strokeStyle = `rgba(150, 220, 255, ${0.3 + Math.sin(player.shieldPulse + 1) * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                
                // 绘制六边形
                const hexRadius = outerRadius - 5;
                const centerX = player.x + player.width / 2;
                const centerY = player.y + player.height / 2;
                
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 3 * i;
                    const x = centerX + Math.cos(angle) * hexRadius;
                    const y = centerY + Math.sin(angle) * hexRadius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.closePath();
                ctx.stroke();
                
                // 绘制能量点
                ctx.fillStyle = 'rgba(200, 240, 255, 0.8)';
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 3 * i;
                    const x = centerX + Math.cos(angle) * hexRadius;
                    const y = centerY + Math.sin(angle) * hexRadius;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // 如果护盾即将消失，添加闪烁警告
                if (player.invincibleTimer < 120) { // 最后2秒闪烁
                    const warningOpacity = Math.sin(Date.now() / 100) * 0.5 + 0.5;
                    ctx.strokeStyle = `rgba(255, 50, 50, ${warningOpacity})`;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(
                        player.x + player.width / 2,
                        player.y + player.height / 2,
                        outerRadius + 2,
                        0, Math.PI * 2
                    );
                    ctx.stroke();
                }
            } else {
                // 普通无敌效果（受伤后短暂无敌）
                ctx.strokeStyle = '#0099ff'; // 蓝色
                ctx.lineWidth = 2; // 线宽
                ctx.beginPath(); // 开始路径
                ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 
                        player.width / 2 + 5, 0, Math.PI * 2); // 圆形护盾
                ctx.stroke(); // 描边
            }
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
            // 如果是护盾，添加蓝色光晕和能量效果
            else if (powerup.type === 'shield') {
                // 时间变量
                const time = Date.now() / 1000;
                
                // 垂直浮动效果
                const floatOffset = Math.sin(time * 3) * 3;
                
                // 绘制蓝色能量场
                const pulseIntensity = Math.sin(time * 2) * 0.2 + 0.5; // 0.3-0.7之间呼吸
                
                // 创建蓝色光环
                const gradient = ctx.createRadialGradient(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2 + floatOffset, 
                    powerup.width / 4,
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2 + floatOffset, 
                    powerup.width * 1.2
                );
                gradient.addColorStop(0, `rgba(50, 150, 255, ${pulseIntensity})`); // 蓝色
                gradient.addColorStop(0.7, `rgba(100, 200, 255, ${pulseIntensity * 0.7})`); // 淡蓝色
                gradient.addColorStop(1, 'rgba(150, 220, 255, 0)');   // 透明
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    powerup.x + powerup.width / 2, 
                    powerup.y + powerup.height / 2 + floatOffset, 
                    powerup.width * 1.2, 
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // 绘制能量线
                ctx.strokeStyle = `rgba(100, 200, 255, ${pulseIntensity * 0.8})`;
                ctx.lineWidth = 1;
                
                // 绘制六边形能量线
                ctx.beginPath();
                const hexRadius = powerup.width * 0.8;
                const centerX = powerup.x + powerup.width / 2;
                const centerY = powerup.y + powerup.height / 2 + floatOffset;
                
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 3 * i + time; // 旋转效果
                    const x = centerX + Math.cos(angle) * hexRadius;
                    const y = centerY + Math.sin(angle) * hexRadius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.closePath();
                ctx.stroke();
                
                // 修正Shield道具的绘制位置，考虑浮动效果
                ctx.drawImage(texture, powerup.x, powerup.y + floatOffset);
                continue; // 已经绘制过道具，跳过默认绘制
            }
            
            // 绘制道具贴图
            ctx.drawImage(texture, powerup.x, powerup.y); // 绘制道具
            
            // 为武器箱添加科技感浮动数据线效果
            if (powerup.type === 'weapon') {
                // 添加数据线动画
                const time = Date.now() / 1000;
                const lineCount = 3; // 数据线数量
                
                ctx.strokeStyle = '#00ffff'; // 青色数据线
                ctx.lineWidth = 1;
                
                for (let i = 0; i < lineCount; i++) {
                    const yOffset = (time * 5 + i * 3) % 30; // 垂直移动效果
                    
                    // 绘制水平数据线
                    ctx.beginPath();
                    ctx.moveTo(powerup.x, powerup.y + yOffset);
                    ctx.lineTo(powerup.x + powerup.width, powerup.y + yOffset);
                    ctx.globalAlpha = 0.5 - Math.abs(yOffset - 15) / 30; // 透明度随位置变化
                    ctx.stroke();
                }
                
                // 科技感扫描线
                const scanY = (time * 10) % 30;
                ctx.fillStyle = 'rgba(80, 200, 255, 0.3)';
                ctx.fillRect(powerup.x, powerup.y + scanY, powerup.width, 1);
                
                // 恢复透明度
                ctx.globalAlpha = 1;
                
                // 添加悬浮全息投影效果
                const hologramSize = Math.sin(time * 3) * 2 + 10; // 5-15之间变化
                const hologramY = powerup.y - hologramSize - 5;
                
                // 绘制武器升级图标
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                ctx.beginPath();
                // 绘制武器图标
                ctx.moveTo(powerup.x + powerup.width/2, hologramY);
                ctx.lineTo(powerup.x + powerup.width/2 + hologramSize/2, hologramY + hologramSize);
                ctx.lineTo(powerup.x + powerup.width/2 - hologramSize/2, hologramY + hologramSize);
                ctx.closePath();
                ctx.fill();
                
                // 全息投影连接线
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.setLineDash([2, 2]); // 虚线效果
                ctx.beginPath();
                ctx.moveTo(powerup.x + powerup.width/2, hologramY + hologramSize);
                ctx.lineTo(powerup.x + powerup.width/2, powerup.y);
                ctx.stroke();
                ctx.setLineDash([]); // 重置虚线
            }
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
window.onload = function() {
    // 设置初始加载状态
    loadingStatus.startTime = Date.now();
    updateLoadingStatus(null, null, "页面加载完成，准备初始化游戏...");
    
    // 绑定强制继续按钮事件
    const forceButton = document.getElementById('force-continue');
    if (forceButton) {
        forceButton.addEventListener('click', forceContinueGame);
    }
    
    // 延迟一下，让加载状态显示出来
    setTimeout(init, 500);
}; 