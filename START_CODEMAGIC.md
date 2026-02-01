# Codemagic 在线构建 - 快速开始

## 🚀 立即开始

### 第一步：访问 Codemagic

**点击以下链接或复制到浏览器：**
```
https://codemagic.io/
```

---

### 第二步：注册/登录

1. **点击 "Sign up"** 或 "Log in"
2. **选择登录方式**（三选一）：
   - 用 **GitHub** 账号登录（推荐，最快）
   - 用 **Google** 账号登录
   - 用 **Email** 注册（免费）

---

### 第三步：创建新项目

1. **点击 "Start New Project"**
2. **选择应用类型**：
   - 选择 **"Mobile App"**
3. **填写项目信息**：
   - Project name：`MoviePilot App`
   - Description：`MoviePilot NAS 媒体库控制器 - Android App`
   - Repository：可以不连接，选择 "No repository"

---

### 第四步：上传项目 ZIP

1. **选择 "Upload from ZIP"**
2. **上传文件**：
   - **文件位置**：`/tmp/moviepilot_app/moviepilot-app.zip`
   - **文件大小**：77K
   - **上传方式**：
     - 拖拽 ZIP 文件到上传区域
     - 或点击 "Select file" 选择文件

3. **等待上传完成**（约 10-30 秒）

---

### 第五步：配置构建

**构建配置：**

| 配置项 | 值 |
|--------|-----|
| **Platform** | Android |
| **Framework** | Flutter |
| **Flutter version** | 3.38.9 或 latest |
| **Build type** | debug（推荐）或 release |
| **Keystore** | （如果选 release，需要配置签名）|

---

### 第六步：开始构建

1. **点击 "Start Build"**
2. **等待构建完成**：
   - 首次构建：约 3-5 分钟
   - 后续构建：约 1-2 分钟

---

### 第七步：下载 APK

1. **点击 "Builds" 标签页**
2. **找到最新的 build（绿色的 checkmark）**
3. **点击 "Download APK"**
4. **选择下载**：
   - `app-debug.apk`（推荐，无需签名）
   - 或 `app-release.apk`（需要签名）

---

### 第八步：安装到手机

**方法一：通过微信/QQ/Telegram（推荐）**

1. **传输 APK**
   - 在电脑上找到下载的 APK 文件
   - 用手机扫描电脑上的文件
   - 或通过微信/QQ/Telegram 发送到手机

2. **安装**
   - 在手机上打开 APK 文件
   - 点击"安装"
   - 如提示"未知来源"，在设置中允许安装

**方法二：USB 传输**

1. **用 USB 连接手机到电脑**
2. **在 Finder 中找到 APK 文件**
3. **拖拽到手机的存储**
4. **在手机上安装**

---

### 第九步：配置 App

**安装完成后，首次打开 App：**

1. **自动进入设置页面**
2. **配置 API 信息**：
   - **API 地址**：`http://192.168.2.134:3005`
   - **API Key**：`nKBcZFG1wc97NfYNZ7RClg`
3. **点击"测试连接"**
4. **等待测试成功**
5. **点击"保存并开始使用"**

---

## ⏱️ 时间估算

| 步骤 | 时间 |
|------|------|
| 注册/登录 | 1 分钟 |
| 创建项目 | 1 分钟 |
| 上传 ZIP | 30 秒 |
| 配置构建 | 1 分钟 |
| 构建完成 | 3-5 分钟 |
| 下载安装 | 2-3 分钟 |
| **总计** | **10-15 分钟** |

---

## 🎯 注意事项

1. **网络要求**
   - 手机和 MoviePilot 服务器必须在同一局域网
   - 确保 `http://192.168.2.134:3005` 可以访问

2. **Android 版本**
   - 最低：Android 5.0 (Lollipop)
   - 推荐：Android 8.0+

3. **权限要求**
   - 网络访问权限
   - 存储权限（用于缓存）
   - 如需推送，需要通知权限

4. **API 兼容性**
   - 本 App 支持 MoviePilot V2 MCP 协议
   - 确保服务器已启用 MCP API

---

## 🚀 快速开始

**准备好了吗？现在就可以开始了！**

**第一步**：https://codemagic.io/
**第二步**：注册/登录
**第三步**：上传 `/tmp/moviepilot_app/moviepilot-app.zip`
**第四步**：配置 Android + Flutter + debug
**第五步**：点击 Build
**第六步**：等待 3-5 分钟
**第七步**：下载 APK
**第八步**：安装到手机
**第九步**：配置 API 并使用

---

**整个过程大约 10-15 分钟！** 🚀

有任何问题随时告诉我！
