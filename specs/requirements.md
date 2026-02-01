# MoviePilot Mobile - Technical Specifications

## 1. System Architecture Requirements

### 1.1 Application Architecture
- **Pattern**: Component-based architecture with clear separation of concerns
- **State Management**: Hybrid approach - Zustand for client state, React Query for server state
- **Navigation**: React Navigation v6 with stack + tab + drawer navigators
- **Module Structure**: Feature-based folder organization

### 1.2 Technology Stack Specifications

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Core Framework | React Native | 0.73+ | Cross-platform mobile framework |
| Language | TypeScript | 5.0+ | Type-safe development |
| UI Components | React Native Paper | 5.0+ | Material Design 3 components |
| State (Client) | Zustand | 4.4+ | Lightweight global state |
| State (Server) | React Query | 5.0+ | Server state management & caching |
| HTTP Client | Axios | 1.6+ | API communication with interceptors |
| Real-time (SSE) | react-native-sse | - | Server-Sent Events for live updates |
| Real-time (Chat) | WebSocket | native | Bidirectional chat communication |
| Animations | Reanimated | 3.0+ | 60fps smooth animations |
| Image Loading | react-native-fast-image | 8.0+ | Optimized image caching |
| Secure Storage | expo-secure-store | - | Encrypted token storage |
| Notifications | expo-notifications | - | Push notification support |

---

## 2. Data Models and Structures

### 2.1 Authentication Data Models

```typescript
// Login Request
interface LoginRequest {
  username: string;
  password: string;
}

// Auth Response
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// User Info
interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  level: number;
  is_admin: boolean;
}
```

### 2.2 Media Data Models

```typescript
// Media Item
interface MediaItem {
  id: string;
  tmdb_id: number;
  title: string;
  original_title: string;
  year: number;
  type: 'movie' | 'tv';
  poster_path?: string;
  backdrop_path?: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: string[];
  runtime?: number;
  seasons?: number;
}

// Media Search Response
interface MediaSearchResponse {
  results: MediaItem[];
  page: number;
  total_pages: number;
  total_results: number;
}

// Media Detail
interface MediaDetail extends MediaItem {
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: Video[];
  similar: MediaItem[];
  recommendations: MediaItem[];
}
```

### 2.3 Subscription Data Models

```typescript
// Subscription
interface Subscription {
  id: string;
  name: string;
  year: string;
  type: 'movie' | 'tv';
  tmdb_id: number;
  poster_path?: string;
  backdrop_path?: string;
  overview: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  date_added: string;
  date_completed?: string;
  seasons?: number[];
  current_season?: number;
  current_episode?: number;
  total_episodes?: number;
}

// Subscription Request
interface SubscriptionRequest {
  tmdb_id: number;
  type: 'movie' | 'tv';
  seasons?: number[];
  username?: string;
}
```

### 2.4 Download Data Models

```typescript
// Download Task
interface DownloadTask {
  hash: string;
  name: string;
  size: number;
  downloaded: number;
  progress: number;
  status: 'downloading' | 'paused' | 'seeding' | 'completed' | 'error';
  speed: number;
  eta: number;
  files: DownloadFile[];
  save_path: string;
  added_date: string;
}

// Download Progress Update (SSE)
interface DownloadProgress {
  hash: string;
  progress: number;
  downloaded: number;
  speed: number;
  eta: number;
  status: string;
}
```

### 2.5 Message Data Models

```typescript
// System Message
interface SystemMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  actions?: MessageAction[];
}

// Message Action Button
interface MessageAction {
  label: string;
  action: string;
  data?: Record<string, any>;
}

// Chat Message
interface ChatMessage {
  id: string;
  content: string;
  is_from_user: boolean;
  created_at: string;
  buttons?: ChatButton[];
  attachments?: MessageAttachment[];
}

// Chat Button
interface ChatButton {
  text: string;
  action: string;
  data?: any;
}

// Quick Command
type QuickCommand =
  | '/search'
  | '/download'
  | '/subscribe'
  | '/status';

interface CommandRequest {
  command: QuickCommand;
  params: string[];
}
```

---

## 3. API Specifications

### 3.1 Base Configuration
- **Base URL**: `https://api.movie-pilot.org/api/v1/`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **Timeout**: 30 seconds (default)

### 3.2 Authentication Endpoints

#### POST /login/access-token
Login and receive access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

#### GET /user/info
Get current user information.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "string",
  "username": "string",
  "name": "string",
  "avatar": "string",
  "level": 1,
  "is_admin": false
}
```

### 3.3 Media Endpoints

#### GET /media/search
Search for media by title.

**Query Parameters:**
- `page` (number): Page number, default 1
- `size` (number): Results per page, default 20
- `keyword` (string): Search keyword

**Response (200):**
```json
{
  "results": [MediaItem],
  "page": 1,
  "total_pages": 10,
  "total_results": 200
}
```

#### GET /media/{mediaid}
Get media details by media ID.

**Response (200):** `MediaDetail`

#### GET /tmdb/detail/{tmdbid}
Get TMDB details by TMDB ID.

**Query Parameters:**
- `type` (string): 'movie' or 'tv'

**Response (200):** `MediaDetail`

#### GET /system/img/{proxy}
Get proxied image.

**Response:** Image file (PNG/JPG)

### 3.4 Subscription Endpoints

#### GET /subscribe/
Get all subscriptions.

**Query Parameters:**
- `page` (number): Page number
- `size` (number): Results per page
- `status` (string): Filter by status

**Response (200):**
```json
{
  "results": [Subscription],
  "page": 1,
  "total_pages": 5,
  "total_results": 100
}
```

#### POST /subscribe/
Create new subscription.

**Request Body:**
```json
{
  "tmdb_id": 12345,
  "type": "movie",
  "seasons": []
}
```

**Response (201):** `Subscription`

#### PUT /subscribe/
Update existing subscription.

**Request Body:**
```json
{
  "subscribe_id": "string",
  "seasons": [1, 2]
}
```

**Response (200):** `Subscription`

#### DELETE /subscribe/{subscribe_id}
Delete subscription.

**Response (204):** No content

#### GET /subscribe/refresh
Refresh subscription status.

**Response (200):** Success message

### 3.5 Download Endpoints

#### GET /download/
Get all download tasks.

**Query Parameters:**
- `page` (number): Page number

**Response (200):**
```json
{
  "results": [DownloadTask],
  "page": 1,
  "total": 50
}
```

#### POST /download/
Add new download task.

**Request Body:**
```json
{
  "magnet": "string",
  "save_path": "string"
}
```

**Response (201):** `DownloadTask`

#### GET /download/start/{hash}
Start download task.

**Response (200):** Success message

#### GET /download/stop/{hash}
Pause download task.

**Response (200):** Success message

#### DELETE /download/{hash}
Delete download task.

**Response (204):** No content

### 3.6 Message Endpoints

#### GET /system/message (SSE)
Subscribe to real-time system messages.

**Query Parameters:**
- `token` (string): Auth token

**Event Stream:** Server sends `SystemMessage` objects

#### POST /message/
Send chat message.

**Request Body:**
```json
{
  "content": "string"
}
```

**Response (201):** `ChatMessage`

#### GET /message/web
Get web messages history.

**Response (200):**
```json
{
  "results": [ChatMessage],
  "page": 1
}
```

#### POST /message/webpush/subscribe
Subscribe to push notifications.

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "string",
    "keys": {
      "p256dh": "string",
      "auth": "string"
    }
  }
}
```

---

## 4. User Interface Requirements

### 4.1 Design System

**Color Palette (Dark Theme - Default):**
```typescript
const colors = {
  primary: '#E50914',        // Netflix red
  primaryContainer: '#B71C1C',
  secondary: '#03DAC6',
  background: '#141414',     // Deep black
  surface: '#1F1F1F',        // Card background
  surfaceVariant: '#2A2A2A',
  error: '#CF6679',
  onPrimary: '#FFFFFF',
  onBackground: '#FFFFFF',
  onSurface: '#E0E0E0',
  onSurfaceVariant: '#B3B3B3',
  outline: '#404040',
};
```

**Typography:**
- Headline Large: 32sp, Bold
- Headline Medium: 24sp, SemiBold
- Title Large: 20sp, Medium
- Body Large: 16sp, Regular
- Body Medium: 14sp, Regular
- Label Small: 12sp, Medium

**Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)

**Border Radius:**
- Small: 4px
- Medium: 8px
- Large: 16px
- Extra Large: 28px

**Elevation (Shadows):**
- Level 0: None
- Level 1: Subtle shadow
- Level 2: Medium shadow
- Level 3: Strong shadow

### 4.2 Component Specifications

#### MediaCard
- Poster image (aspect ratio 2:3)
- Title (truncated to 2 lines)
- Year badge
- Rating star with score
- Pressable with ripple effect

#### QuickActionButton
- Icon (24dp)
- Label text
- Minimum touch target 48x48dp
- Primary or secondary variant

#### MessageBubble
- Sent: Primary color, right aligned
- Received: Surface color, left aligned
- Timestamp (small, grey)
- Max width 80% of container

#### ProgressCard
- Title
- Progress bar (linear or circular)
- Percentage text
- Status indicator
- Action buttons (start/pause/delete)

### 4.3 Navigation Structure

**Bottom Tab Navigator:**
```
┌────────────────────────────────────────────────────┐
│  🏠     🎬     ⬇️     🔔     ⚙️                │
│ 首页   媒体   下载   消息   设置                  │
└────────────────────────────────────────────────────┘
```

- Home: Dashboard + Quick Actions
- Media: Search + Discovery
- Download: Active downloads list
- Message: Notifications + Chat
- Settings: Configuration

**Side Drawer:**
- Dashboard
- Subscriptions
- Discovery
- Media Server
- Plugins
- History
- Sites

### 4.4 Screen Specifications

#### LoginScreen
- Logo/branding
- Server URL input (optional, defaults to production)
- Username input
- Password input (secure)
- Login button
- Error message display
- Loading state overlay

#### HomeScreen
- Welcome message with username
- Quick action buttons (4-grid)
- Recent subscriptions carousel
- System status card
- Storage usage indicator

#### SearchScreen
- Search bar (auto-focus)
- Filter chips (Movie/TV, Year, Genre)
- Results grid (2 columns)
- Infinite scroll pagination
- Empty state with illustration

#### MediaDetailScreen
- Backdrop image with gradient overlay
- Poster thumbnail (top-right)
- Title, year, rating
- Overview (expandable)
- Genres chips
- Cast list (horizontal scroll)
- Quick actions bar (fixed bottom)
- Similar recommendations

#### SubscribeListScreen
- Status filter tabs
- Subscription cards with poster
- Status indicator
- Pull to refresh
- Swipe actions (edit/delete)
- Empty state

#### DownloadListScreen
- Active downloads section
- Completed downloads section
- Progress bars with speed/ETA
- Control buttons per item
- Pull to refresh
- Empty state

#### ChatScreen
- Message list (scrollable)
- Input field (bottom)
- Send button
- Quick command chips
- Typing indicator
- Action buttons in messages

---

## 5. Performance Requirements

### 5.1 App Performance
- **App Startup**: < 3 seconds to interactive
- **Screen Transitions**: 60fps animations
- **List Scrolling**: Maintain 60fps with 100+ items
- **Image Loading**: Progressive loading with blur hash
- **API Response**: Display skeleton within 200ms

### 5.2 Caching Strategy
- **Images**: LRU cache, max 500MB
- **API Responses**: React Query staleTime: 5 minutes
- **User Data**: Persist to SecureStore
- **Offline Support**: Cache media details for offline browsing

### 5.3 Memory Management
- Image lazy loading for lists
- Dispose unused screens from navigation stack
- Clear image cache on low memory warning
- Monitor for memory leaks (React DevTools)

---

## 6. Security Considerations

### 6.1 Authentication & Authorization
- JWT token stored in SecureStore (encrypted)
- Token expiration handling with auto-refresh
- Logout clears all secure storage
- 401 responses trigger automatic logout

### 6.2 Network Security
- HTTPS only for production API
- Certificate pinning (optional)
- Request/response logging disabled in production
- Sensitive data masked in logs

### 6.3 Data Privacy
- No sensitive data in app state logs
- User credentials never logged
- Local storage encrypted
- Permissions minimal and justified

---

## 7. Integration Requirements

### 7.1 Backend API Integration
- Base URL configurable (dev/staging/prod)
- Axios interceptors for token injection
- Centralized error handling
- Retry logic for failed requests
- Request timeout handling

### 7.2 SSE Service Integration
- Auto-reconnect on disconnect
- Exponential backoff for retries
- Connection status monitoring
- Event type dispatching
- Graceful degradation

### 7.3 Push Notification Integration
- WebPush subscription management
- Notification permission handling
- Background message handling
- Tap notification opens relevant screen

### 7.4 Deep Linking (Optional)
- URI Scheme: `moviepilot://`
- Supported routes:
  - `moviepilot://media/{tmdb_id}`
  - `moviepilot://subscription/{id}`
  - `moviepilot://download/{hash}`

---

## 8. Error Handling Requirements

### 8.1 Network Errors
- Display user-friendly message
- Retry button for failed requests
- Offline indicator when no connection
- Queue failed requests for retry

### 8.2 API Errors
- 400: Show validation error to user
- 401: Logout and redirect to login
- 403: Show "access denied" message
- 404: Show "not found" screen
- 500: Show "server error" with retry option

### 8.3 App Errors
- Global error boundary
- Crash reporting integration (Sentry optional)
- Graceful degradation for optional features
- Fallback UIs for failed components

---

## 9. Localization Support

### 9.1 Supported Languages
- Chinese (Simplified) - Primary
- English - Secondary

### 9.2 i18n Implementation
- Use i18next or react-intl
- Separate language files
- RTL support (future)
- Date/time localization

---

## 10. Testing Requirements

### 10.1 Unit Tests
- Utility functions
- Custom hooks
- Business logic services
- State management actions

### 10.2 Integration Tests
- API client with mock server
- Navigation flows
- Authentication flow
- Critical user journeys

### 10.3 E2E Test Scenarios
1. **Login Flow**: Enter credentials → Verify dashboard
2. **Search & Subscribe**: Search media → View details → Subscribe
3. **Download Management**: View downloads → Control tasks
4. **Chat Interaction**: Send command → Receive response → Action

---

## 11. Accessibility Requirements

### 11.1 Screen Reader Support
- Semantic component labels
- Accessibility hints for custom actions
- Focus order logical
- State announcements (loading, error)

### 11.2 Visual Accessibility
- Minimum touch target 48x48dp
- Color contrast ratio 4.5:1 minimum
- Scalable font size support
- High contrast mode support (optional)

---

## 12. Release Checklist

### 12.1 Pre-Release
- [ ] All API endpoints tested
- [ ] Authentication flow verified
- [ ] SSE connection stable
- [ ] Push notifications working
- [ ] Error handling complete
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility review passed

### 12.2 App Store Assets
- [ ] App icon (1024x1024)
- [ ] Splash screens (all sizes)
- [ ] Screenshots (phone + tablet)
- [ ] App store description
- [ ] Privacy policy URL
- [ ] Age rating declaration

### 12.3 Configuration
- [ ] Production API URL
- [ ] Push notification certificates
- [ ] App signing certificates
- [ ] Proguard/R8 rules (Android)
- [ ] Bitcode disabled (iOS)

---

*Document Version: 1.0*
*Last Updated: 2024*
