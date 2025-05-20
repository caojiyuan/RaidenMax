# 雷电MAX 部署工具

这个目录包含了雷电MAX游戏的部署相关工具和配置文件。

## 部署工具说明

本目录下包含以下部署文件:

- `deploy.sh` - Shell脚本，用于将游戏部署到本地或远程服务器
- `deploy-github.js` - Node.js脚本，用于部署游戏到GitHub Pages
- `deploy-config.js` - 部署配置文件，包含各种部署选项
- `package.json` - Node.js项目配置，定义了部署相关的命令

## 快速开始

### 前提条件

- 基本部署: Bash环境（Linux/Mac/Windows WSL）
- GitHub Pages部署: Node.js和npm

### 安装依赖

```bash
# 安装Node.js依赖
cd deploy
npm install
```

### 部署方式

#### 1. 本地开发环境

```bash
cd deploy
npm start
# 或者直接运行
bash deploy.sh ../dist --dev --serve
```

这将把游戏部署到`../dist`目录并启动本地服务器。

#### 2. 生产环境部署

```bash
cd deploy
npm run build
# 或者直接运行
bash deploy.sh /var/www/html/RaidenMax --prod
```

这将把游戏部署到指定目录，并进行生产环境优化。

#### 3. GitHub Pages部署

```bash
cd deploy
npm run deploy
# 或者直接运行
node deploy-github.js
```

这将把游戏部署到GitHub Pages，可通过`https://[用户名].github.io/[仓库名]/`访问。

## 部署配置

您可以在`deploy-config.js`中自定义部署选项:

```javascript
// 示例配置修改
module.exports = {
  // GitHub Pages配置
  githubPages: {
    branch: "gh-pages",                  // 部署分支
    customDomain: "game.example.com",    // 自定义域名
    commitMessage: "游戏更新: [timestamp]" // 提交信息
  },
  // 服务器配置
  server: {
    path: "/var/www/games/RaidenMax"     // 自定义部署路径
  }
  // ...其他配置
};
```

## 命令行选项

`deploy.sh`脚本支持以下选项:

- `--dev` - 开发环境部署（默认）
- `--prod` - 生产环境部署（包含文件压缩等优化）
- `--github` - GitHub Pages部署
- `--serve` - 部署后启动本地服务器

示例:
```bash
# 部署到自定义目录，生产环境，并启动服务器
bash deploy.sh /custom/path --prod --serve
``` 