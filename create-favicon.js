// 引入文件系统模块
const fs = require('fs'); // 导入文件系统模块

// 读取Base64编码内容
const base64Content = fs.readFileSync('favicon-base64.txt', 'utf8'); // 读取Base64文件
const buffer = Buffer.from(base64Content, 'base64'); // 转换为Buffer

// 写入favicon.ico文件
fs.writeFileSync('favicon.ico', buffer); // 保存为favicon.ico
console.log('favicon.ico已生成'); // 输出成功信息 