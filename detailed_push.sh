#!/bin/bash

# MoviePilot App - 推送到 GitHub（详细日志）

GITHUB_USERNAME="cp414052387"
REPO_NAME="moviepilot-app"

echo "========================================="
echo "MoviePilot App - 推送到 GitHub（详细日志）"
echo "========================================="
echo ""
echo "GitHub 用户名：$GITHUB_USERNAME"
echo "仓库名称：$REPO_NAME"
echo ""
echo "完整仓库：https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# 进入项目目录
cd /tmp/moviepilot_app

# 检查状态
echo "========================================="
echo "当前状态"
echo "========================================="
echo ""
git status
echo ""

# 检查远程仓库
echo "========================================="
echo "远程仓库配置"
echo "========================================="
git remote -v
echo ""

# 测试连接
echo "========================================="
echo "测试 GitHub 连接"
echo "========================================="
curl -s -I https://github.com | head -5
echo ""

# 推送（详细模式）
echo "========================================="
echo "推送到 GitHub"
echo "========================================="
echo ""
echo "执行命令：git push -f origin main"
echo ""

GIT_TRACE=1 GIT_CURL_VERBOSE=1 git push -f origin main 2>&1 | tee /tmp/git_push.log | tail -100

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ 推送成功！"
    echo "========================================="
    echo ""
    echo "🚀 接下来的步骤："
    echo ""
    echo "1. 访问 GitHub Actions 页面："
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
    echo ""
    echo "2. 等待构建完成（约 5-10 分钟）："
    echo "   - 首次构建会下载 Flutter SDK 和依赖（3-5 分钟）"
    echo "   - 使用新的 workflow 配置优化了构建步骤"
    echo ""
    echo "3. 监控构建状态："
    echo "   - 查看 workflow 的实时日志"
    echo "   - 如果构建失败，可以查看详细错误信息"
    echo ""
    echo "4. 如果构建成功，下载 APK："
    echo "   - 在 Actions 页面找到最新的 workflow run"
    echo "   - 点击进入查看详情"
    echo "   - 滚动到 'Artifacts' 部分"
    echo "   - 下载：app-debug.apk（推荐，无需签名）"
    echo "   - 或下载：app-release.apk（需要签名）"
    echo ""
    echo "5. 安装到手机："
    echo "   - 通过微信、QQ、Telegram 传输 APK"
    echo "   - 在手机上打开 APK 文件并安装"
    echo ""
    echo "6. 配置 App："
    echo "   - API 地址：http://192.168.2.134:3005"
    echo "   - API Key：nKBcZFG1wc97NfYNZ7RClg"
    echo "   - 点击 '测试连接'"
    echo "   - 点击 '保存并开始使用'"
    echo ""
    echo "========================================="
else
    echo ""
    echo "========================================="
    echo "❌ 推送失败"
    echo "========================================="
    echo ""
    echo "错误日志已保存到：/tmp/git_push.log"
    echo ""
    echo "查看错误日志："
    cat /tmp/git_push.log | tail -50
    echo ""
    echo "可能的原因："
    echo "1. 网络问题"
    echo "2. GitHub 认证失败（需要配置 SSH 密钥或 Personal Access Token）"
    echo "3. 仓库不存在或仓库名称错误"
    echo "4. 仓库权限问题"
    echo ""
    echo "解决方案："
    echo "1. 检查网络连接"
    echo "2. 访问仓库确认存在：https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "3. 如果认证失败，生成 GitHub Token："
    echo "   访问：https://github.com/settings/tokens"
    echo "   点击 'Generate new token (classic)'"
    echo "   勾选 'repo' 权限"
    echo "   复制 token"
    echo "4. 重新运行此脚本并输入 token"
    echo ""
fi
