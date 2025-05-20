#!/bin/bash
# 雷电MAX游戏部署脚本
# 使用方法: ./deploy.sh [目标路径] [选项]
# 选项:
#   --prod     生产环境部署
#   --dev      开发环境部署
#   --github   部署到GitHub Pages
#   --serve    部署后启动本地服务器

# 当前脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 项目根目录(deploy的上一级目录)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
# 获取配置文件中的值
CONFIG_FILE="$SCRIPT_DIR/deploy-config.js"

# 设置默认部署模式
DEPLOY_MODE="dev"
# 默认部署目录
TARGET_DIR="/var/www/html/RaidenMax"
# 是否启动服务器
START_SERVER=false

# 处理命令行参数
for arg in "$@"; do
  if [[ $arg == --* ]]; then
    # 处理选项参数
    if [[ $arg == "--prod" ]]; then
      DEPLOY_MODE="prod"
    elif [[ $arg == "--dev" ]]; then
      DEPLOY_MODE="dev"
    elif [[ $arg == "--github" ]]; then
      DEPLOY_MODE="github"
    elif [[ $arg == "--serve" ]]; then
      START_SERVER=true
    fi
  else
    # 处理目标路径参数
    TARGET_DIR="$arg"
  fi
done

# 显示欢迎信息
echo "================================="
echo "  雷电MAX游戏部署脚本"
echo "================================="
echo "部署模式: $DEPLOY_MODE"
echo "目标目录: $TARGET_DIR"
echo "脚本目录: $SCRIPT_DIR"
echo "项目目录: $PROJECT_DIR"
echo ""

# 创建目标目录(如果不存在)
if [[ $DEPLOY_MODE != "github" ]]; then
  echo "创建目标目录..."
  mkdir -p "$TARGET_DIR"
  mkdir -p "$TARGET_DIR/assets/js"
fi

# 复制游戏文件
if [[ $DEPLOY_MODE == "github" ]]; then
  echo "准备GitHub Pages部署..."
  # 对于GitHub Pages，通常使用gh-pages或类似工具
  # 这里只是准备文件，实际部署需要额外的工具
  if command -v npm &>/dev/null; then
    echo "使用npm部署到GitHub Pages..."
    cd "$PROJECT_DIR"
    if [[ -f package.json ]]; then
      if grep -q "deploy:github" package.json; then
        npm run deploy:github
        echo "GitHub Pages部署脚本已执行，请检查结果。"
        exit 0
      fi
    fi
    echo "未找到package.json中的deploy:github脚本，改为手动部署..."
  fi
  # 如果npm部署失败，继续手动部署过程
fi

# 复制所有需要的文件
echo "正在复制游戏文件..."
# 复制当前deploy目录下的文件到目标目录
cp "$SCRIPT_DIR/index.html" "$TARGET_DIR/" || echo "无法复制 index.html"
cp "$SCRIPT_DIR/style.css" "$TARGET_DIR/" || echo "无法复制 style.css"
cp "$SCRIPT_DIR/game.js" "$TARGET_DIR/" || echo "无法复制 game.js"
cp "$SCRIPT_DIR/favicon.ico" "$TARGET_DIR/" 2>/dev/null || echo "favicon.ico不存在，跳过"

# 复制资源文件
if [ -d "$SCRIPT_DIR/assets" ]; then
  echo "正在复制资源文件..."
  mkdir -p "$TARGET_DIR/assets"
  cp -r "$SCRIPT_DIR/assets/"* "$TARGET_DIR/assets/" || echo "无法复制资源文件"
else
  echo "deploy目录下未找到assets目录，尝试从项目根目录复制..."
  if [ -d "$PROJECT_DIR/assets" ]; then
    mkdir -p "$TARGET_DIR/assets"
    cp -r "$PROJECT_DIR/assets/"* "$TARGET_DIR/assets/" || echo "无法复制项目根目录下的资源文件"
  else
    echo "警告: 未找到assets目录，创建一个空目录..."
    mkdir -p "$TARGET_DIR/assets/js"
  fi
fi

# 检查是否存在Phaser库，若不存在则下载
if [ ! -f "$TARGET_DIR/assets/js/phaser.min.js" ]; then
  echo "未找到Phaser库，正在从CDN下载..."
  if command -v curl &>/dev/null; then
    curl -o "$TARGET_DIR/assets/js/phaser.min.js" "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js" || echo "下载失败"
  elif command -v wget &>/dev/null; then
    wget -O "$TARGET_DIR/assets/js/phaser.min.js" "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js" || echo "下载失败"
  else
    echo "错误: 需要curl或wget来下载Phaser库。请手动下载并放置到assets/js目录中。"
  fi
  
  if [ -f "$TARGET_DIR/assets/js/phaser.min.js" ]; then
    echo "Phaser库下载完成。"
  fi
fi

# 根据部署模式执行额外操作
if [[ $DEPLOY_MODE == "prod" ]]; then
  echo "执行生产环境优化..."
  # 这里可以添加生产环境优化，如压缩文件等
  if command -v uglifyjs &>/dev/null; then
    echo "压缩JavaScript文件..."
    uglifyjs "$TARGET_DIR/game.js" -o "$TARGET_DIR/game.min.js" -c -m || echo "JavaScript压缩失败，使用原始文件"
    if [ -f "$TARGET_DIR/game.min.js" ]; then
      mv "$TARGET_DIR/game.min.js" "$TARGET_DIR/game.js"
    fi
  else
    echo "未安装uglifyjs，跳过JavaScript压缩"
  fi
  
  if command -v cleancss &>/dev/null; then
    echo "压缩CSS文件..."
    cleancss -o "$TARGET_DIR/style.min.css" "$TARGET_DIR/style.css" || echo "CSS压缩失败，使用原始文件"
    if [ -f "$TARGET_DIR/style.min.css" ]; then
      mv "$TARGET_DIR/style.min.css" "$TARGET_DIR/style.css"
    fi
  else
    echo "未安装cleancss，跳过CSS压缩"
  fi
fi

# 设置正确的权限
echo "设置文件权限..."
chmod -R 755 "$TARGET_DIR" || echo "权限设置失败，可能需要管理员权限"
find "$TARGET_DIR" -type f -exec chmod 644 {} \; 2>/dev/null || echo "文件权限设置失败"

# 启动本地服务器（如果指定了--serve选项）
if [[ $START_SERVER == true ]]; then
  echo "启动本地服务器..."
  if command -v node &>/dev/null && [ -f "$PROJECT_DIR/server.js" ]; then
    cd "$PROJECT_DIR"
    node server.js
  elif command -v python3 &>/dev/null; then
    cd "$TARGET_DIR"
    python3 -m http.server 3002
  elif command -v python &>/dev/null; then
    cd "$TARGET_DIR"
    # 检查Python版本
    if python -c "import sys; sys.exit(0 if sys.version_info >= (3, 0) else 1)" &>/dev/null; then
      python -m http.server 3002
    else
      python -m SimpleHTTPServer 3002
    fi
  else
    echo "无法启动本地服务器：需要Node.js或Python。"
  fi
fi

echo ""
echo "部署完成！您的游戏已部署到: $TARGET_DIR"
echo "如果您选择了服务器部署，请确保Web服务器已正确配置指向此目录。"
echo ""
echo "访问建议URL: http://localhost:3002/ (本地服务器)"
echo "             http://您的域名/RaidenMax/ (Web服务器)"
echo "=================================" 