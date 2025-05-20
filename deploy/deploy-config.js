// 雷电MAX游戏部署配置文件
// 此文件用于配置不同的部署环境和选项

module.exports = {
  // 基本配置
  baseConfig: {
    // 游戏标题
    gameTitle: "雷电MAX - 飞机射击游戏",
    // 游戏版本
    version: "1.0.0",
    // 游戏描述
    description: "一款HTML5复古射击游戏，支持PC键盘和移动设备触摸控制",
    // 作者
    author: "",
    // 授权协议
    license: "MIT"
  },
  
  // 本地开发服务器配置
  devServer: {
    // 端口号
    port: 3002,
    // 是否自动打开浏览器
    open: true,
    // 是否启用热更新
    hot: true,
    // 是否启用压缩
    compress: true
  },
  
  // 生产环境配置
  production: {
    // 输出目录
    outputDir: "../dist",
    // 是否生成source map
    sourceMap: false,
    // 是否压缩代码
    compress: true,
    // 是否启用缓存
    cache: true,
    // 缓存时间（秒）
    cacheTime: 86400
  },
  
  // GitHub Pages部署配置
  githubPages: {
    // 部署分支
    branch: "gh-pages",
    // 自定义域名
    customDomain: "",
    // 提交信息
    commitMessage: "自动部署: 雷电MAX游戏更新 [timestamp]",
    // 是否强制推送
    force: false
  },
  
  // 服务器部署配置
  server: {
    // 服务器类型: 'apache', 'nginx', 'node'
    type: "node",
    // 服务器路径
    path: "/var/www/html/RaidenMax",
    // 部署方式: 'ftp', 'sftp', 'rsync', 'direct'
    method: "direct",
    // 部署命令
    command: "cp -r * [TARGET_DIR]"
  },
  
  // 需要部署的文件列表
  files: [
    "index.html",
    "style.css",
    "game.js",
    "favicon.ico",
    "assets/**/*"
  ],
  
  // 其他配置
  other: {
    // 是否为生产环境移除控制台日志
    removeConsoleLog: true,
    // 是否启用自动刷新
    autoRefresh: false,
    // 是否启用性能分析
    performanceAnalysis: false
  }
}; 