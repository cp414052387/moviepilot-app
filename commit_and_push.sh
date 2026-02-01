#!/bin/bash

# MoviePilot App - 提交修复并推送

echo "========================================="
echo "提交修复并推送到 GitHub"
echo "========================================="
echo ""

# 进入项目目录
cd /tmp/moviepilot_app

# 添加所有文件
echo "添加文件..."
git add .

# 提交
echo "提交代码..."
git commit -m "fix: 修复 GitHub Actions Android 构建配置

- 更新 workflow: 添加 Android SDK 设置步骤
- 更新 build.gradle: 
  - 添加 Kotlin 编译选项
  - 添加 build types 配置
  - 添加 lint options
  - 添加 packaging options
- 更新 settings.gradle:
  - 更新插件版本
  - 添加 dependencyResolutionManagement"

if [ $? -eq 0 ]; then
    echo "✅ 代码已提交"
else
    echo "⚠️  提交可能有问题"
fi

# 推送到 GitHub
echo ""
echo "========================================="
echo "推送到 GitHub..."
echo "========================================="
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ 推送成功！"
    echo "========================================="
    echo ""
    echo "🚀 接下来的步骤："
    echo ""
    echo "1. 访问 GitHub Actions 页面："
    echo "   https://github.com/cp414052387/moviepilot-app/actions"
    echo ""
    echo "2. 等待构建完成（约 5-10 分钟）："
    echo "   - 首次构建会设置完整环境（Android SDK、Flutter SDK）"
    echo "   - 后续构建会使用缓存（1-3 分钟）"
    echo ""
    echo "3. 如果构建失败，会显示详细错误日志"
    echo "   - 根据错误日志继续调整配置"
    echo "   - 或者使用 Codemagic 在线构建"
    echo ""
    echo "4. 如果构建成功，下载 APK："
    echo "   - 进入最新的 workflow run（绿色的 checkmark）"
    echo "   - 滚动到页面底部的 'Artifacts' 部分"
    echo "   - 下载 app-debug.apk 或 app-release.apk"
    echo ""
    echo "5. 安装到手机："
    echo "   - 通过微信、QQ、Telegram 传输 APK"
    echo "   - 在手机上打开并安装"
    echo ""
    echo "6. 配置 App："
    echo "   - API 地址：http://192.168.2.134:3005"
    echo "   - API Key：nKBcZFG1wc97NfYNZ7RClg"
    echo "   - 点击 '测试连接'"
    echo "   - 保存并开始使用"
    echo ""
    echo "========================================="
else
    echo ""
    echo "========================================="
    echo "❌ 推送失败"
    echo "========================================="
    echo ""
    echo "可能的原因："
    echo "1. 网络问题"
    echo "2. 认证问题"
    echo "3. 仓库权限问题"
fi
