// 游戏截图生成脚本
// 该脚本用于在特定游戏状态下创建游戏截图，主要用于README文档

// 创建Canvas元素
const canvas = document.createElement('canvas'); // 创建画布
canvas.width = 800; // 设置宽度
canvas.height = 800; // 设置高度
document.body.appendChild(canvas); // 添加到body

// 获取2D上下文
const ctx = canvas.getContext('2d'); // 获取上下文

// 绘制游戏场景的关键部分
function drawSceneForScreenshot() {
    // 绘制背景
    ctx.fillStyle = '#000000'; // 黑色背景
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充背景
    
    // 添加星星
    for (let i = 0; i < 500; i++) { // 绘制500颗星星
        const x = Math.floor(Math.random() * canvas.width); // 随机x坐标
        const y = Math.floor(Math.random() * canvas.height); // 随机y坐标
        const size = Math.floor(Math.random() * 3) + 1; // 随机星星大小
        const alpha = Math.random() * 0.7 + 0.3; // 随机透明度
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // 白色星星，随机透明度
        ctx.fillRect(x, y, size, size); // 绘制星星
    }
    
    // 绘制玩家飞机
    drawPlayerShip(canvas.width / 2 - 15, canvas.height - 100);
    
    // 绘制敌机
    drawEnemyShip(canvas.width / 2 - 30 - 60, 150);
    drawEnemyShip(canvas.width / 2 - 30 + 60, 150);
    drawEliteShip(canvas.width / 2 - 25, 80);
    
    // 绘制子弹
    drawPlayerBullets();
    drawEnemyBullets();
    
    // 绘制爆炸效果
    drawExplosion(canvas.width / 2 - 100, 200);
    
    // 绘制道具
    drawPowerup(canvas.width / 2 + 50, 300, 'weapon');
    
    // 绘制UI
    drawUI();
}

// 绘制玩家飞机
function drawPlayerShip(x, y) {
    // 机身主体
    ctx.fillStyle = '#00ffaa'; // 青绿色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 20, y); // 顶点
    ctx.lineTo(x + 5, y + 30); // 左下角
    ctx.lineTo(x + 35, y + 30); // 右下角
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 机翼
    ctx.fillStyle = '#00ccaa'; // 深青色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 5, y + 20); // 左机翼外侧
    ctx.lineTo(x, y + 28); // 左机翼尖
    ctx.lineTo(x + 15, y + 25); // 左机翼内侧
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 35, y + 20); // 右机翼外侧
    ctx.lineTo(x + 40, y + 28); // 右机翼尖
    ctx.lineTo(x + 25, y + 25); // 右机翼内侧
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 尾翼
    ctx.fillStyle = '#00aa99'; // 蓝绿色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 15, y + 30); // 左尾翼内侧
    ctx.lineTo(x + 5, y + 40); // 左尾翼尖
    ctx.lineTo(x + 17, y + 35); // 左尾翼连接点
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 25, y + 30); // 右尾翼内侧
    ctx.lineTo(x + 35, y + 40); // 右尾翼尖
    ctx.lineTo(x + 23, y + 35); // 右尾翼连接点
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 驾驶舱
    ctx.fillStyle = '#4444ff'; // 蓝色
    ctx.beginPath(); // 开始路径
    ctx.ellipse(x + 20, y + 15, 5, 8, 0, 0, Math.PI * 2); // 椭圆形驾驶舱
    ctx.fill(); // 填充
    
    // 驾驶舱高光
    ctx.fillStyle = '#aaaaff'; // 亮蓝色
    ctx.beginPath(); // 开始路径
    ctx.ellipse(x + 18, y + 13, 2, 4, 0, 0, Math.PI * 2); // 椭圆形高光
    ctx.fill(); // 填充
    
    // 引擎喷射
    ctx.fillStyle = '#ffff00'; // 黄色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 18, y + 30); // 左侧
    ctx.lineTo(x + 20, y + 38); // 中间
    ctx.lineTo(x + 22, y + 30); // 右侧
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
}

// 绘制敌人飞机
function drawEnemyShip(x, y) {
    // 机身
    ctx.fillStyle = '#ff3333'; // 红色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 20, y + 40); // 底部中点
    ctx.lineTo(x, y + 10); // 左上角
    ctx.lineTo(x + 40, y + 10); // 右上角
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 机首
    ctx.fillStyle = '#990000'; // 深红色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 15, y + 10); // 左边
    ctx.lineTo(x + 20, y); // 顶部
    ctx.lineTo(x + 25, y + 10); // 右边
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 机翼
    ctx.fillStyle = '#cc0000'; // 中红色
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x, y + 10); // 左上角
    ctx.lineTo(x, y + 25); // 左下角
    ctx.lineTo(x + 15, y + 20); // 左机身连接点
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 40, y + 10); // 右上角
    ctx.lineTo(x + 40, y + 25); // 右下角
    ctx.lineTo(x + 25, y + 20); // 右机身连接点
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
}

// 绘制精英敌机
function drawEliteShip(x, y) {
    // 核心机身
    ctx.fillStyle = '#cc00cc'; // 紫色
    ctx.beginPath(); // 开始路径
    ctx.ellipse(x + 25, y + 25, 15, 20, 0, 0, Math.PI * 2); // 椭圆形机身
    ctx.fill(); // 填充
    
    // 前部尖锥
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 15, y + 10); // 左上
    ctx.lineTo(x + 25, y); // 顶部
    ctx.lineTo(x + 35, y + 10); // 右上
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 四个机翼
    ctx.fillStyle = '#aa00aa'; // 深紫色
    
    // 前上机翼
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 10, y + 15); // 内侧
    ctx.lineTo(x, y + 5); // 尖端
    ctx.lineTo(x + 15, y + 20); // 连接点
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 前下机翼
    ctx.beginPath(); // 开始路径
    ctx.moveTo(x + 40, y + 15); // 内侧
    ctx.lineTo(x + 50, y + 5); // 尖端
    ctx.lineTo(x + 35, y + 20); // 连接点
    ctx.closePath(); // 闭合路径
    ctx.fill(); // 填充
    
    // 武器系统
    ctx.fillStyle = '#ff00ff'; // 亮紫色
    ctx.beginPath(); // 开始路径
    ctx.arc(x + 25, y + 25, 8, 0, Math.PI * 2); // 中央武器核心
    ctx.fill(); // 填充
}

// 绘制玩家子弹
function drawPlayerBullets() {
    // 绘制多排子弹
    ctx.fillStyle = '#ffffff'; // 白色
    
    // 左侧子弹
    ctx.fillRect(canvas.width / 2 - 20, canvas.height - 150, 6, 15);
    ctx.fillRect(canvas.width / 2 - 20, canvas.height - 200, 6, 15);
    ctx.fillRect(canvas.width / 2 - 20, canvas.height - 250, 6, 15);
    
    // 中间子弹
    ctx.fillStyle = '#ffff00'; // 黄色
    ctx.fillRect(canvas.width / 2 - 3, canvas.height - 120, 6, 15);
    ctx.fillRect(canvas.width / 2 - 3, canvas.height - 170, 6, 15);
    ctx.fillRect(canvas.width / 2 - 3, canvas.height - 220, 6, 15);
    ctx.fillRect(canvas.width / 2 - 3, canvas.height - 270, 6, 15);
    
    // 右侧子弹
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.fillRect(canvas.width / 2 + 14, canvas.height - 150, 6, 15);
    ctx.fillRect(canvas.width / 2 + 14, canvas.height - 200, 6, 15);
    ctx.fillRect(canvas.width / 2 + 14, canvas.height - 250, 6, 15);
}

// 绘制敌人子弹
function drawEnemyBullets() {
    ctx.fillStyle = '#ff0000'; // 红色
    
    // 左侧敌人子弹
    ctx.fillRect(canvas.width / 2 - 30 - 60, 200, 4, 10);
    ctx.fillRect(canvas.width / 2 - 30 - 60, 230, 4, 10);
    
    // 右侧敌人子弹
    ctx.fillRect(canvas.width / 2 - 30 + 60, 200, 4, 10);
    ctx.fillRect(canvas.width / 2 - 30 + 60, 230, 4, 10);
    
    // 中央敌人子弹
    // 扇形弹幕
    for (let i = -2; i <= 2; i++) {
        const x = canvas.width / 2 - 25 + 25 + i * 10;
        const y = 140;
        ctx.fillRect(x, y, 4, 10);
    }
}

// 绘制爆炸效果
function drawExplosion(x, y) {
    // 创建渐变
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ffff00');
    gradient.addColorStop(0.6, '#ff6600');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    // 绘制爆炸
    ctx.fillStyle = gradient; // 渐变
    ctx.beginPath(); // 开始路径
    ctx.arc(x, y, 25, 0, Math.PI * 2); // 圆形爆炸
    ctx.fill(); // 填充
}

// 绘制道具
function drawPowerup(x, y, type) {
    if (type === 'weapon') {
        // 华贵宝箱
        // 绘制光环效果
        const gradient = ctx.createRadialGradient(x + 15, y + 15, 0, x + 15, y + 15, 25);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.7)'); // 金色
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');   // 透明
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + 15, y + 15, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 宝箱底座 - 金色
        ctx.fillStyle = '#d4af37'; // 金色
        ctx.fillRect(x + 6, y + 15, 18, 11); // 宝箱主体
        
        // 宝箱盖 - 金色弧形
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 15);
        ctx.lineTo(x + 6, y + 12);
        ctx.quadraticCurveTo(x + 15, y + 6, x + 24, y + 12);
        ctx.lineTo(x + 24, y + 15);
        ctx.closePath();
        ctx.fill();
        
        // 宝箱锁扣 - 深金色
        ctx.fillStyle = '#aa8c2c'; // 深金色
        ctx.fillRect(x + 13.5, y + 13.5, 3, 4.5);
        
        // 宝箱花纹装饰
        ctx.strokeStyle = '#ffcf40'; // 亮金色
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x + 8, y + 17, 14, 7);
    }
}

// 绘制UI
function drawUI() {
    // 绘制分数
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.font = '24px Arial'; // 字体
    ctx.textAlign = 'left'; // 左对齐
    ctx.fillText(`分数: 3500`, 10, 30); // 绘制分数
    
    // 绘制生命值
    ctx.fillText(`生命: `, 10, 60); // 绘制生命标签
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#ff0000'; // 红色
        ctx.fillRect(80 + i * 25, 45, 20, 20); // 绘制生命图标
    }
    
    // 绘制武器等级
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.fillText(`武器: 3`, 10, 90); // 绘制武器等级
    
    // 绘制关卡信息
    ctx.textAlign = 'right'; // 右对齐
    ctx.fillText(`关卡: 2`, canvas.width - 10, 30); // 绘制关卡
    
    // BOSS提示
    ctx.fillText(`BOSS战斗中`, canvas.width - 10, 60); // 绘制BOSS提示
}

// 生成截图
function generateScreenshot() {
    drawSceneForScreenshot(); // 绘制截图场景
    
    // 添加游戏标题
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 半透明黑色
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100); // 背景条
    
    ctx.fillStyle = '#f7d100'; // 金色
    ctx.font = 'bold 48px Arial'; // 字体
    ctx.textAlign = 'center'; // 居中对齐
    ctx.fillText('雷电MAX', canvas.width / 2, canvas.height / 2); // 游戏标题
    
    ctx.font = '24px Arial'; // 字体
    ctx.fillStyle = '#ffffff'; // 白色
    ctx.fillText('HTML5射击游戏', canvas.width / 2, canvas.height / 2 + 30); // 游戏副标题
    
    // 保存图片
    saveScreenshot();
}

// 保存截图
function saveScreenshot() {
    // 转换为图片URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = imageUrl;
    link.click();
    
    // 清理
    document.body.removeChild(canvas);
}

// 执行截图生成
generateScreenshot(); 