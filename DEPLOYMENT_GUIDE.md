# MoviePilot App 部署指南

## 📱 部署到 Android 手机

### 前置条件检查

❌ Flutter SDK - 未安装
❌ Android SDK - 未安装
❌ Android Studio - 未安装
❌ adb（Android Debug Bridge）- 未安装

---

## 🚀 完整安装步骤

### 第一步：安装 Flutter SDK

#### macOS 安装方式（推荐）

```bash
# 使用 Homebrew 安装
brew install --cask flutter

# 或手动下载安装
# 访问 https://docs.flutter.dev/get-started/install/macos
```

#### 验证安装

```bash
flutter --version
flutter doctor
```

---

### 第二步：安装 Android Studio

```bash
# 使用 Homebrew 安装
brew install --cask android-studio

# 或从官网下载
# https://developer.android.com/studio
```

首次启动 Android Studio 后，需要：
1. 安装 Android SDK
2. 安装 Android SDK Platform-Tools
3. 安装 Android SDK Build-Tools
4. 安装一个系统镜像（如 Android 13/14）

---

### 第三步：配置环境变量

编辑 `~/.zshrc` 或 `~/.bash_profile`：

```bash
export PATH="$PATH:/Users/chenpeng/flutter/bin"
export PATH="$PATH:/Users/chenpeng/Library/Android/sdk/platform-tools"
export ANDROID_HOME=/Users/chenpeng/Library/Android/sdk
```

重新加载：

```bash
source ~/.zshrc
```

验证：

```bash
echo $PATH
flutter --version
adb version
```

---

### 第四步：连接手机

#### 1. 手机端设置

- 进入 **设置 > 关于手机**
- 连续点击 **版本号** 7 次，开启开发者选项
- 进入 **设置 > 开发者选项**
- 开启 **USB 调试**
- 开启 **USB 安装**（如果可用）

#### 2. 连接手机

用 USB 线连接手机到电脑，在手机上点击"允许 USB 调试"。

验证连接：

```bash
adb devices
```

应该看到：

```
List of devices attached
XXXXXXXXXXXXXXXXX    device
```

---

### 第五步：构建并安装 App

```bash
# 进入项目目录
cd /tmp/moviepilot_app

# 安装 Flutter 依赖
flutter pub get

# 直接安装到连接的手机
flutter install

# 或先构建 APK 再安装
flutter build apk --release
# 生成的 APK 在: build/app/outputs/flutter-apk/app-release.apk
```

如果安装失败，可能需要签名：

```bash
# 调试版本（开发测试）
flutter build apk --debug

# 发布版本（需要签名）
flutter build apk --release
```

---

## 🔄 快速部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "🚀 开始部署 MoviePilot App..."

# 检查 Flutter
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter 未安装"
    echo "   请运行: brew install --cask flutter"
    exit 1
fi

# 检查 adb
if ! command -v adb &> /dev/null; then
    echo "❌ adb 未安装"
    echo "   请安装 Android Studio"
    exit 1
fi

# 检查设备
echo "📱 检查连接的设备..."
adb devices

if ! adb devices | grep -q "device$"; then
    echo "❌ 未检测到 Android 设备"
    echo "   请检查:"
    echo "   1. USB 线是否连接"
    echo "   2. 手机是否开启 USB 调试"
    echo "   3. 是否授权 USB 调试"
    exit 1
fi

echo "✅ 检测到设备"

# 进入项目目录
cd /tmp/moviepilot_app

# 安装依赖
echo "📦 安装依赖..."
flutter pub get

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 构建并安装
echo "🏗️  构建并安装到设备..."
flutter install

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo "   App 已安装到手机"
    echo "   请在手机上打开 MoviePilot"
else
    echo "❌ 部署失败"
    echo "   请查看错误信息"
    exit 1
fi
```

---

## 📂 项目文件位置

```
/tmp/moviepilot_app
```

---

## ✅ 部署后使用

1. 在手机上打开 **MoviePilot** App
2. 会自动进入设置页面
3. **API 地址** 已预填充：`http://192.168.2.134:3005`
4. **API Key** 已预填充：`nKBcZFG1wc97NfYNZ7RClg`
5. 点击 **"测试连接"**
6. 点击 **"保存并继续"**
7. 开始使用！

---

## 🐛 常见问题

### adb 无法检测到设备

```bash
# 重启 adb 服务
adb kill-server
adb start-server

# 检查设备
adb devices
```

### Flutter doctor 报错

```bash
# 运行完整诊断
flutter doctor -v

# 根据提示修复问题
```

### App 安装失败

```bash
# 先卸载旧版本
adb uninstall com.moviepilot.moviepilot_app

# 重新安装
flutter install
```

### 网络连接失败

确保手机和电脑在**同一个局域网**，并且 MoviePilot 服务可访问。

---

## 🎯 下一步

安装完成后，你可以：
1. 在手机上测试所有功能
2. 查看媒体库、订阅、下载等
3. 使用搜索功能搜索影视
4. 添加新订阅

---

**需要我帮你解决任何部署问题吗？**
