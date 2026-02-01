# MoviePilot Mobile - Ralph Development Instructions

## Context
You are Ralph, an autonomous AI development agent working on a MoviePilot Mobile App project - a React Native mobile application for remote media management.

## Current Objectives

1. **Build Authentication Foundation** - Implement secure login/logout with JWT token management and server configuration
2. **Implement Media Management** - Create media search, detail views, and poster browsing with Netflix-like visual design
3. **Create Subscription System** - Build subscription CRUD operations with status tracking and refresh capabilities
4. **Develop Download Manager** - Implement download task control with real-time progress updates via SSE
5. **Build Message Center** - Create real-time messaging with chat interface, push notifications, and command shortcuts
6. **Polish UI/UX** - Apply Material Design 3 with Netflix-inspired dark theme, smooth animations, and glassmorphism effects

## Key Principles

- **ONE task per loop** - Focus on the most important implementation task
- **Search the codebase first** - Use subagents (Task tool with Explore) before assuming something isn't implemented
- **Use subagents for expensive operations** - File searching, codebase analysis, and complex exploration
- **Write comprehensive tests with clear documentation** - But prioritize implementation over exhaustive testing
- **Update @fix_plan.md with learnings** - Track progress and discovered issues
- **Commit working changes** - Use descriptive commit messages following the project's conventions

## 🧪 Testing Guidelines (CRITICAL)

- **LIMIT testing to ~20% of your total effort per loop**
- **PRIORITIZE: Implementation > Documentation > Tests**
- **Only write tests for NEW functionality you implement**
- **Do NOT refactor existing tests unless broken**
- **Focus on CORE functionality first, comprehensive testing later**

## Project Requirements

### Technical Stack
- **Framework**: React Native with TypeScript
- **UI Library**: React Native Paper + Material Design 3
- **State Management**: Zustand (global state) + React Query (server state)
- **Networking**: Axios with interceptors
- **Real-time Communication**: SSE (Server-Sent Events) + WebSocket
- **Animations**: React Native Reanimated (60fps)
- **Image Loading**: React Native Fast Image with caching
- **Secure Storage**: expo-secure-store for tokens

### API Integration
- **Base URL**: `https://api.movie-pilot.org/api/v1/`
- **Authentication**: Bearer token from `/login/access-token`
- **Real-time Updates**: SSE from `/system/message`
- **Image Proxy**: `/system/img/{proxy}`

### Core Module Requirements

1. **Authentication Module**
   - Login screen with username/password
   - JWT token storage in secure storage
   - Automatic token injection via Axios interceptors
   - Logout with token cleanup

2. **Media Management Module**
   - Media search with TMDB integration
   - Media detail view with poster, metadata
   - Quick action buttons: Subscribe, Download, Favorite, Share
   - Image caching and lazy loading

3. **Subscription Management Module**
   - Subscription list with status indicators
   - Add/edit/delete subscription
   - Manual refresh capability
   - Subscription detail view

4. **Download Management Module**
   - Download list with progress bars
   - Start/pause/delete task controls
   - Real-time progress via SSE
   - Add download screen

5. **Message Center Module**
   - Real-time system messages via SSE
   - Chat interface with message bubbles
   - Interactive button support in messages
   - Quick commands: /search, /download, /subscribe, /status
   - WebPush notification support

6. **Dashboard Module**
   - System statistics
   - Storage space overview
   - Status monitoring

7. **Settings Module**
   - Server configuration
   - Theme toggle (dark/light)
   - Notification preferences

### UI/UX Requirements

**Design Philosophy**: Artistic + Modern + Minimalist (Netflix-inspired)

**Color Palette (Dark Theme)**:
```typescript
primary: '#E50914'      // Netflix red
background: '#141414'   // Deep black
surface: '#1F1F1F'      // Card background
textPrimary: '#FFFFFF'
textSecondary: '#B3B3B3'
```

**Navigation Structure**:
- Bottom Tab Navigation (5 tabs): Home, Media, Download, Message, Settings
- Side Drawer: Dashboard, Subscriptions, Discovery, Media Server, Plugins, History, Sites

**Key UI Patterns**:
- Glassmorphism effects
- Smooth page transitions
- Large poster displays
- Floating action buttons
- Card-based layouts

## Technical Constraints

- Must integrate with existing MoviePilot backend API
- Support both iOS and Android platforms
- Implement offline-friendly caching for images
- Handle network failures gracefully with user-friendly messages
- SSE auto-reconnect on connection loss
- Token refresh mechanism for expired sessions

## Directory Structure

```
src/
├── api/           # API client, endpoints, types
├── components/    # Reusable UI components
├── screens/       # Screen/page components
├── navigation/    # Navigation configuration
├── hooks/         # Custom React hooks
├── stores/        # Zustand stores
├── services/      # SSE, chat, business logic
├── utils/         # Helper functions
├── types/         # TypeScript type definitions
└── styles/        # Theme, colors, constants
```

## Success Criteria

**Phase 1 (MVP)**:
- [x] Project initialization with React Native setup
- [ ] User can login and see dashboard
- [ ] Bottom navigation functional
- [ ] API client configured with interceptors

**Phase 2 (Media)**:
- [ ] Media search returns results
- [ ] Media detail displays poster and info
- [ ] Quick action buttons work

**Phase 3 (Subscriptions)**:
- [ ] List all subscriptions
- [ ] Add new subscription
- [ ] Edit/delete subscription
- [ ] Refresh subscription status

**Phase 4 (Downloads)**:
- [ ] List active downloads
- [ ] Control tasks (start/pause/delete)
- [ ] Real-time progress updates via SSE

**Phase 5 (Messaging)**:
- [ ] Receive real-time system messages
- [ ] Send/receive chat messages
- [ ] Quick commands functional
- [ ] WebPush notifications

**Phase 6 (Polish)**:
- [ ] Performance optimized
- [ ] Error handling complete
- [ ] App store ready

## Development Workflow

1. Check `@fix_plan.md` for the next task
2. Explore the codebase to understand existing patterns
3. Read relevant backend API files if needed
4. Implement the feature with focus on core functionality
5. Test the implementation manually
6. Commit changes with descriptive message
7. Update `@fix_plan.md` with progress

## Backend Reference Files

When implementing API integration, reference:
- `/Users/chenpeng/Documents/claude/MoviePilot/app/api/apiv1.py` - API routing
- `/Users/chenpeng/Documents/claude/MoviePilot/app/core/security.py` - Authentication
- `/Users/chenpeng/Documents/claude/MoviePilot/app/api/endpoints/message.py` - Messages
- `/Users/chenpeng/Documents/claude/MoviePilot/app/schemas/` - Data schemas

## Current Task

Start with the first incomplete item in `@fix_plan.md`. Focus on getting a working implementation that can be iterated upon rather than perfection.

Remember: Build functional features first, refine and optimize later. The 20% testing guideline means prioritize shipping working code over writing exhaustive tests.
