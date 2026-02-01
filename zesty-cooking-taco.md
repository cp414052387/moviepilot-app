# MoviePilot 移动端 App 开发计划

## 项目概述

基于 MoviePilot 现有 API（https://api.movie-pilot.org/）开发一个功能完整、界面美观的移动端应用，实现远程媒体管理、订阅控制、下载管理、消息通知和聊天交互功能。

---

## 技术栈选型

| 技术领域 | 选型 | 理由 |
|---------|------|------|
| 跨平台框架 | React Native | 与Vue3前端技术栈契合，生态成熟，支持热更新 |
| UI组件库 | React Native Paper + Material Design 3 | 现代化设计风格，支持深色主题 |
| 状态管理 | Zustand + React Query | 轻量级全局状态 + 强大的服务器状态管理 |
| 网络请求 | Axios | 成熟稳定，拦截器支持完善 |
| 实时通信 | SSE + WebSocket | MoviePilot后端已支持SSE，聊天使用WebSocket |
| 动画 | React Native Reanimated | 流畅的60fps动画体验 |
| 图片加载 | React Native Fast Image | 高性能图片缓存 |

---

## 应用架构

### 目录结构

```
moviepilot-mobile/
├── src/
│   ├── api/                    # API接口层
│   ├── components/             # 通用组件
│   ├── screens/                # 页面/屏幕
│   ├── navigation/             # 导航配置
│   ├── hooks/                  # 自定义Hooks
│   ├── stores/                 # Zustand状态管理
│   ├── utils/                  # 工具函数
│   ├── services/               # 业务服务（SSE、聊天等）
│   ├── types/                  # TypeScript类型
│   └── styles/                 # 样式配置
├── App.tsx
└── package.json
```

### 核心模块划分

1. **认证模块** - 登录/登出、Token管理、服务器配置
2. **媒体管理模块** - 搜索、详情、刮削
3. **订阅管理模块** - 订阅列表、添加订阅、状态管理
4. **下载管理模块** - 下载列表、任务控制、进度显示
5. **消息中心模块** - 系统消息、通知推送、聊天界面
6. **仪表盘模块** - 系统统计、存储空间、状态监控
7. **设置模块** - 用户设置、主题切换、通知配置

---

## UI/UX 设计方案

### 设计风格

**核心理念：艺术感 + 现代化 + 极简主义**

- 电影感视觉（深色主题为主，类似Netflix）
- 大胆的海报展示
- 流畅的转场动画
- 毛玻璃效果
- Material Design 3 组件

### 配色方案（深色主题）

```typescript
{
  primary: '#E50914',        // Netflix红
  background: '#141414',     // 深黑背景
  surface: '#1F1F1F',        // 卡片背景
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3'
}
```

### 导航结构

**底部Tab导航（一级菜单）：**
```
┌────────────────────────────────────────────────────┐
│  🏠     🎬     ⬇️     🔔     ⚙️                │
│ 首页   媒体   下载   消息   设置                  │
└────────────────────────────────────────────────────┘
```

**侧边栏菜单（扩展功能）：**
- 仪表盘
- 订阅管理
- 探索发现
- 媒体服务器
- 插件管理
- 历史记录
- 站点管理

---

## 功能实现计划

### Phase 1: 基础架构 + 认证 + 首页（MVP）

**目标：** 可运行的应用框架，完成登录和基础首页

**关键文件：**
- `src/api/client.ts` - Axios配置、拦截器
- `src/api/auth.ts` - 认证API
- `src/screens/auth/LoginScreen.tsx` - 登录页
- `src/screens/home/HomeScreen.tsx` - 首页
- `src/stores/authStore.ts` - 认证状态管理

**API对接：**
- `POST /api/v1/login/access-token` - 登录获取Token
- `GET /api/v1/user/info` - 获取用户信息
- `GET /api/v1/dashboard` - 仪表盘数据

### Phase 2: 媒体管理模块

**目标：** 完整的媒体浏览、搜索、详情功能

**关键文件：**
- `src/screens/media/SearchScreen.tsx` - 搜索页
- `src/screens/media/MediaDetailScreen.tsx` - 详情页
- `src/components/media/MediaCard.tsx` - 媒体卡片
- `src/components/media/Poster.tsx` - 海报组件

**API对接：**
- `GET /api/v1/media/search` - 媒体搜索
- `GET /api/v1/media/{mediaid}` - 媒体详情
- `GET /api/v1/tmdb/detail/{tmdbid}` - TMDB详情
- `GET /api/v1/system/img/{proxy}` - 图片代理

**快捷操作按钮：**
- ➕ 订阅
- ⬇️ 下载
- ❤️ 收藏
- 📤 分享

### Phase 3: 订阅管理模块

**目标：** 完整的订阅管理功能

**关键文件：**
- `src/screens/subscribe/SubscribeListScreen.tsx` - 订阅列表
- `src/screens/subscribe/AddSubscribeScreen.tsx` - 添加订阅
- `src/screens/subscribe/SubscribeDetailScreen.tsx` - 订阅详情

**API对接：**
- `GET /api/v1/subscribe/` - 获取订阅列表
- `POST /api/v1/subscribe/` - 新增订阅
- `PUT /api/v1/subscribe/` - 更新订阅
- `DELETE /api/v1/subscribe/{subscribe_id}` - 删除订阅
- `GET /api/v1/subscribe/refresh` - 刷新订阅

### Phase 4: 下载管理模块

**目标：** 下载管理、任务控制、实时进度

**关键文件：**
- `src/screens/download/DownloadListScreen.tsx` - 下载列表
- `src/screens/download/AddDownloadScreen.tsx` - 添加下载
- `src/services/SSEService.ts` - SSE实时推送服务
- `src/hooks/useDownload.ts` - 下载相关Hook

**API对接：**
- `GET /api/v1/download/` - 获取下载列表
- `POST /api/v1/download/` - 添加下载
- `GET /api/v1/download/start/{hash}` - 开始任务
- `GET /api/v1/download/stop/{hash}` - 暂停任务
- `DELETE /api/v1/download/{hash}` - 删除任务
- `GET /api/v1/system/progress/{type}` - SSE进度推送

**快捷操作按钮：**
- ▶️ 开始 / ⏸️ 暂停
- 🗑️ 删除
- 📁 打开文件夹

### Phase 5: 消息中心与聊天功能

**目标：** 实时消息推送和聊天交互

**关键文件：**
- `src/screens/message/MessageListScreen.tsx` - 消息列表
- `src/screens/message/ChatScreen.tsx` - 聊天界面
- `src/services/SSEService.ts` - SSE连接服务
- `src/services/ChatService.ts` - 聊天服务

**API对接：**
- `GET /api/v1/system/message` - SSE实时消息
- `POST /api/v1/message/` - 发送消息
- `POST /api/v1/message/webpush/subscribe` - WebPush订阅
- `GET /api/v1/message/web` - 获取Web消息

**聊天功能特性：**
- 消息气泡（发送/接收）
- 交互按钮支持
- 快捷命令（/search、/download、/subscribe、/status）
- 图片/链接预览
- 消息历史

### Phase 6: 优化与发布

**目标：** 性能优化、测试、应用商店发布

**优化项：**
- 图片缓存优化
- 列表虚拟化
- 启动速度优化
- 内存泄漏检查
- 错误处理完善

---

## 关键技术实现

### 认证流程

```typescript
// 1. 用户登录获取Token
POST /api/v1/login/access-token
{
  "username": "xxx",
  "password": "xxx"
}
// 返回: { "access_token": "xxx", ... }

// 2. 存储Token到安全存储
await SecureStore.setItemAsync('token', access_token);

// 3. 后续请求自动携带Token
axios.defaults.headers.Authorization = `Bearer ${token}`;
```

### SSE实时消息

```typescript
class SSEService {
  connect(token: string) {
    const eventSource = new EventSource(
      `${API_BASE}/system/message?token=${token}`
    );

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // 处理消息并更新UI
    };
  }
}
```

### 消息通知架构

```
MoviePilot后端
    │
    ├── SSE ──> 实时系统消息
    │
    ├── WebSocket ──> 聊天交互
    │
    └── WebPush ──> 推送通知
```

---

## 验证计划

### 开发阶段验证

1. **API连通性测试**
   - 使用Postman/curl测试所有API端点
   - 验证认证流程
   - 测试SSE连接

2. **功能测试**
   - 登录/登出流程
   - 媒体搜索和详情
   - 订阅CRUD操作
   - 下载任务控制
   - 消息推送和接收

3. **UI/UX测试**
   - 深色/浅色主题切换
   - 页面转场动画
   - 列表滚动性能
   - 图片加载缓存

### 端到端测试场景

```
场景1: 搜索并订阅电影
1. 启动App → 登录
2. 搜索"星际穿越"
3. 查看详情
4. 点击"订阅"按钮
5. 确认订阅添加成功

场景2: 管理下载任务
1. 进入下载页面
2. 查看下载列表
3. 暂停/继续任务
4. 查看进度更新

场景3: 聊天交互
1. 打开聊天界面
2. 发送"/search 盗梦空间"
3. 收到搜索结果
4. 点击"添加订阅"按钮
5. 确认订阅成功
```

### 发布前检查清单

- [ ] 所有API接口正常工作
- [ ] 认证Token自动刷新
- [ ] SSE连接断线自动重连
- [ ] 推送通知正常接收
- [ ] 图片缓存正常工作
- [ ] 网络异常友好提示
- [ ] 应用图标和启动图配置
- [ ] 应用商店资料准备
- [ ] 隐私政策和用户协议

---

## 开发时间估算

| 阶段 | 内容 | 时间 |
|------|------|------|
| Phase 1 | 基础架构 + 认证 + 首页 | 2-3周 |
| Phase 2 | 媒体管理模块 | 3-4周 |
| Phase 3 | 订阅管理模块 | 2-3周 |
| Phase 4 | 下载管理模块 | 2-3周 |
| Phase 5 | 消息与聊天功能 | 3-4周 |
| Phase 6 | 优化与发布 | 2-3周 |
| **总计** | | **14-20周** |

---

## 关键参考文件

后端项目关键文件（用于API对接参考）：

| 文件路径 | 用途 |
|---------|------|
| `/Users/chenpeng/Documents/claude/MoviePilot/app/api/apiv1.py` | API路由总入口 |
| `/Users/chenpeng/Documents/claude/MoviePilot/app/core/security.py` | 认证机制实现 |
| `/Users/chenpeng/Documents/claude/MoviePilot/app/api/endpoints/message.py` | 消息API实现 |
| `/Users/chenpeng/Documents/claude/MoviePilot/app/schemas/message.py` | 消息类型定义 |
| `/Users/chenpeng/Documents/claude/MoviePilot/app/schemas/` | 所有数据Schema定义 |

---

## 附录：快捷操作按钮设计规范

### 首页快捷操作区
```
┌────────────────────────────────────────┐
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │ ➕  │  │ ⬇️  │  │ 🔍  │  │ 🔄  │  │
│  │订阅 │  │下载 │  │识别 │  │刷新 │  │
│  └─────┘  └─────┘  └─────┘  └─────┘  │
└────────────────────────────────────────┘
```

### 媒体详情页操作栏
```
┌────────────────────────────────────────┐
│  [➕ 订阅]  [⬇️ 下载]  [❤️ 收藏]  [📤 分享]  │
└────────────────────────────────────────┘
```

### 聊天快捷命令
```
┌────────────────────────────────────────┐
│  [🔍 搜索]  [⬇️ 下载]  [📺 订阅]  [📊 状态]  │
└────────────────────────────────────────┘
```
