# GitHub 仓库设置指南

## 📊 当前状态

✅ **项目已准备好推送到 GitHub！**

| 项目 | 状态 |
|------|------|
| 项目代码 | ✅ 100% 完成 |
| Git 仓库 | ✅ 已初始化 |
| GitHub Actions | ✅ 已配置 |
| README | ✅ 已完善 |
| 文档 | ✅ 已齐全 |

---

## 🚀 推送到 GitHub 的步骤

### 第一步：创建 GitHub 仓库

1. **访问 GitHub**：https://github.com/new
2. **填写信息**：
   - Repository name：`MoviePilot-Mobile`（或其他你喜欢的名字）
   - Description：`MoviePilot NAS 媒体库控制器 - Android App`
   - 选择 **Public** 或 **Private**
   - **不要**勾选 "Initialize with README"
3. 点击 **Create repository**

### 第二步：推送代码

```bash
# 进入项目目录
cd /tmp/moviepilot_app

# 添加 GitHub 远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/MoviePilot-Mobile.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 第三步：启用 GitHub Actions

推送完成后，GitHub Actions 会自动运行：
1. 访问仓库的 **Actions** 标签页
2. 等待构建完成（约 3-5 分钟）
3. 在 workflow run 中下载生成的 APK：
   - `app-debug.apk` - 调试版本，无需签名
   - `app-release.apk` - 发布版本，需要签名

---

## 📱 下载并安装 APK

### 从 GitHub Actions 下载

1. **进入 Actions 页面**
   - 访问：`https://github.com/YOUR_USERNAME/MoviePilot-Mobile/actions`

2. **找到最新的 workflow run**
   - 点击最新的 workflow run（绿色的 checkmark）
   - 确保状态是 "✓ Success"

3. **下载 APK**
   - 滚动到页面底部的 "Artifacts" 部分
   - 下载 `app-debug.apk`（推荐，无需签名）
   - 或下载 `app-release.apk`（需要额外签名步骤）

4. **安装到手机**
   - 通过微信、QQ、Telegram 等发送到手机
   - 在手机上打开 APK 文件
   - 点击"安装"

### 从 GitHub Releases 下载

如果启用了自动 Release（workflow 中已配置）：
1. 访问：`https://github.com/YOUR_USERNAME/MoviePilot-Mobile/releases`
2. 下载最新的 APK
3. 安装到手机

---

## ⚙️ 首次使用配置

安装 App 后：

1. **打开 MoviePilot App**
2. **会自动进入设置页面**
3. **配置 API 信息**：
   - API 地址：`http://192.168.2.134:3005`
   - API Key：`nKBcZFG1wc97NfYNZ7RClg`
4. **点击"测试连接"**
5. **保存并开始使用！**

---

## 🎯 GitHub Actions 工作流

每次你推送代码到 `main` 或 `master` 分支时，GitHub Actions 会自动：
1. ✅ 安装 Java 17
2. ✅ 安装 Flutter 3.38.9
3. ✅ 获取依赖
4. ✅ 构建 Debug APK
5. ✅ 构建 Release APK
6. ✅ 上传 APK 作为 Artifacts
7. ✅ （可选）创建 Release

---

## 🔄 手动触发构建

你可以在不推送代码的情况下手动触发构建：

1. 访问 Actions 页面
2. 选择 "Build Android APK" workflow
3. 点击 "Run workflow" 按钮
4. 等待构建完成

---

## 📂 项目文件位置

```
/tmp/moviepilot_app/
```

**包含：**
- ✅ 完整的 Flutter 项目代码
- ✅ GitHub Actions 工作流配置
- ✅ 完善的 README 文档
- ✅ Android 构建配置

---

## 🚨 注意事项

1. **网络要求**：手机和 MoviePilot 服务器必须在同一局域网
2. **首次构建**：首次推送代码后，GitHub Actions 会自动运行构建
3. **构建时间**：每次构建约 3-5 分钟
4. **APK 大小**：约 10-20 MB
5. **API 兼容性**：支持 MoviePilot V2 MCP 协议

---

## 🎉 快速开始

```bash
# 1. 推送到 GitHub
cd /tmp/moviepilot_app
git remote add origin https://github.com/YOUR_USERNAME/MoviePilot-Mobile.git
git branch -M main
git push -u origin main

# 2. 等待 GitHub Actions 完成（3-5 分钟）

# 3. 下载 APK
# 访问：https://github.com/YOUR_USERNAME/MoviePilot-Mobile/actions
# 下载 Artifacts 中的 APK

# 4. 安装到手机
# 通过微信/QQ 传输，点击安装

# 5. 配置并使用
# API 地址：http://192.168.2.134:3005
# API Key：nKBcZFG1wc97NfYNZ7RClg
```

---

**准备好了吗？现在可以推送到 GitHub 了！** 🚀
