# MoviePilot Mobile App

🎬 一款用于控制 MoviePilot NAS 媒体库的 Android 应用

![Flutter](https://img.shields.io/badge/Flutter-3.38.9+-025694-informational?style=flat-square&logo=Flutter)
![License](https://img.shields.io/badge/license-GPL--blue.svg)
![Platform](https://img.shields.io/badge/platform-android-lightgrey.svg)

---

## ✨ 功能特性

- 🎬 **媒体库** - 浏览电影和电视剧，支持推荐、搜索、最新
- 📺 **订阅管理** - 添加和管理订阅，查看下载进度
- ⬇️ **下载管理** - 查看下载任务，控制进度
- 📜 **历史记录** - 查看订阅历史和整理历史
- ⚙️ **系统设置** - 自定义 API、主题、刷新配置
- 🌙 **深色模式** - 支持浅色/深色/跟随系统
- 🎨 **Material Design 3** - 美观现代的 UI

---

## 🚀 如何构建 APK

### 方法一：GitHub Actions 自动构建（推荐）

1. **Fork 本仓库到你的 GitHub**
2. **启用 GitHub Actions**
3. **触发构建**：
   - 推送代码到 main 分支
   - 若无需改动代码，也可使用空提交触发：
     - `git commit --allow-empty -m "chore: trigger actions build"`
     - `git push`
   - 或在 Actions 标签页手动触发 "Run workflow"
4. **下载 APK**：
   - 进入 Actions 标签页
   - 找到最新的 workflow run
   - 在 Artifacts 中下载 `app-debug.apk` 或 `app-release.apk`

### 方法二：Codemagic 在线构建

1. 访问 https://codemagic.io/
2. 上传项目 ZIP 文件
3. 选择 Android 构建配置
4. 等待完成并下载 APK

### 方法三：本地构建

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/MoviePilot-Mobile.git
cd MoviePilot-Mobile

# 2. 安装 Flutter SDK
# macOS
brew install --cask flutter

# Linux
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# 3. 获取依赖
flutter pub get

# 4. 构建 APK
flutter build apk --debug    # 调试版本
flutter build apk --release  # 发布版本
```

---

## ⚙️ 首次使用

1. 打开 App 后，会进入设置页面
2. 配置以下信息：

### API 配置

- **API 地址**：你的 MoviePilot 服务器地址
  - 例如：`http://192.168.2.134:3005`
  - 确保手机和服务器在同一局域网

- **API Key**（可选）：如果 MoviePilot 启用了 API 认证
  - 例如：`nKBcZFG1wc97NfYNZ7RClg`

3. 点击"测试连接"验证配置
4. 保存后即可使用

---

## 📱 下载安装

### 方法一：从 GitHub Releases

1. 访问本仓库的 Releases 页面
2. 下载最新的 `.apk` 文件
3. 在手机上打开 APK 文件
4. 按照提示安装

### 方法二：从 GitHub Actions

1. 访问 Actions 页面
2. 找到最新的 workflow run
3. 下载 Artifacts 中的 APK

### 方法三：USB 传输

```bash
# 安装到连接的 Android 设备
adb install build/app/outputs/flutter-apk/app-debug.apk
```

---

## 🏗️ 项目结构

```
lib/
├── api/                  # API 服务层
│   └── moviepilot_api.dart
├── models/               # 数据模型
│   └── media.dart
├── providers/            # 状态管理
│   ├── app_provider.dart
│   └── settings_provider.dart
├── screens/              # 页面
│   ├── home_screen.dart
│   ├── setup_screen.dart
│   ├── media_library_screen.dart
│   ├── subscriptions_screen.dart
│   ├── downloads_screen.dart
│   ├── history_screen.dart
│   └── settings_screen.dart
├── theme/                # 主题配置
│   └── app_theme.dart
├── widgets/              # 自定义组件
└── main.dart             # 应用入口
```

---

## 🛠️ 技术栈

- **Flutter 3.38.9** - 跨平台 UI 框架
- **Dart 3.10.8** - 编程语言
- **Provider** - 状态管理
- **Dio** - HTTP 网络请求
- **Material Design 3** - UI 设计规范
- **MCP 协议** - Model Context Protocol API

---

## 📦 依赖包

详见 [pubspec.yaml](pubspec.yaml)

主要依赖：
- `flutter_riverpod` - 状态管理
- `dio` - 网络请求
- `shared_preferences` - 本地存储
- `cached_network_image` - 图片缓存
- `shimmer` - 加载动画
- `pull_to_refresh` - 下拉刷新
- `material_design_icons_flutter` - 图标

---

## 📖 MoviePilot API

本应用通过 MoviePilot MCP 协议与服务器通信。

**API 基础路径：** `/api/v1/mcp`

**认证方式：** `X-API-KEY` Header

**支持的工具：**
- `query_subscribes` - 获取订阅列表
- `add_subscribe` - 添加订阅
- `delete_subscribe` - 删除订阅
- `query_download_tasks` - 获取下载列表
- `delete_download` - 删除下载
- `search_media` - 搜索媒体
- `get_recommendations` - 获取推荐
- `query_media_detail` - 获取媒体详情
- `query_subscribe_history` - 订阅历史
- `query_transfer_history` - 整理历史
- `query_library_latest` - 最新入库

详细 API 文档：https://api.movie-pilot.org

---

## 🌟 路线图

```
v1.0.0 (2026-02-01)
├── ✅ 基础架构
├── ✅ MCP 协议集成
├── ✅ 媒体库功能
├── ✅ 订阅管理
├── ✅ 下载任务
├── ✅ 历史记录
├── ✅ 系统设置
└── ✅ Material Design 3 UI
```

---

## 🐛 已知问题

- 需要在 MoviePilot 服务器上启用 MCP API
- 手机和服务器必须在同一局域网
- 部分 Android 版本可能需要授予网络权限

---

## 📄 许可证

本项目采用 GPL-3.0 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📞 反馈

- **MoviePilot 官方**：https://wiki.movie-pilot.org
- **GitHub Issues**：https://github.com/YOUR_USERNAME/MoviePilot-Mobile/issues
- **Telegram**：@chenpengshuaigege

---

## 🙏 致谢

- [MoviePilot](https://github.com/jxxghp/MoviePilot) - 强大的 NAS 媒体库管理工具
- [Flutter](https://flutter.dev/) - 美跨平台 UI 框架
- [Material Design](https://material.io/design) - Google Material Design 设计规范
- [TMDB](https://www.themoviedb.org/) - 电影数据库 API

---

**Made with ❤️ by chenpeng**
