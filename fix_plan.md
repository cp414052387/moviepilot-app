# Ralph Fix Plan

## High Priority

### Phase 1: Foundation & Authentication
- [x] Configure React Native project with TypeScript
- [x] Install and configure dependencies (React Native Paper, Zustand, React Query, Axios, etc.)
- [x] Set up project directory structure
- [x] Create Axios client with interceptors for auth token injection
- [x] Implement secure storage utilities for token management
- [x] Create authentication API module (`src/api/auth.ts`)
- [x] Build LoginScreen with username/password form
- [x] Implement authStore with Zustand (login/logout state)
- [x] Create App navigation wrapper with auth flow
- [x] Implement bottom Tab Navigator (5 tabs)
- [x] Build HomeScreen with dashboard data

### Phase 2: Media Management
- [x] Create media API module (`src/api/media.ts`)
- [x] Build MediaCard component with poster display
- [x] Build Poster component with Fast Image
- [x] Create SearchScreen with search input and results list
- [x] Build MediaDetailScreen with full metadata
- [x] Implement quick action buttons (Subscribe, Download, Favorite, Share)
- [x] Add image caching and lazy loading for posters

### Phase 3: Subscription Management
- [x] Create subscription API module (`src/api/subscribe.ts`)
- [x] Build SubscribeListScreen with status indicators
- [x] Create AddSubscribeScreen with form
- [x] Build SubscribeDetailScreen
- [x] Implement subscription CRUD operations
- [x] Add manual refresh functionality

### Phase 4: Download Management
- [x] Create download API module (`src/api/download.ts`)
- [x] Build SSE service for real-time progress updates
- [x] Create useDownload hook for download state
- [x] Build DownloadListScreen with progress bars
- [x] Create AddDownloadScreen
- [x] Implement task controls (start/pause/delete)
- [x] Add progress visualization

### Phase 5: Message Center & Chat
- [x] Extend SSE service for system messages
- [x] Create ChatService for WebSocket communication
- [x] Build MessageListScreen
- [x] Create ChatScreen with message bubbles
- [x] Implement quick commands (/search, /download, /subscribe, /status)
- [x] Add interactive button support in messages
- [x] Implement WebPush notification subscription

## Medium Priority

### UI/UX Enhancements
- [x] Apply Netflix-inspired dark theme colors
- [x] Add glassmorphism effects to cards
- [x] Implement smooth page transitions with React Navigation
- [x] Add loading skeletons and spinners
- [x] Create empty state components
- [x] Add error boundary components
- [x] Implement pull-to-refresh on lists

### Navigation & Structure
- [x] Create side drawer navigation
- [x] Add Dashboard screen with system stats
- [x] Create Settings screen with theme toggle
- [x] Add server configuration screen
- [x] Implement notification preferences
- [x] Integrate extended features into navigation (History, MediaServer, Plugins, Sites)

### Extended Features
- [x] Build Discovery/Explore screen
- [x] Create Media Server screen
- [x] Add Plugins management screen
- [x] Create History screen
- [x] Build Sites management screen

## Low Priority

### Performance & Polish
- [ ] Implement list virtualization (FlatList optimization)
- [ ] Add analytics and crash reporting
- [ ] Optimize image cache size limits
- [ ] Add memory leak detection and fixes
- [ ] Implement aggressive code splitting
- [ ] Add splash screen and app icon
- [ ] Optimize app startup time

### Testing & Documentation
- [ ] Add end-to-end tests for critical flows
- [ ] Write API integration tests
- [ ] Create component storybook
- [ ] Document API integration patterns
- [ ] Create user guide documentation

### Release Preparation
- [ ] Configure app signing (iOS/Android)
- [ ] Prepare app store metadata and screenshots
- [ ] Create privacy policy and user agreement
- [ ] Set up crash reporting dashboard
- [ ] Configure push notification certificates

## Completed

- [x] Project initialization
- [x] Phase 1: Foundation & Authentication
- [x] Phase 2: Media Management
- [x] Phase 3: Subscription Management
- [x] Phase 4: Download Management
- [x] Phase 5: Message Center & Chat
- [x] Glassmorphism effects to cards
- [x] Smooth page transitions with React Navigation
- [x] Side drawer navigation
- [x] Dashboard screen with system stats
- [x] Discovery/Explore screen
- [x] Media Server screen
- [x] Plugins management screen
- [x] History screen
- [x] Sites management screen

## Notes

### API Base URL
- Production: `https://api.movie-pilot.org/api/v1/`
- All requests require Bearer token authentication (except login)

### Authentication Flow
1. POST `/login/access-token` with username/password
2. Store returned token in SecureStore
3. Axios interceptor injects `Authorization: Bearer {token}` header
4. Handle 401 responses with logout/redirect to login

### SSE Endpoints
- System messages: `/system/message?token={token}`
- Progress updates: `/system/progress/{type}?token={token}`

### Key Design Patterns
- Use React Query for server state caching and synchronization
- Use Zustand for global UI state (auth, theme, preferences)
- Create reusable API hooks for each module (useAuth, useMedia, useSubscribe, etc.)
- Implement proper error boundaries and fallback UIs

### Phase Order Recommendation
Follow the numbered phases sequentially. Each phase builds upon the previous. Focus on getting a working MVP (Phase 1) before expanding to media management (Phase 2), and so on.

### Glassmorphism Implementation
- Created `GlassCard`, `GlassBadge`, and `GlassPanel` components in `src/components/common/GlassCard.tsx`
- Updated `MediaCard` component to support optional glassmorphism effect via `glassmorphism` prop
- Glassmorphism features:
  - Semi-transparent backgrounds with blur effect
  - Subtle borders with opacity
  - Configurable blur intensity and opacity
  - Multiple tint options (light, dark, primary)
  - Badge variants (primary, secondary, success, warning, error)
  - Panel elevation levels (low, medium, high)

### Page Transitions Implementation
- Updated `navigationTheme.ts` with comprehensive transition configurations for native stack navigation
- Added platform-specific transition configurations (iOS vs Android)
- Created transition presets for different screen patterns:
  - `slide`: Default horizontal slide for standard navigation
  - `fade`: Fade transition for forms and overlays
  - `modal`: Slide from bottom for modals and chat screens
  - `none`: Instant transition for tab switching
- Applied appropriate transitions to all screens in `AppNavigator.tsx`:
  - Detail screens use slide transitions
  - Form screens (AddSubscribe, AddDownload) use fade transitions
  - Chat screens use modal transitions
  - Tab switching uses smooth fade with custom timing

### Side Drawer Navigation Implementation
- Created `SideDrawer` component in `src/components/navigation/SideDrawer.tsx`
  - Glassmorphism-styled drawer with user profile header
  - Configurable sections and items
  - Badge support for notifications
  - Logout functionality
- Created `DrawerButton` component for opening drawer
- Created `useNavigation` hook for centralized navigation management
- Integrated drawer into HomeScreen with example sections
- Drawer features:
  - User avatar and status display
  - Collapsible sections (Browse, Actions, Account)
  - Quick navigation to all main screens
  - Badge indicators for notifications
  - Smooth slide-in animation
  - Logout button in footer

### Dashboard Screen Implementation
- Created dashboard API module (`src/api/dashboard.ts`)
  - System status endpoints (server, storage, downloads)
  - Statistics endpoints (media, subscriptions, downloads, messages)
  - Recent activity endpoints
  - Utility functions for formatting (bytes, speed, uptime)
- Created `useDashboard` hook for dashboard state management
- Created dashboard components:
  - `StatCard`: Generic statistics card with trend indicators
  - `StorageStatCard`: Specialized storage statistics with progress bar
  - `DownloadStatCard`: Specialized download statistics with speed
  - `ActivityList`: Recent activity list with icons and timestamps
- Updated HomeScreen with full dashboard integration:
  - Overview section (media, subscriptions stats)
  - System section (storage, downloads)
  - Server status card (version, uptime, status)
  - Recent activity list
  - Loading and error states
  - Pull-to-refresh functionality

### Discovery/Explore Screen Implementation
- Extended media API (`src/api/media.ts`) with discovery endpoints:
  - `discoverMedia`: Filter by type, genre, year, sort
  - `getTrendingMedia`: Get trending content
  - `getPopularMedia`: Get popular content
  - `getTopRatedMedia`: Get top rated content
  - `getUpcomingMedia`: Get upcoming releases
  - `getMediaGenres`: Get genre list
  - `getRecommendedMedia`: Get recommendations
  - `getSimilarMedia`: Get similar content
- Created `useDiscover` hook for discovery state management
- Created `DiscoverScreen` component:
  - Search bar with filter button
  - Media type filter chips (All/Movies/TV)
  - Horizontal scrolling sections:
    - Trending Now
    - Popular
    - Top Rated
    - Coming Soon
  - Pull-to-refresh support
  - Navigation to media details
- Integrated DiscoverScreen into AppNavigator as default Media tab
  - Changed tab label from "Media" to "Discover"
  - Changed tab icon to compass

### Media Server Screen Implementation
- Created media server API module (`src/api/mediaServer.ts`)
  - Server endpoints: list, details, test, refresh
  - Library endpoints: list, details
  - File system endpoints: browse, file details
  - Scan endpoints: start, progress, cancel
  - Statistics and recent additions endpoints
- Created `types/mediaServer.ts` with comprehensive type definitions
- Created `useMediaServer` hook for media server state management
- Created `MediaServerScreen` component:
  - Server list with status indicators (online/offline/degraded)
  - Library browsing with file system navigation
  - Scan progress visualization with real-time updates
  - Pull-to-refresh support
  - Empty states for no servers/libraries
- Features:
  - Multi-view navigation (servers → libraries → files)
  - Status-based color indicators
  - Server type icons (Plex, Emby, Jellyfin, Local)
  - File size formatting and type icons
  - Path history navigation

### Plugin Management Screen Implementation
- Created plugin API module (`src/api/plugin.ts`)
  - Plugin endpoints: list, details, install, uninstall, update, enable, disable
  - Settings endpoints: get, update
  - Command execution and logs endpoints
  - Marketplace endpoints: browse, search, tags
  - Statistics endpoint
- Created `types/plugin.ts` with comprehensive type definitions
- Created `usePlugin` hook for plugin state management
- Created `PluginScreen` component:
  - Installed plugins list with enable/disable toggle
  - Plugin marketplace with install functionality
  - Search and tag filtering
  - Statistics overview (active plugins, available updates)
  - Pull-to-refresh support
- Features:
  - View mode toggle (Installed/Marketplace)
  - Plugin type icons and status indicators
  - Update notification chips
  - Marketplace: download counts, ratings, tags
  - Real-time installation progress

### History Screen Implementation
- Created history API module (`src/api/history.ts`)
  - History endpoints: list, stats, delete item, clear
  - Filtering by type, status, date range, search
- Created `types/history.ts` with comprehensive type definitions
- Created `useHistory` hook for history state management
- Created `HistoryScreen` component:
  - Activity history list with filtering
  - Period filter (all/today/week/month)
  - Type filter (downloads, subscriptions, scans, notifications, system)
  - Search functionality
  - Statistics overview
  - Pull-to-refresh and load more
- Features:
  - History item cards with type icons
  - Status-based color indicators
  - Relative timestamp formatting
  - Type-specific filtering with counts
  - Delete individual items
  - Empty states for no history

### Sites Management Screen Implementation
- Created site API module (`src/api/site.ts`)
  - Site endpoints: list, details, create, update, delete
  - Connection testing and enable/disable endpoints
  - Statistics endpoint
  - Site rules management endpoints
- Created `types/site.ts` with comprehensive type definitions
- Created `useSite` hook for site state management
- Created `SiteScreen` component:
  - Site list with status indicators
  - Enable/disable toggle switches
  - Connection testing
  - Type filtering (all/private/public)
  - Statistics overview
  - Pull-to-refresh support
- Features:
  - Site cards with status indicators
  - Type chips (Private/Public)
  - Download/upload counts and ratio display
  - Feature badges (RSS, Search, Priority)
  - Test connection with loading state
  - Delete functionality
  - Empty states for no sites
