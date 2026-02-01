# Codemagic 在线构建详细指南

## 📊 当前状态

| 项目 | 状态 |
|------|------|
| 项目代码 | ✅ 100% 完成 |
| GitHub 仓库 | ✅ 已推送 |
| 本地构建 | ❌ 失败（配置问题）|
| Codemagic | ✅ **最佳方案** |

---

## 🚀 Codemagic 在线构建步骤

### 第一步：注册/登录 Codemagic

1. **访问 Codemagic**：https://codemagic.io/
2. **点击 "Sign up" 或 "Log in"**
   - 可以用 GitHub、Google、Email 账号
   - 注册是免费的

---

### 第二步：创建新项目

1. **登录后，点击 "Start New Project"**
2. **选择应用类型**：
   - 选择 "Mobile App"
3. **填写项目信息**：
   - Project name：`MoviePilot App`
   - Description：`MoviePilot NAS 媒体库控制器 - Android App`

---

### 第三步：连接仓库

1. **选择连接方式**：
   - 选择 "Upload from ZIP"（推荐，最简单）
   - 或选择 "Connect to GitHub"（如果仓库是 public）

2. **上传项目 ZIP 文件**：

**方法一：使用 Finder（推荐）**
- 打开 Finder
- 进入 `/tmp`
- 找到 `moviepilot_app` 文件夹
- 右键点击，选择"压缩"或"Compress"
- 生成 `moviepilot_app.zip`

**方法二：使用命令行**
```bash
cd /tmp
zip -r moviepilot_app.zip moviepilot_app
```

3. **上传 ZIP 文件**到 Codemagic

---

### 第四步：配置构建

1. **选择平台**：
   - Platform: **Android**
   
2. **选择框架**：
   - Framework: **Flutter**

3. **配置构建设置**：
   - **Flutter version**：3.38.9（或选择 latest）
   - **Release**：选择 `debug`（推荐，无需签名）
   - **Keystore**：（如果选择 release，需要配置签名）

---

### 第五步：开始构建

1. **点击 "Start Build"**
2. **等待构建完成**：
   - 首次构建：约 3-5 分钟
   - 后续构建：约 1-2 分钟

---

### 第六步：下载 APK

**构建成功后：**

1. **进入项目页面**
   - 点击左侧的 "Builds" 标签
   - 找到最新的 build（绿色的 checkmark）

2. **下载 APK**
   - 点击 "Download APK"
   - 下载 `app-debug.apk`（推荐）
   - 或下载 `app-release.apk`

---

## 📱 安装到手机

### 方法一：通过微信/QQ/Telegram 传输

1. **传输 APK 到手机**
   - 用手机扫描电脑上的 APK 文件
   - 或通过微信/QQ/Telegram 发送到手机

2. **安装**
   - 在手机上打开 APK 文件
   - 点击"安装"
   - 如提示"未知来源"，在设置中允许安装

### 方法二：USB 传输

1. **连接手机到电脑**
2. **拖拽 APK 到手机**
3. **在手机上安装**

---

## ⚙️ 首次使用配置

安装 App 后，首次打开会自动进入设置页面：

### 配置信息：

**API 地址：**
```
http://192.168.2.134:3005
```

**API Key：**
```
nKBcZFG1wc97NfYNZ7RClg
```

### 操作步骤：

1. **输入 API 地址**
2. **输入 API Key**
3. **点击"测试连接"**
4. **等待测试完成**
5. **点击"保存并开始使用"**

---

## 🎯 注意事项

1. **网络要求**
   - 手机和 MoviePilot 服务器必须在同一局域网
   - 确保 `http://192.168.2.134:3005` 可以访问

2. **API 兼容性**
   - 本 App 支持 MoviePilot V2 MCP 协议
   - 确保服务器已启用 MCP API

3. **Android 版本**
   - 最低支持：Android 5.0 (Lollipop)
   - 推荐版本：Android 8.0+

4. **权限要求**
   - 网络访问权限
   - 存储权限（用于缓存）
   - 如需要推送，需要通知权限

---

## 🔄 Codemagic 优势

| 特性 | 说明 |
|------|------|
| **速度快** | 3-5 分钟完成构建 |
| **无配置** | 自动配置环境 |
| **自动签名** | 无需手动签名 |
| **多版本** | 支持 debug/release |
| **持续集成** | 支持 GitHub 关联 |
| **免费** | 免费版已够用 |

---

## 📝 完整流程总结

1. **注册 Codemagic** - https://codemagic.io/
2. **创建新项目** - Start New Project
3. **上传 ZIP** - 压缩 `/tmp/moviepilot_app` 并上传
4. **配置构建** - Android + Flutter + debug
5. **点击 Build** - 等待 3-5 分钟
6. **下载 APK** - Builds 标签
7. **安装到手机** - 通过微信/QQ/USB
8. **配置 API** - 首次打开自动进入设置
9. **开始使用** - 媒体库、订阅、下载等

---

## ⏱️ 时间估算

| 步骤 | 时间 |
|------|------|
| 注册/登录 | 1 分钟 |
| 创建项目 | 1 分钟 |
| 压缩上传 ZIP | 2-3 分钟 |
| 配置构建 | 1 分钟 |
| 构建 | 3-5 分钟 |
| 下载安装 | 2-3 分钟 |
| **总计** | **10-15 分钟** |

---

## 💡 提示

1. **压缩时**：不要包含 `build/` 文件夹，可以减小 ZIP 大小
2. **首次构建**：会下载 Flutter SDK，稍慢一些
3. **后续构建**：会使用缓存，更快
4. **Release APK**：需要配置签名，建议先用 debug 版本

---

## 🚀 开始构建

**准备好了吗？现在就可以开始！**

**第一步：** https://codemagic.io/
**第二步：** 注册并创建项目
**第三步：** 压缩 `/tmp/moviepilot_app` 为 ZIP
**第四步：** 上传并构建
**第五步：** 下载并安装

---

**整个过程大约 10-15 分钟！** ⏱️

有任何问题随时告诉我！🚀
