// 雷电MAX GitHub Pages部署脚本
// 此脚本将游戏部署到GitHub Pages上

// 检查是否安装了必要的依赖
try {
  const ghpages = require('gh-pages');
  deployToGitHub();
} catch (error) {
  console.error('错误: 缺少必要的依赖 "gh-pages"');
  console.log('请通过以下命令安装:');
  console.log('npm install gh-pages --save-dev');
  process.exit(1);
}

// 主部署函数
function deployToGitHub() {
  const fs = require('fs');
  const path = require('path');
  
  // 显示欢迎信息
  console.log(`
================================================
  雷电MAX GitHub Pages部署工具
================================================
`);
  
  // 定义目录路径
  const scriptDir = __dirname;
  const projectDir = path.resolve(scriptDir, '..');
  const deployDir = scriptDir;
  
  // 尝试加载配置
  let config = {};
  try {
    const configPath = path.join(scriptDir, 'deploy-config.js');
    if (fs.existsSync(configPath)) {
      config = require('./deploy-config.js');
      console.log('已加载部署配置文件');
    } else {
      console.log('未找到配置文件，使用默认配置');
    }
  } catch (error) {
    console.log('配置文件加载失败，使用默认配置:', error.message);
  }
  
  // 获取GitHub Pages配置
  const githubConfig = config.githubPages || {};
  
  // 检查部署目录是否存在必要文件
  const requiredFiles = ['index.html', 'game.js', 'style.css'];
  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(deployDir, file))
  );
  
  if (missingFiles.length > 0) {
    console.error(`错误: deploy目录缺少必要文件: ${missingFiles.join(', ')}`);
    console.log('请确保deploy目录包含所有必要的游戏文件');
    process.exit(1);
  }
  
  // 确保assets目录存在
  const assetsDir = path.join(deployDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.log('未找到assets目录，正在创建...');
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // 检查Phaser库
  const phaserJsDir = path.join(assetsDir, 'js');
  const phaserJsPath = path.join(phaserJsDir, 'phaser.min.js');
  
  if (!fs.existsSync(phaserJsDir)) {
    fs.mkdirSync(phaserJsDir, { recursive: true });
  }
  
  if (!fs.existsSync(phaserJsPath)) {
    console.log('未找到Phaser库，请确保deploy/assets/js目录中包含phaser.min.js');
    console.log('部署可能会失败，除非GitHub Pages环境中已有此文件');
  }
  
  // 准备部署选项
  const deployTime = new Date().toISOString();
  const deployOptions = {
    branch: githubConfig.branch || 'gh-pages',
    message: (githubConfig.commitMessage || '自动部署: 雷电MAX游戏更新 [timestamp]')
      .replace('[timestamp]', deployTime),
    repo: undefined, // 使用当前仓库
    silent: false,
    dotfiles: true
  };
  
  // 添加自定义域名（如果配置了）
  if (githubConfig.customDomain) {
    console.log(`设置自定义域名: ${githubConfig.customDomain}`);
    fs.writeFileSync(
      path.join(deployDir, 'CNAME'),
      githubConfig.customDomain
    );
  }
  
  // 开始部署
  console.log(`
开始部署到GitHub Pages
分支: ${deployOptions.branch}
提交信息: ${deployOptions.message}
源目录: ${deployDir}
`);
  
  // 执行部署
  ghpages.publish(deployDir, deployOptions, function(err) {
    if (err) {
      console.error('部署失败:', err);
      process.exit(1);
    }
    
    console.log(`
================================================
  部署成功！
  
  您的游戏现在应该可以在以下地址访问:
  https://[用户名].github.io/[仓库名]/
  
  注意: GitHub Pages可能需要几分钟才能更新。
================================================
`);
  });
} 