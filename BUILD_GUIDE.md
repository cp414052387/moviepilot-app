# MoviePilot App APK 构建指南

## 🚨 当前问题

Flutter SDK 下载失败，可能原因：
1. 网络环境问题
2. Google 访问受限
3. 文件过大（约 2GB）

---

## 🔧 解决方案

### 方案一：使用国内镜像（推荐）

**清华大学镜像站（最快）：**

```bash
# 克隆 Flutter SDK 镜像
cd /Users/chenpeng
git clone https://mirrors.tuna.tsinghua.edu.cn/flutter/flutter.git

# 或直接下载 ZIP
cd /Users/chenpeng
curl -L -o flutter.zip https://mirrors.tuna.tsinghua.edu.cn/flutter/flutter_infra/releases/stable/macos/flutter_macos_3.38.9-stable.zip

# 解压
unzip flutter.zip
```

**腾讯云镜像：**

```bash
cd /Users/chenpeng
curl -L -o flutter.zip https://mirrors.cloud.tencent.com/flutter/flutter_infra_release/releases/stable/macos/flutter_macos_3.38.9-stable.zip
unzip flutter.zip
```

---

### 方案二：配置代理下载

使用你已经配置的代理：

```bash
# 使用 HTTP 代理
export http_proxy=http://127.0.0.1:1087
export https_proxy=http://127.0.0.1:1087

# 使用 SOCKS5 代理
export all_proxy=socks5://127.0.0.1:1080

# 下载 Flutter
cd /Users/chenpeng
curl -L -o flutter.zip https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.38.9-stable.zip
```

---

### 方案三：手动下载（最可靠）

**步骤：**

1. **在浏览器中下载：**
   - 链接：https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.38.9-stable.zip
   - 大小：约 1.2 GB

2. **复制到指定位置：**
   - 复制到 `/Users/chenpeng/flutter_macos.zip`

3. **解压：**
   ```bash
   cd /Users/chenpeng
   unzip flutter_macos.zip
   export PATH="$PATH:/Users/chenpeng/flutter/bin"
   ```

---

### 方案四：在线构建（无需本地环境）

**使用在线服务：**
1. **Codemagic** - https://codemagic.io/
   - 上传项目 ZIP
   - 选择 Android 构建
   - 自动生成 APK

2. **GitHub Actions** - 如果项目在 GitHub
   - 创建 `.github/workflows/build.yml`
   - 自动构建并发布

---

### 方案五：临时使用 Android Studio

如果你有 Android Studio：

```bash
# 安装 Android Studio
brew install --cask android-studio

# 首次启动会自动下载 Flutter 和 Android SDK
# 启动方式：
open -a "Android Studio"
```

然后在 Android Studio 中：
1. File > Open
2. 选择 `/tmp/moviepilot_app`
3. 等待 Gradle 同步
4. Run > Run 'app'
5. APK 会在 `build/app/outputs/flutter-apk/`

---

## ✅ Flutter 安装后的构建步骤

安装完成后，运行：

```bash
# 进入项目
cd /tmp/moviepilot_app

# 安装依赖
flutter pub get

# 构建 APK（调试版本，无需签名）
flutter build apk --debug

# 或构建发布版本（需要签名）
flutter build apk --release
```

生成的 APK 位置：
```
build/app/outputs/flutter-apk/app-debug.apk
# 或
build/app/outputs/flutter-apk/app-release.apk
```

---

## 📱 传送到手机

### 方法一：USB 传输

```bash
# 安装到连接的手机
adb install build/app/outputs/flutter-apk/app-debug.apk
```

### 方法二：微信/QQ 传输

1. 打开微信/QQ
2. 找到文件 `/tmp/moviepilot_app/build/app/outputs/flutter-apk/app-debug.apk`
3. 发送到"文件传输助手"
4. 手机上下载并安装

### 方法三：Telegram 传输

1. 发送 APK 文件给自己
2. 手机 Telegram 下载
3. 点击安装

---

## 🎯 推荐

**最快方案：使用清华大学镜像**

```bash
cd /Users/chenpeng
curl -L -o flutter.zip https://mirrors.tuna.tsinghua.edu.cn/flutter/flutter_infra/releases/stable/macos/flutter_macos_3.38.9-stable.zip
unzip flutter.zip
export PATH="$PATH:/Users/chenpeng/flutter/bin"
cd /tmp/moviepilot_app
flutter pub get
flutter build apk --debug
```

---

**需要我帮你尝试其他方案吗？**
