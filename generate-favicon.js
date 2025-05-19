// 引入所需模块
const fs = require('fs'); // 文件系统模块
const { createCanvas } = require('canvas'); // Canvas模块

// 创建一个32x32的Canvas
const canvas = createCanvas(32, 32); // 标准favicon尺寸
const ctx = canvas.getContext('2d'); // 获取2D上下文

// 绘制背景
ctx.fillStyle = 'black'; // 黑色背景
ctx.fillRect(0, 0, 32, 32); // 填充整个画布

// 绘制飞机
ctx.fillStyle = '#00ff00'; // 绿色飞机
ctx.beginPath(); // 开始路径
ctx.moveTo(16, 5); // 三角形顶点
ctx.lineTo(6, 25); // 三角形左底点
ctx.lineTo(26, 25); // 三角形右底点
ctx.closePath(); // 闭合路径
ctx.fill(); // 填充

// 将Canvas转换为buffer
const buffer = canvas.toBuffer('image/png'); // 转换为PNG格式

// 写入到文件
fs.writeFileSync('favicon.ico', buffer); // 保存为favicon.ico
console.log('favicon.ico已生成'); // 输出成功信息 