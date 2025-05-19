// 引入http模块
const http = require('http'); // 导入HTTP模块
const fs = require('fs'); // 导入文件系统模块
const path = require('path'); // 导入路径模块

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 获取请求的URL路径
    let filePath = '.' + req.url; // 获取请求的文件路径
    if (filePath === './') {
        filePath = './index.html'; // 默认返回index.html
    }

    // 获取文件扩展名
    const extname = path.extname(filePath); // 获取文件扩展名
    let contentType = 'text/html'; // 默认内容类型

    // 根据扩展名设置正确的内容类型
    switch (extname) {
        case '.js':
            contentType = 'text/javascript'; // JavaScript文件
            break;
        case '.css':
            contentType = 'text/css'; // CSS文件
            break;
        case '.json':
            contentType = 'application/json'; // JSON文件
            break;
        case '.png':
            contentType = 'image/png'; // PNG图片
            break;
        case '.jpg':
            contentType = 'image/jpeg'; // JPG图片
            break;
    }

    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404); // 404状态码
                res.end('文件未找到'); // 返回错误信息
            } else {
                // 服务器错误
                res.writeHead(500); // 500状态码
                res.end('服务器错误: ' + error.code); // 返回错误信息
            }
        } else {
            // 成功读取文件
            res.writeHead(200, { 'Content-Type': contentType }); // 设置状态码和内容类型
            res.end(content, 'utf-8'); // 返回文件内容
        }
    });
});

// 设置服务器监听端口
const PORT = 3002; // 端口号
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`); // 输出服务器地址
}); 