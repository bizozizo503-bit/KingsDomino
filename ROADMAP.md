# KingsDomino — Technical Roadmap

> **Original Arabic Royal Domino Social Gaming Platform**
> Inspired by industry patterns. No code or assets copied.
> Generated: August 2026

---

## Table of Contents

1. [Unity 6 Folder Architecture](#1-unity-6-folder-architecture)
2. [Backend NestJS Architecture](#2-backend-nestjs-architecture)
3. [Database Schema](#3-database-schema)
4. [WebSocket Game Flow](#4-websocket-game-flow)
5. [Domino Game Implementation Plan](#5-domino-game-implementation-plan)
6. [Addressables Content System](#6-addressables-content-system)
7. [Blender Asset Production List](#7-blender-asset-production-list)
8. [Development Phases (MVP to Full Platform)](#8-development-phases)

---

## 1. Unity 6 Folder Architecture

### 1.1 Top-Level Project Structure

```
unity/
├── Assets/
│   ├── KingsDomino/                    ← Main project folder
│   │   ├── _Core/                      ← Shared platform code
│   │   ├── _Games/                     ← Game-specific code
│   │   ├── _UI/                        ← Shared UI system
│   │   ├── _Networking/                ← Backend communication
│   │   ├── _Audio/                     ← Audio management
│   │   ├── _Art/                       ← All art assets
│   │   ├── _Prefabs/                   ← Shared prefabs
│   │   ├── _Scenes/                    ← All scenes
│   │   ├── _Resources/                 ← Non-addressable resources
│   │   ├── _Plugins/                   ← Third-party plugins
│   │   ├── _Addressables/              ← Addressable configs
│   │   └── _Editor/                    ← Editor tools
│   ├── TextMesh Pro/                   ← TMP essentials
│   └── Scenes/                         ← (legacy, migrate out)
├── Packages/
├── ProjectSettings/
└── UserSettings/
```

### 1.2 Core Platform (`_Core/`)

```
_KingDomino/_Core/
├── bootstrap/
│   ├── AppBootstrap.cs                 ← Entry point, initializes all systems
│   ├── ServiceLocator.cs               ← Global service registry
│   ├── SystemOrder.cs                  ← Initialization order constants
│   └── SceneConfig.cs                  ← Scene name constants
│
├── platform/
│   ├── PlatformManager.cs              ← Manages app lifecycle (pause/resume/background)
│   ├── DeviceInfo.cs                   ← Device detection, performance tier
│   ├── DeepLinkHandler.cs              ← kingsdomino:// URL handling
│   ├── NotificationManager.cs          ← Local + push notification scheduling
│   └── PermissionsManager.cs           ← Runtime permission requests
│
├── config/
│   ├── GameConfig.cs                   ← ScriptableObject: global settings
│   ├── ServerConfig.cs                 ← API URLs, WebSocket URLs per environment
│   ├── AudioConfig.cs                  ← Volume levels, audio groups
│   ├── DisplayConfig.cs                ← Resolution, orientation, FPS cap
│   └── CurrencyConfig.cs               ← Coin/Gem exchange rates, VIP tiers
│
├── localization/
│   ├── LocalizationManager.cs          ← RTL/LTR switching
│   ├── ArabicHelper.cs                 ← Arabic text shaping utilities
│   ├── LanguageConfig.cs               ← Supported languages
│   └── Resources/
│       ├── ar.json                     ← Arabic strings
│       ├── en.json                     ← English strings
│       └── Fonts/
│           ├── ArabicArial SDF.asset   ← Arabic TMP font
│           └── ArabicArial SDF Fallback.asset
│
├── utils/
│   ├── Singleton.cs                    ← Generic singleton base
│   ├── ObjectPool.cs                   ← Generic object pool
│   ├── Timer.cs                        ← Server-synced timer
│   ├── MathUtils.cs                    ← Math helpers
│   ├── StringUtils.cs                  ← String formatting
│   └── CryptoUtils.cs                  ← Hash, encode/decode
```

### 1.3 Networking Layer (`_Networking/`)

```
_KingDomino/_Networking/
├── http/
│   ├── ApiClient.cs                    ← UnityWebRequest wrapper with JWT
│   ├── ApiConfig.cs                    ← Base URLs, timeouts
│   ├── RequestBuilder.cs               ← Fluent API request builder
│   ├── ApiResponse.cs                  ← Generic response wrapper
│   ├── TokenManager.cs                 ← JWT storage, refresh logic
│   ├── HttpClient.cs                   ← Singleton HTTP client
│   └── interceptors/
│       ├── AuthInterceptor.cs          ← Auto-attach Bearer token
│       ├── RetryInterceptor.cs         ← Exponential backoff retry
│       └── LoggingInterceptor.cs       ← Request/response logging
│
├── websocket/
│   ├── SocketManager.cs                ← Socket.IO connection manager
│   ├── SocketEvents.cs                 ← Event name constants
│   ├── SocketHandlers.cs               ← Event dispatcher/router
│   ├── ReconnectionHandler.cs          ← Auto-reconnect with backoff
│   └── Heartbeat.cs                    ← Connection health monitoring
│
├── models/                             ← Shared data models (C# classes)
│   ├── AuthModels.cs                   ← Login/Register/Token DTOs
│   ├── UserModels.cs                   ← Profile, stats
│   ├── WalletModels.cs                 ← Balance, transactions
│   ├── RoomModels.cs                   ← Room state, player info
│   ├── GameModels.cs                   ← Game state, moves, results
│   ├── ShopModels.cs                   ← Items, purchases
│   └── SocialModels.cs                 ← Friends, chat, notifications
│
└── sync/
    ├── StateSync.cs                    ← Server state reconciliation
    ├── PredictiveMove.cs               ← Client-side prediction
    └── ConflictResolver.cs             ← Server vs client state resolution
```

### 1.4 Shared UI System (`_UI/`)

```
_KingDomino/_UI/
├── framework/
│   ├── UIManager.cs                    ← Manages UI stack, panels
│   ├── PanelBase.cs                    ← Base class for all panels
│   ├── PopupBase.cs                    ← Base class for popups
│   ├── LoadingOverlay.cs               ← Global loading spinner
│   ├── ToastManager.cs                 ← Toast notification system
│   └── UIAnimator.cs                   ← Panel transitions (slide, fade, scale)
│
├── components/
│   ├── KingButton.cs                   ← Styled button with states
│   ├── KingToggle.cs                   ← Toggle switch
│   ├── KingSlider.cs                   ← Volume/brightness slider
│   ├── KingInputField.cs               ← TMP input with validation
│   ├── CoinDisplay.cs                  ← Animated coin counter
│   ├── GemDisplay.cs                   ← Animated gem counter
│   ├── AvatarFrame.cs                  ← Player avatar with border
│   ├── PlayerListItem.cs               ← Lobby player row
│   ├── CountdownTimer.cs               ← Visual countdown
│   ├── ConnectionIndicator.cs          ← Online/offline/reconnecting badge
│   └── RTLLayoutGroup.cs               ← Auto-reverse for RTL
│
├── panels/
│   ├── MainMenu/
│   │   ├── MainMenuPanel.cs            ← Main menu (game selection, profile, shop)
│   │   ├── GameCard.cs                 ← Individual game card in grid
│   │   └── ProfilePanel.cs             ← Player profile view/edit
│   │
│   ├── Lobby/
│   │   ├── LobbyPanel.cs               ← Room list + matchmaking
│   │   ├── RoomCreatePanel.cs          ← Create room options
│   │   ├── RoomLobbyPanel.cs           ← Room waiting area
│   │   ├── PlayerSlot.cs               ← Seat in room
│   │   └── MatchmakingPanel.cs         ← Finding match animation
│   │
│   ├── Shop/
│   │   ├── ShopPanel.cs                ← Shop main (tabs: coins, gems, items)
│   │   ├── CoinPackCard.cs             ← Coin pack display
│   │   ├── ItemCard.cs                 ← Cosmetic item display
│   │   └── PurchaseConfirmPopup.cs     ← IAP confirmation
│   │
│   ├── Social/
│   │   ├── FriendsPanel.cs             ← Friends list
│   │   ├── ChatPanel.cs                ← Chat interface
│   │   ├── ChatMessage.cs              ← Individual message bubble
│   │   ├── NotificationPanel.cs        ← Notifications list
│   │   └── PlayerSearchPopup.cs        ← Find players
│   │
│   ├── Settings/
│   │   ├── SettingsPanel.cs            ← Settings main
│   │   ├── AudioSettings.cs            ← Sound/Music sliders
│   │   ├── LanguageSettings.cs         ← Language selector
│   │   └── PrivacySettings.cs          ← Data, notifications, block list
│   │
│   └── Common/
│       ├── ConfirmPopup.cs             ← Yes/No dialog
│       ├── InfoPopup.cs                ← Information dialog
│       ├── ErrorPopup.cs               ← Error display
│       ├── CoinsInsufficientPopup.cs   ← Not enough coins
│       ├── DailyRewardPopup.cs         ← Daily login reward
│       └── VIPBadge.cs                 ← VIP level indicator
│
└── fonts/
    ├── ArabicArial SDF.asset           ← Primary Arabic font
    ├── ArabicArial SDF - Fallback.asset
    └── ArabicArialBold SDF.asset       ← Bold variant
```

### 1.5 Games Layer (`_Games/`)

```
_KingDomino/_Games/
├── GameRegistry.cs                     ← Maps game slug → GameDefinition
├── GameDefinition.cs                   ← ScriptableObject: game metadata
│
├── domino/                             ← DOMINO GAME
│   ├── DominoGame.cs                   ← Main game controller
│   ├── DominoBoard.cs                  ← Board state + rendering
│   ├── DominoTile.cs                   ← Individual tile component
│   ├── DominoHand.cs                   ← Player hand management
│   ├── DominoDeck.cs                   ← Deck (draw pile) display
│   ├── DominoRules.cs                  ← Local move validation (mirror of server)
│   ├── DominoAnimator.cs              ← Tile placement animations
│   ├── DominoEffects.cs                ← Win/lose/chain effects
│   ├── DominoAudio.cs                  ← Game-specific sounds
│   ├── DominoConfig.cs                 ← Game-specific settings
│   └── prefabs/
│       ├── Tile.prefab                 ← Single domino tile
│       ├── TilePair.prefab             ← Connected tile pair
│       ├── BoardSlot.prefab            ← Board position marker
│       └── HandContainer.prefab        ← Player hand holder
│
├── ludo/                               ← LUDO GAME (future)
│   ├── LudoGame.cs
│   ├── LudoBoard.cs
│   ├── LudoPiece.cs
│   ├── LudoDice.cs
│   └── ...
│
├── chess/                              ← CHESS GAME (future)
│   ├── ChessGame.cs
│   ├── ChessBoard.cs
│   ├── ChessPiece.cs
│   └── ...
│
└── shared/
    ├── IGameController.cs              ← Interface: game lifecycle
    ├── IGameRenderer.cs                ← Interface: visual rendering
    ├── IGameInput.cs                   ← Interface: player input handling
    ├── GameResult.cs                   ← Shared result model
    └── BaseGameController.cs           ← Abstract base implementation
```

### 1.6 Audio System (`_Audio/`)

```
_KingDomino/_Audio/
├── AudioManager.cs                     ← Singleton, manages all audio
├── MusicPlayer.cs                      ← Background music with crossfade
├── SfxPlayer.cs                        ← Sound effects with pooling
├── AudioManagerSettings.cs             ← ScriptableObject: volume defaults
└── Clips/
    ├── music/
    │   ├── main_menu.mp3               ← Lobby music
    │   ├── game_domino.mp3             ← Domino game music
    │   ├── game_ludo.mp3               ← Ludo game music
    │   └── victory.mp3                 ← Win fanfare
    ├── sfx/
    │   ├── tile_place.wav              ← Domino tile placed
    │   ├── tile_draw.wav               ← Draw from deck
    │   ├── tile_double.wav             ← Double tile placed
    │   ├── turn_chime.wav              ← Your turn notification
    │   ├── button_click.wav            ← UI button tap
    │   ├── button_back.wav             ← Back/cancel
    │   ├── coin_add.wav                ← Coins received
    │   ├── coin_spend.wav              ← Coins spent
    │   ├── win.wav                     ← Game won
    │   ├── lose.wav                    ← Game lost
    │   ├── draw_game.wav               ← Blocked game
    │   ├── player_join.wav             ← Player joined room
    │   ├── player_leave.wav            ← Player left room
    │   ├── chat_message.wav            ← Chat received
    │   ├── notification.wav            ← Push notification
    │   ├── countdown_tick.wav          ← Countdown tick
    │   ├── countdown_end.wav           ← Countdown finished
    │   └── daily_reward.wav            ← Daily reward claimed
    └── voice/
        └── (Agora handles voice — no local voice clips needed)
```

### 1.7 Art Structure (`_Art/`)

```
_KingDomino/_Art/
├── textures/
│   ├── ui/                             ← UI textures (atlased)
│   │   ├── atlas_main.png              ← Main UI sprite atlas
│   │   ├── atlas_icons.png             ← Icon sprite atlas
│   │   ├── atlas_avatar.png            ← Avatar frame borders
│   │   └── atlas_domino.png            ← Domino tile faces
│   ├── backgrounds/
│   │   ├── bg_main_menu.png            ← Main menu background
│   │   ├── bg_lobby.png                ← Lobby background
│   │   ├── bg_game_domino.png          ← Domino game table
│   │   └── bg_loading.png              ← Loading screen
│   ├── domino/
│   │   ├── tile_white.png              ← White tile body
│   │   ├── tile_black.png              ← Black tile body
│   │   ├── pips_0.png through pips_6.png  ← Pip images
│   │   └── tile_double_frame.png       ← Double-tile highlight
│   └── avatars/
│       ├── avatar_default.png          ← Default avatar
│       └── avatar_frame_gold.png       ← Gold frame
│
├── materials/
│   ├── ui/
│   │   ├── mat_panel_dark.mat          ← Dark panel material
│   │   ├── mat_button_gold.mat         ← Gold button
│   │   ├── mat_button_green.mat        ← Green button
│   │   └── mat_glow_purple.mat         ← Glow effect
│   ├── domino/
│   │   ├── mat_tile_white.mat          ← Tile white surface
│   │   ├── mat_tile_black.mat          ← Tile black surface
│   │   └── mat_board_wood.mat          ← Wooden table texture
│   └── effects/
│       ├── mat_particles_gold.mat      ← Gold particles
│       └── mat_confetti.mat            ← Confetti material
│
├── animations/
│   ├── ui/
│   │   ├── panel_slide_in.controller   ← Panel entrance
│   │   ├── panel_slide_out.controller  ← Panel exit
│   │   └── button_bounce.controller    ← Button press feedback
│   └── domino/
│       ├── tile_place.controller       ← Tile placement
│       ├── tile_flip.controller        ← Tile flip animation
│       ├── tile_draw.controller        ← Draw from deck
│       └── win_celebration.controller  ← Win celebration
│
├── particles/
│   ├── confetti_win.prefab             ← Win confetti burst
│   ├── gold_sparkle.prefab            ← Coin sparkle
│   ├── turn_glow.prefab               ← Active player glow
│   └── tile_place_ripple.prefab       ← Placement ripple
│
└── sprites/
    ├── logo.png                        ← KingsDomino logo
    ├── logo_icon.png                   ← App icon
    ├── icon_512.png                    ← Play Store icon
    ├── icon_1024.png                   ← High-res icon
    └── splash.png                      ← Splash screen
```

### 1.8 Scenes (`_Scenes/`)

```
_KingDomino/_Scenes/
├── SC_Bootstrap.unity                  ← App initialization (never unloaded)
├── SC_Loading.unity                    ← Loading/splash screen
├── SC_Auth.unity                       ← Login/Register
├── SC_MainMenu.unity                   ← Main menu + game selection
├── SC_Lobby.unity                      ← Room browser + matchmaking
├── SC_Shop.unity                       ← Shop (or overlay)
├── SC_Profile.unity                    ← Profile view/edit
├── SC_Settings.unity                   ← Settings
└── SC_Game_Domino.unity                ← Domino game scene
    (future: SC_Game_Ludo.unity, SC_Game_Chess.unity)
```

### 1.9 Plugins (`_Plugins/`)

```
_KingDomino/_Plugins/
├── TextMeshPro/                        ← TMP essentials
├── DOTween/                            ← DOTween (free)
├── DOTweenPro/                         ← DOTween Pro (licensed)
├── UniTask/                            ← UniTask async
├── Addressables/                       ← Unity Addressables
├── Agora/                              ← Agora RTC SDK for Unity
├── Spine/                              ← Spine Unity runtime
└── NativePlugins/
    └── Android/
        └── libs/                        ← Agora .aar files
```

### 1.10 Editor Tools (`_Editor/`)

```
_KingDomino/_Editor/
├── BuildPipeline/
│   ├── BuildAndroid.cs                 ← One-click Android build
│   ├── BuildiOS.cs                     ← One-click iOS build
│   └── BuildConfig.cs                  ← Environment selection
├── Tools/
│   ├── FontGenerator.cs                ← Arabic SDF font generation
│   ├── SceneBuilder.cs                 ← Programmatic scene creation
│   ├── AddressableBuilder.cs           ← Addressable build automation
│   └── DevConsole.cs                   ← In-editor debug console
└── Automation/
    ├── TestRunner.cs                   ← Run tests from editor
    └── LintChecker.cs                  ← Code style validation
```

---

## 2. Backend NestJS Architecture

### 2.1 Module Map (Complete)

```
src/
├── main.ts                              ← Bootstrap + validation
├── app.module.ts                        ← Root module
│
├── core/                                ← PLATFORM FOUNDATION (new)
│   ├── config/                          ✅ Exists (ConfigModule)
│   ├── database/                        ← TypeORM migrations
│   │   ├── migrations/                  ← Version-controlled DDL
│   │   └── data-source.ts              ← Migration runner config
│   ├── redis/                           ← Redis module
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts             ← Cache, pub/sub, locks
│   │   └── redis.provider.ts
│   ├── queue/                           ← BullMQ job queues
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts
│   │   └── processors/                  ← Job processors
│   │       ├── matchmaking.processor.ts
│   │       ├── notification.processor.ts
│   │       └── reward.processor.ts
│   └── storage/                         ← File storage (S3/MinIO)
│       ├── storage.module.ts
│       └── storage.service.ts
│
├── auth/                                ✅ KEEP AS-IS
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── dto/
│   └── strategies/
│
├── users/                               ⚠️ EXTEND
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts              ← NEW: profile endpoints
│   └── entities/
│       └── user.entity.ts               ⚠️ ADD: avatar_url, bio, level, xp
│
├── wallet/                              ✅ KEEP AS-IS
│   ├── wallet.module.ts
│   ├── wallet.service.ts
│   ├── wallet.controller.ts
│   └── entities/
│       ├── wallet.entity.ts
│       └── wallet-transaction.entity.ts
│
├── coupons/                             ✅ KEEP AS-IS
│   ├── coupons.module.ts
│   ├── coupons.service.ts
│   ├── coupons.controller.ts
│   └── entities/
│       ├── coupon.entity.ts
│       └── coupon-redemption.entity.ts
│
├── common/                              ✅ KEEP + EXTEND
│   ├── common.module.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts           ← NEW: role-based access
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── ws-jwt.guard.ts
│   │   └── roles.guard.ts              ← NEW: role guard
│   └── interceptors/
│       ├── logging.interceptor.ts       ← NEW: request logging
│       └── transform.interceptor.ts     ← NEW: response transform
│
├── social/                              ← NEW MODULE GROUP
│   ├── friends/
│   │   ├── friends.module.ts
│   │   ├── friends.service.ts
│   │   ├── friends.controller.ts
│   │   └── entities/
│   │       └── friendship.entity.ts
│   ├── chat/
│   │   ├── chat.module.ts
│   │   ├── chat.service.ts
│   │   ├── chat.gateway.ts              ← WebSocket chat
│   │   └── entities/
│   │       ├── message.entity.ts
│   │       ├── conversation.entity.ts
│   │       └── conversation-member.entity.ts
│   ├── presence/
│   │   ├── presence.module.ts
│   │   ├── presence.service.ts          ← Online/offline via Redis
│   │   └── presence.gateway.ts          ← Tracks connections
│   └── notifications/
│       ├── notifications.module.ts
│       ├── notifications.service.ts
│       ├── notifications.controller.ts
│       └── entities/
│           └── notification.entity.ts
│
├── platform/                            ← NEW MODULE GROUP
│   ├── games/
│   │   ├── games.module.ts
│   │   ├── games.service.ts
│   │   ├── games.controller.ts
│   │   └── entities/
│   │       └── game.entity.ts
│   ├── rooms/                           ⚠️ REWRITE
│   │   ├── rooms.module.ts
│   │   ├── rooms.service.ts            ← Persistent, game-agnostic
│   │   ├── rooms.controller.ts
│   │   └── entities/
│   │       ├── room.entity.ts
│   │       └── room-player.entity.ts
│   ├── matchmaking/
│   │   ├── matchmaking.module.ts
│   │   ├── matchmaking.service.ts
│   │   ├── matchmaking.gateway.ts
│   │   └── entities/
│   │       └── matchmaking-entry.entity.ts
│   ├── game-results/
│   │   ├── game-results.module.ts
│   │   ├── game-results.service.ts
│   │   ├── game-results.controller.ts
│   │   └── entities/
│   │       └── game-result.entity.ts
│   ├── tournaments/
│   │   ├── tournaments.module.ts
│   │   ├── tournaments.service.ts
│   │   ├── tournaments.controller.ts
│   │   └── entities/
│   │       ├── tournament.entity.ts
│   │       └── tournament-participant.entity.ts
│   ├── leaderboard/
│   │   ├── leaderboard.module.ts
│   │   ├── leaderboard.service.ts
│   │   ├── leaderboard.controller.ts
│   │   └── entities/
│   │       └── leaderboard-entry.entity.ts
│   ├── shop/
│   │   ├── shop.module.ts
│   │   ├── shop.service.ts
│   │   ├── shop.controller.ts
│   │   └── entities/
│   │       ├── shop-item.entity.ts
│   │       └── user-inventory.entity.ts
│   ├── rewards/
│   │   ├── rewards.module.ts
│   │   ├── rewards.service.ts
│   │   └── entities/
│   │       ├── daily-reward.entity.ts
│   │       └── achievement.entity.ts
│   └── admin/
│       ├── admin.module.ts
│       ├── admin.controller.ts
│       └── admin.service.ts
│
├── games/                               ← GAME PLUGINS
│   └── domino/
│       ├── domino.module.ts
│       ├── domino.service.ts            ← Rules engine (pure logic)
│       ├── domino.gateway.ts            ← Game-specific WS events
│       ├── domino.state.ts              ← State machine definition
│       └── domino.constants.ts          ← Tile definitions, scoring
│
├── gateway/                             ← CENTRALIZED WEBSOCKET
│   ├── gateway.module.ts
│   ├── gateway.gateway.ts               ← Auth, routing, presence
│   └── handlers/
│       ├── room.handler.ts              ← Room WS events
│       ├── game.handler.ts              ← Game WS events
│       ├── social.handler.ts            ← Chat/friend WS events
│       └── notification.handler.ts      ← Push WS events
│
└── seed-test-coupon.ts
```

### 2.2 Existing Entity Extensions

```typescript
// User entity — ADD these columns:
@Column({ nullable: true })
avatar_url: string;

@Column({ nullable: true, length: 200 })
bio: string;

@Column({ type: 'int', default: 0 })
level: number;

@Column({ type: 'int', default: 0 })
xp: number;

@Column({ type: 'int', default: 0 })
total_games_played: number;

@Column({ type: 'int', default: 0 })
total_games_won: number;

@Column({ nullable: true })
last_seen_at: Date;

@Column({ type: 'enum', enum: OnlineStatus, default: OnlineStatus.OFFLINE })
online_status: OnlineStatus;
```

### 2.3 API Route Map

```
AUTH (public):
  POST /auth/register
  POST /auth/login
  POST /auth/refresh

USERS (authenticated):
  GET    /api/users/me                    ← My profile
  PATCH  /api/users/me                    ← Update profile
  GET    /api/users/:id                   ← Public profile
  PATCH  /api/users/me/avatar             ← Upload avatar

WALLET (authenticated):
  GET    /api/wallet/me                   ← Balance
  GET    /api/wallet/me/transactions      ← History

COUPONS (authenticated):
  POST   /api/coupons/redeem              ← Redeem coupon

GAMES (authenticated):
  GET    /api/games                       ← List available games
  GET    /api/games/:slug                 ← Game metadata

ROOMS (authenticated):
  POST   /api/rooms                       ← Create room
  GET    /api/rooms                       ← List public rooms
  GET    /api/rooms/:code                 ← Room details
  POST   /api/rooms/:code/join            ← Join room
  POST   /api/rooms/:code/leave           ← Leave room
  POST   /api/rooms/:code/start           ← Start game (host only)
  POST   /api/rooms/:code/kick            ← Kick player (host only)

MATCHMAKING (authenticated):
  POST   /api/matchmaking/join            ← Enter queue
  DELETE /api/matchmaking/leave           ← Leave queue
  GET    /api/matchmaking/status          ← Queue status

GAME RESULTS (authenticated):
  GET    /api/results/me                  ← My game history
  GET    /api/results/me/stats            ← My statistics

SHOP (authenticated):
  GET    /api/shop/items                  ← List items
  POST   /api/shop/buy                    ← Purchase item
  GET    /api/shop/me/inventory           ← My inventory
  POST   /api/shop/equip                  ← Equip item

FRIENDS (authenticated):
  GET    /api/friends                     ← My friends list
  POST   /api/friends/request             ← Send request
  POST   /api/friends/accept/:id          ← Accept request
  DELETE /api/friends/reject/:id          ← Reject request
  DELETE /api/friends/:id                 ← Remove friend
  POST   /api/friends/block/:id           ← Block player
  GET    /api/friends/online              ← Online friends

LEADERBOARD (authenticated):
  GET    /api/leaderboard/:game           ← Top players
  GET    /api/leaderboard/:game/me        ← My rank

Tournaments (authenticated):
  GET    /api/tournaments                 ← Active tournaments
  POST   /api/tournaments/:id/join        ← Join tournament
  GET    /api/tournaments/:id/bracket     ← Tournament bracket

NOTIFICATIONS (authenticated):
  GET    /api/notifications               ← My notifications
  PATCH  /api/notifications/:id/read      ← Mark as read
  PATCH  /api/notifications/read-all      ← Mark all read

DAILY REWARDS (authenticated):
  POST   /api/rewards/daily               ← Claim daily reward
  GET    /api/rewards/daily/status        ← Today's reward status

ADMIN (admin role):
  GET    /api/admin/users                 ← List users
  PATCH  /api/admin/users/:id             ← Modify user
  POST   /api/admin/coupons               ← Create coupon
  GET    /api/admin/stats                 ← Platform stats
```

### 2.4 WebSocket Event Map

```
CLIENT → SERVER:
  joinRoom          { roomCode, playerName }
  leaveRoom         { roomCode }
  startGame         { roomCode }
  playMove          { roomCode, moveData }        ← Game-agnostic
  chat              { roomCode, message }
  typing            { roomCode }
  
  // Domino-specific:
  domino:play       { roomCode, tileIndex, side }
  domino:pass       { roomCode }
  
  // Social:
  friend:request    { targetUserId }
  friend:accept     { requestId }
  
  // Matchmaking:
  matchmaking:join  { gameSlug }
  matchmaking:leave {}

SERVER → CLIENT:
  roomUpdated       { room }                      ← Room state update
  gameStarted       { gameState, myHand }         ← Per-player private data
  movePlayed        { move, nextPlayer, board }   ← Move broadcast
  gameFinished      { results, rewards }          ← Game end
  
  // Domino-specific:
  domino:moved      { tile, board, nextPlayer, skippedPlayers, blocked }
  domino:turnSkip   { skippedPlayers, nextPlayer }
  
  // Social:
  chat:message      { senderId, senderName, message, timestamp }
  friend:request    { fromUserId, fromUsername }
  friend:online     { userId }
  friend:offline    { userId }
  
  // Notifications:
  notification      { type, title, body, data }
  
  // System:
  gameError         { message, code }
  connectionLost    { reason }
  reconnecting      { attempt }
  reconnectSuccess  { missedEvents }
  
  // Matchmaking:
  matchmaking:found { roomCode, players }
  matchmaking:count { position }
```

---

## 3. Database Schema

### 3.1 Complete Entity-Relationship Diagram

```
                    ┌──────────────┐
                    │    users     │
                    │──────────────│
                    │ id (UUID PK) │
                    │ username     │◄──────────────────────────────────┐
                    │ email        │                                   │
                    │ password_hash│                                   │
                    │ display_name │                                   │
                    │ avatar_url   │                                   │
                    │ bio          │                                   │
                    │ role         │                                   │
                    │ is_active    │                                   │
                    │ level        │                                   │
                    │ xp           │                                   │
                    │ online_status│                                   │
                    │ auth_provider│                                   │
                    │ last_seen_at │                                   │
                    │ created_at   │                                   │
                    │ updated_at   │                                   │
                    └──────┬───────┘                                   │
                           │                                           │
           ┌───────────────┼───────────────┬──────────────────┐        │
           │               │               │                  │        │
    ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐  ┌───────▼──────┐│
    │  wallets    │  │ friendships│  │  messages   │  │ notifications││
    │─────────────│  │───────────│  │─────────────│  │──────────────││
    │ id (UUID)   │  │ id (UUID) │  │ id (UUID)   │  │ id (UUID)    ││
    │ user_id FK──┼─►│ requester │  │ sender_id FK│  │ user_id FK───┼┘
    │ balance     │  │ addressee │  │ conv_id FK  │  │ type         │
    │ version     │  │ status    │  │ content     │  │ title        │
    │ last_daily  │  │ created_at│  │ type        │  │ body         │
    │ created_at  │  │ updated_at│  │ created_at  │  │ data (JSON)  │
    │ updated_at  │  └───────────┘  └─────────────┘  │ is_read      │
    └──────┬──────┘       │                │          │ created_at   │
           │               │          ┌─────▼─────┐   └──────────────┘
           │               │          │conversations│
           │               │          │───────────│
           │               │          │ id (UUID) │
           │               │          │ type      │
           │               │          │ created_at│
           │               │          └─────┬─────┘
           │               │                │
           │          ┌────▼────────────────▼────┐
           │          │ conversation_members      │
           │          │─────────────────────────│
           │          │ conversation_id FK       │
           │          │ user_id FK               │
           │          │ role, joined_at          │
           │          └─────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  wallet_transactions    │
    │─────────────────────────│
    │ id (UUID)               │
    │ wallet_id FK            │
    │ type (CREDIT/DEBIT)     │
    │ source                  │
    │ amount                  │
    │ balance_after           │
    │ idempotency_key         │
    │ reference_id            │
    │ metadata (JSON)         │
    │ created_at              │
    └─────────────────────────┘

    ┌─────────────────┐
    │     games        │
    │─────────────────│
    │ id (UUID PK)    │◄────────────────────────────────┐
    │ slug UNIQUE      │                                 │
    │ name             │                                 │
    │ name_en          │                                 │
    │ description      │                                 │
    │ icon_url         │                                 │
    │ min_players      │                                 │
    │ max_players      │                                 │
    │ is_active        │                                 │
    │ sort_order       │                                 │
    │ config (JSON)    │                                 │
    │ created_at       │                                 │
    └────────┬────────┘                                 │
             │                                          │
    ┌────────▼────────────────────────────────┐         │
    │                rooms                     │         │
    │─────────────────────────────────────────│         │
    │ id (UUID PK)                            │         │
    │ code VARCHAR(6) UNIQUE                  │         │
    │ game_id FK ─────────────────────────────┼─────────┘
    │ host_id FK ───► users.id                │
    │ name                                    │
    │ status (WAITING/PLAYING/FINISHED)       │
    │ max_players                             │
    │ is_private                              │
    │ room_data (JSON)                        │
    │ created_at, updated_at                  │
    │ started_at, finished_at                 │
    └────────┬────────────────────────────────┘
             │
    ┌────────▼────────────────┐
    │     room_players         │
    │─────────────────────────│
    │ id (UUID PK)            │
    │ room_id FK ───► rooms   │
    │ user_id FK ───► users   │
    │ role (HOST/PLAYER)      │
    │ status (JOINED/READY/   │
    │         PLAYING/LEFT)   │
    │ seat                    │
    │ joined_at, left_at      │
    └─────────────────────────┘

    ┌─────────────────────────┐
    │     game_results         │
    │─────────────────────────│
    │ id (UUID PK)            │
    │ room_id FK              │
    │ game_id FK              │
    │ winner_id FK (nullable) │
    │ result_data (JSON)      │
    │ rewards_granted (JSON)  │
    │ finished_at             │
    └─────────────────────────┘

    ┌──────────────────────────┐
    │   matchmaking_queue       │
    │──────────────────────────│
    │ id (UUID PK)             │
    │ user_id FK               │
    │ game_id FK               │
    │ rating (int)             │
    │ metadata (JSON)          │
    │ queued_at                │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │    leaderboard_entries    │
    │──────────────────────────│
    │ id (UUID PK)             │
    │ user_id FK               │
    │ game_id FK               │
    │ period (ALL_TIME/SEASON) │
    │ score (bigint)           │
    │ rank (int)               │
    │ season (varchar)         │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │      shop_items           │
    │──────────────────────────│
    │ id (UUID PK)             │
    │ slug UNIQUE              │
    │ name, name_en            │
    │ category                 │
    │ price_coins              │
    │ price_gems               │
    │ rarity                   │
    │ icon_url                 │
    │ is_active                │
    │ sort_order               │
    └──────────┬───────────────┘
               │
    ┌──────────▼───────────────┐
    │    user_inventory         │
    │──────────────────────────│
    │ id (UUID PK)             │
    │ user_id FK               │
    │ item_id FK               │
    │ equipped (bool)          │
    │ acquired_at              │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │      user_stats           │
    │──────────────────────────│
    │ id (UUID PK)             │
    │ user_id FK               │
    │ game_id FK               │
    │ games_played             │
    │ games_won                │
    │ games_drawn              │
    │ total_score              │
    │ best_score               │
    │ current_streak           │
    │ best_streak              │
    │ last_played_at           │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │    daily_rewards          │
    │──────────────────────────│
    │ id (UUID PK)             │
    │ user_id FK               │
    │ day_number (1-30)        │
    │ claimed_at               │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │     coupons               │  ✅ EXISTS
    │──────────────────────────│
    │ id, code, reward_amount  │
    │ max_redemptions_total    │
    │ max_redemptions_per_user │
    │ expires_at, is_active    │
    └──────────┬───────────────┘
               │
    ┌──────────▼───────────────┐
    │  coupon_redemptions       │  ✅ EXISTS
    │──────────────────────────│
    │ id, coupon_id, user_id   │
    │ wallet_transaction_id    │
    │ redeemed_at              │
    └──────────────────────────┘
```

### 3.2 Table Summary

| Table | Status | Purpose |
|-------|--------|---------|
| `users` | ✅ Exists (extend) | User accounts |
| `wallets` | ✅ Exists | Coin balance |
| `wallet_transactions` | ✅ Exists | Transaction audit trail |
| `coupons` | ✅ Exists | Promotional codes |
| `coupon_redemptions` | ✅ Exists | Redemption history |
| `games` | NEW | Game registry |
| `rooms` | REWRITE | Persistent rooms |
| `room_players` | NEW | Room membership |
| `game_results` | NEW | Match history |
| `matchmaking_queue` | NEW | Match queue |
| `leaderboard_entries` | NEW | Rankings |
| `friendships` | NEW | Social graph |
| `conversations` | NEW | Chat conversations |
| `conversation_members` | NEW | Conversation participants |
| `messages` | NEW | Chat messages |
| `notifications` | NEW | In-app notifications |
| `shop_items` | NEW | Item catalog |
| `user_inventory` | NEW | Owned items |
| `user_stats` | NEW | Per-game statistics |
| `daily_rewards` | NEW | Login reward tracking |
| `tournaments` | NEW | Tournament definitions |
| `tournament_participants` | NEW | Tournament entries |

**Total: 22 tables** (5 existing + 17 new)

---

## 4. WebSocket Game Flow

### 4.1 Connection Lifecycle

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Unity Client │────►│ Socket.IO    │────►│ GameGateway      │
│              │     │ Connection   │     │ handleConnection │
│              │     │              │     │                  │
│              │     │ Auth: {token}│     │ Verify JWT       │
│              │     │              │     │ Store userId     │
│              │     │              │     │ Track in Redis   │
│              │◄────│ Connected    │◄────│ Emit: welcome    │
└─────────────┘     └──────────────┘     └──────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Auto-reconnect │
                    │ with backoff   │
                    │ 1s → 2s → 4s   │
                    │ → 8s → 16s max │
                    └────────────────┘
```

### 4.2 Room Lifecycle Flow

```
Phase 1: CREATE
  Host ──POST /api/rooms──► Server creates room
  Host ──WS: joinRoom─────► Server: joinRoom, emit roomUpdated

Phase 2: JOIN
  Player ──POST /api/rooms/:code/join──► Server validates
  Player ──WS: joinRoom────────────────► Server: joinRoom, emit roomUpdated

Phase 3: READY (optional)
  Player ──WS: playerReady────► Server: update status, emit roomUpdated

Phase 4: START (host only)
  Host ──WS: startGame──────► Server validates host + player count
  Server: deal tiles, set turn
  Server: emit gameStarted (per-player with private hand)
  Server: emit roomUpdated (status=playing)

Phase 5: PLAY
  CurrentPlayer ──WS: domino:play──► Server validates
  Server: orient tile, update board
  Server: advance turn (with skip logic)
  Server: check winner / blocked
  Server: emit domino:moved (per-player data)
  └─► NextPlayer's turn (or skip chain)

Phase 6: FINISH
  Server detects: winner OR blocked
  Server: calculate rewards, record result
  Server: emit gameFinished (results + rewards)
  Server: update room status=finished
  Server: cleanup after TTL
```

### 4.3 Domino Move Flow (Detailed)

```
Client sends:
  { event: "domino:play", data: { roomCode, tileIndex } }

Server processes:
  1. Validate: JWT exists
  2. Validate: room exists and is playing
  3. Validate: it's this player's turn
  4. Validate: tile exists in player's hand
  5. Determine placement side (left/right/both)
  6. Validate: tile matches board endpoint
  7. Orient tile (flip if needed)
  8. Remove tile from hand
  9. Add oriented tile to board
  10. Check: hand empty? → WINNER
  11. Advance turn:
      a. Find next player in rotation
      b. Check if they have playable tiles
      c. If no → skip, log skipped player
      d. Repeat until playable player found OR full circle
      e. Full circle → BLOCKED game
  12. Record result if finished
  13. Calculate rewards
  14. Broadcast to all players:

Per-player broadcast:
  ┌─────────────────────────────────────────────┐
  │ For EACH player in room:                     │
  │   - tile: only the playing player's tile     │
  │   - board: full board state (public)         │
  │   - currentPlayer: who goes next             │
  │   - winner: if game ended                    │
  │   - blocked: if game ended (no moves)        │
  │   - skippedPlayers: who was skipped          │
  │   - myHandCount: THIS player's hand size     │
  │   - handsCount: ALL players' hand sizes      │
  └─────────────────────────────────────────────┘
```

### 4.4 Reconnection Flow

```
Client detects disconnection:
  1. Show "Connection lost" overlay
  2. Attempt reconnect (exponential backoff)
  3. On reconnect:
     a. Re-authenticate with JWT
     b. Request current state for all joined rooms
     c. Server sends: missedEvents[] + currentState
     d. Client reconciles state
     e. Remove overlay, resume
```

### 4.5 Turn Skip Flow

```
After Player A plays:
  Server checks Player B: hasPlayableTile?
  ├─ YES → currentPlayer = B, broadcast normally
  └─ NO → skip B
         Server checks Player C: hasPlayableTile?
         ├─ YES → currentPlayer = C, broadcast { skippedPlayers: [B] }
         └─ NO → skip C
                Server checks Player A (wraps around): hasPlayableTile?
                ├─ YES → currentPlayer = A, broadcast { skippedPlayers: [B,C] }
                └─ NO → BLOCKED GAME
                       broadcast { blocked: true, skippedPlayers: [B,C,A] }
```

### 4.6 Chat Flow

```
Client: { event: "chat", data: { roomCode, message } }
Server:
  1. Validate: player is in room
  2. Validate: message length ≤ 200
  3. Sanitize: strip HTML/script
  4. Broadcast to room: { senderId, senderName, message, timestamp }
  5. Store in DB (if persistent chat desired)
```

---

## 5. Domino Game Implementation Plan

### 5.1 Game State Machine

```
                    ┌─────────────┐
                    │   LOBBY     │
                    │ (waiting)   │
                    └──────┬──────┘
                           │ host starts
                           ▼
                    ┌─────────────┐
                    │  DEALING    │
                    │ (7 tiles    │
                    │  per player)│
                    └──────┬──────┘
                           │ dealt
                           ▼
                    ┌─────────────┐
              ┌────►│ YOUR TURN   │◄────┐
              │     │             │     │
              │     └──────┬──────┘     │
              │            │ plays tile  │
              │            ▼             │
              │     ┌─────────────┐     │
              │     │  VALIDATING │     │
              │     │ (server     │     │
              │     │  checks)    │     │
              │     └──────┬──────┘     │
              │            │ valid      │
              │            ▼             │
              │     ┌─────────────┐     │
              │     │  PLACING    │     │
              │     │ (orient +   │     │
              │     │  add to     │     │
              │     │  board)     │     │
              │     └──────┬──────┘     │
              │            │ placed     │
              │            ▼             │
              │     ┌─────────────┐     │
              │     │  CHECKING   │     │
              │     └──┬───┬───┬──┘     │
              │        │   │   │        │
              │  empty │   │   │ playable│
              │  hand  │   │   │ tiles  │
              │        ▼   │   ▼        │
              │  ┌────────┐│ ┌────────┐ │
              │  │ WINNER ││ │ ADVANCE│─┘
              │  └────────┘│ │ TURN   │
              │            │ └────────┘
              │            │ no one
              │            │ can play
              │            ▼
              │     ┌─────────────┐
              │     │  BLOCKED    │
              │     └──────┬──────┘
              │            │
              │            ▼
              │     ┌─────────────┐
              └────►│  FINISHED   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  CLEANUP    │
                    │ (after TTL) │
                    └─────────────┘
```

### 5.2 Server-Side Game State

```typescript
interface DominoGameState {
  // Players
  players: string[];                    // Ordered player IDs
  hands: Record<string, Domino[]>;     // Private: each player's tiles
  
  // Board
  board: Domino[];                      // Ordered tiles on the table
  leftEnd: number;                      // Cached left endpoint value
  rightEnd: number;                     // Cached right endpoint value
  
  // Turn
  currentPlayer: string;               // Whose turn it is
  turnNumber: number;                   // Total moves made
  
  // Deck
  drawPile: Domino[];                   // Remaining tiles (future: draw variant)
  
  // Status
  status: 'dealing' | 'playing' | 'finished';
  finishReason: 'normal' | 'blocked' | null;
  winner: string | null;
  
  // History (for replay)
  moveHistory: DominoMove[];
}

interface DominoMove {
  playerId: string;
  tile: Domino;
  side: 'left' | 'right';
  timestamp: number;
}

interface Domino {
  left: number;   // 0-6
  right: number;  // 0-6
}
```

### 5.3 Tile Distribution (Double-Six Set)

```
Total tiles: 28
  [0|0] [0|1] [0|2] [0|3] [0|4] [0|5] [0|6]
  [1|1] [1|2] [1|3] [1|4] [1|5] [1|6]
  [2|2] [2|3] [2|4] [2|5] [2|6]
  [3|3] [3|4] [3|5] [3|6]
  [4|4] [4|5] [4|6]
  [5|5] [5|6]
  [6|6]

Distribution (4 players × 7 tiles = 28):
  All tiles dealt. No draw pile.
  Standard competitive domino rules.

Distribution (2-3 players × 7 tiles):
  Remaining tiles form draw pile (for future draw variant).
```

### 5.4 Board Orientation Rules

```
Board representation: Domino[] (ordered array)

Initial state: board = []
After first play: board = [{left: X, right: Y}]

Left endpoint:  board[0].left
Right endpoint: board[board.length - 1].right

Placement rules:
  RIGHT END: tile.left === rightEnd → append, new rightEnd = tile.right
  RIGHT END: tile.right === rightEnd → flip → append, new rightEnd = tile.left
  LEFT END:  tile.right === leftEnd → prepend, new leftEnd = tile.left
  LEFT END:  tile.left === leftEnd → flip → prepend, new leftEnd = tile.right

Priority (when both ends match):
  Default to RIGHT END (standard convention).
```

### 5.5 Win Condition

```
Standard:
  First player to empty their hand wins.
  Winner = player whose hand.length === 0 after playing.

Blocked Game:
  No player has a playable tile.
  Detection: advanceTurn cycles through all players, none can play.
  Result: game ends, no winner (or: player with fewest pips wins — future).
```

### 5.6 Scoring (Future Phase)

```
Standard scoring (not MVP):
  Winner gets sum of all opponents' remaining pips.
  Example: 3 opponents have [3, 7, 11] pips → winner gets 21 points.

Season scoring:
  Games won = ranking points
  ELO rating per game type
  Season resets monthly
```

### 5.7 Client-Side Prediction

```
Unity client can predict:
  1. Their own move (place tile locally immediately)
  2. Turn advancement (advance to next player)
  3. Board update (add oriented tile)

Unity client CANNOT predict:
  1. Whether server accepts the move (server validates)
  2. Other players' hands
  3. Skipped players (depends on server state)
  4. Winner/block detection (server calculates)

Reconciliation:
  Client shows predicted state immediately.
  Server confirms → keep predicted state.
  Server rejects → revert to server state + show error.
```

---

## 6. Addressables Content System

### 6.1 Addressable Groups

```
Addressable Groups:
├── [Unity Resources]                    ← Default Unity resources
├── [Local Fonts]                        ← Arabic SDF fonts (always loaded)
├── [Local UI]                           ← Core UI sprites, atlases
├── [Local Scenes]                       ← Bootstrap, Auth, Loading scenes
├── [Remote Scenes]                      ← Game scenes (downloaded on demand)
├── [Local Audio]                        ← Core audio (button clicks, UI sfx)
├── [Remote Audio]                       ← Game-specific audio
├── [Remote Art Domino]                  ← Domino game textures, materials
├── [Remote Art Ludo]                    ← Ludo game textures (future)
├── [Remote Art Chess]                   ← Chess game textures (future)
├── [Remote Effects]                     ← Particle effects, VFX
├── [Remote Animations]                  ← Spine data, animation controllers
└── [Remote Bundles]                     ← Config/data bundles
```

### 6.2 Label System

```
Labels:
  "font"          ← Font assets
  "ui-core"       ← Essential UI (always available)
  "ui-game"       ← Game-specific UI
  "audio-core"    ← Core audio
  "audio-game"    ← Game-specific audio
  "art-domino"    ← Domino visual assets
  "art-ludo"      ← Ludo visual assets
  "scene-game"    ← Game scenes
  "config"        ← Configuration data
  "effect"        ← Particle effects
```

### 6.3 Content Loading Strategy

```
App Launch:
  1. Load [Local Fonts] — Arabic SDF (critical)
  2. Load [Local UI] — Core UI elements
  3. Load [Local Audio] — UI sounds
  4. Show Loading screen
  5. Check for remote catalog update
  6. Download updated catalog if available

Enter Game (e.g., Domino):
  1. Preload [Remote Art Domino]
  2. Preload [Remote Audio] for domino
  3. Preload [Remote Scenes] SC_Game_Domino
  4. Load scene
  5. Start game

Exit Game:
  1. Unload game scene
  2. Release [Remote Art Domino] if memory pressure
  3. Keep [Local UI] and [Local Fonts] in memory

Memory Pressure:
  1. Release least-recently-used remote groups
  2. Keep core local groups always loaded
  3. Unload unused scenes
```

### 6.4 Catalog Size Estimates

| Group | Estimated Size | Loading |
|-------|---------------|---------|
| Local Fonts | 5 MB | Always |
| Local UI | 10 MB | Always |
| Local Audio | 3 MB | Always |
| Local Scenes | 5 MB | On demand |
| Remote Art Domino | 30 MB | On game enter |
| Remote Art Ludo | 25 MB | On game enter (future) |
| Remote Art Chess | 20 MB | On game enter (future) |
| Remote Audio | 15 MB | On game enter |
| Remote Effects | 10 MB | On game enter |
| Remote Animations | 20 MB | On game enter |
| **Total Initial** | **~23 MB** | Local only |
| **Total with Domino** | **~68 MB** | After first game |
| **Total Full Platform** | **~163 MB** | All games |

---

## 7. Blender Asset Production List

### 7.1 Art Style Guide

```
Theme: "Royal Arabic Domino"
  - Color palette: Deep purple, gold, white, emerald green
  - Style: Semi-realistic with royal ornamental elements
  - Typography: Arabic calligraphy-inspired
  - Materials: Marble, gold leaf, dark wood, velvet
  - Lighting: Warm, ambient, with golden highlights
```

### 7.2 3D Assets (Blender Production)

#### Game Board
| Asset | Polycount | Textures | Notes |
|-------|-----------|----------|-------|
| Game Table | 5K tris | Wood normal + roughness | Dark walnut with gold trim |
| Table Cloth | 3K tris | Velvet normal map | Deep purple surface |
| Table Legs | 2K tris | Wood | Carved arabesque pattern |
| **Total Board** | **10K tris** | | |

#### Domino Tiles
| Asset | Polycount | Textures | Notes |
|-------|-----------|----------|-------|
| Single Tile Base | 500 tris | White/ivory diffuse | Rounded corners |
| Tile Pair (connected) | 800 tris | Same | Two tiles connected |
| Pip Indentations | 200 tris | Normal map only | Circular indentations |
| Double-Tile Highlight | 300 tris | Gold edge overlay | Special double tiles |
| **Total per tile** | **~1.2K tris** | | 28 unique + shared base |

#### UI 3D Elements
| Asset | Polycount | Notes |
|-------|-----------|-------|
| Coin 3D | 1K tris | Gold coin for animations |
| Gem 3D | 1.5K tris | Blue/green gem for premium |
| Crown 3D | 2K tris | Royal crown (logo/decoration) |
| Trophy 3D | 3K tris | Victory trophy |
| Shield 3D | 1.5K tris | Player rank badges |

#### Environment (Background)
| Asset | Polycount | Notes |
|-------|-----------|-------|
| Palace Column | 2K tris | Decorative pillar |
| Ornamental Arch | 3K tris | Moorish arch frame |
| Lantern | 1.5K tris | Hanging brass lantern |
| Plant | 1K tris | Potted palm/plant |

### 7.3 2D Assets (Blender/Photoshop Production)

#### Domino Tile Faces
| Asset | Resolution | Notes |
|-------|-----------|-------|
| Tile Body White | 512×256 | Clean white surface |
| Tile Body Black | 512×256 | Clean black surface |
| Pip 0-6 | 128×128 each | Individual pip images |
| Double Frame | 512×256 | Gold border for doubles |
| Tile Shadow | 512×256 | Drop shadow |

#### UI Elements
| Asset | Resolution | Notes |
|-------|-----------|-------|
| Button Gold | 512×128 | Normal/hover/pressed states |
| Button Green | 512×128 | Join/accept |
| Button Red | 512×128 | Leave/cancel |
| Button Gray | 512×128 | Disabled/back |
| Panel Dark | 1024×1024 | Main panel background |
| Panel Light | 1024×1024 | Secondary panel |
| Avatar Frame | 256×256 | Player avatar border |
| Icon Coin | 128×128 | Coin icon |
| Icon Gem | 128×128 | Gem icon |
| Icon Trophy | 128×128 | Trophy icon |
| Icon Settings | 64×64 | Gear icon |
| Icon Chat | 64×64 | Speech bubble |
| Icon Friends | 64×64 | People icon |
| Icon Notification | 64×64 | Bell icon |
| Star | 128×128 | Rating star |
| Crown Icon | 128×128 | VIP/king crown |
| Online Dot | 64×64 | Green circle for online |
| Offline Dot | 64×64 | Gray circle for offline |

#### Backgrounds
| Asset | Resolution | Notes |
|-------|-----------|-------|
| Main Menu BG | 2048×1024 | Palace interior, warm lighting |
| Lobby BG | 2048×1024 | Courtyard, evening ambiance |
| Game BG | 2048×1024 | Table close-up |
| Loading BG | 2048×1024 | Logo centered, ornamental frame |
| Profile BG | 1024×1024 | Royal scroll/parchment |

#### Logo & Icons
| Asset | Resolution | Notes |
|-------|-----------|-------|
| Logo Full | 2048×512 | "KingsDomino" Arabic + English |
| Logo Icon | 1024×1024 | Crown + domino tile |
| App Icon 512 | 512×512 | Google Play Store |
| App Icon 1024 | 1024×1024 | Apple App Store |
| Splash | 2048×2048 | Launch screen |

### 7.4 Spine Animations

| Animation | Duration | Notes |
|-----------|----------|-------|
| Tile Place | 0.5s | Tile drops onto board with bounce |
| Tile Flip | 0.8s | 3D flip reveal animation |
| Tile Draw | 0.4s | Slide from deck to hand |
| Win Celebration | 2.0s | Confetti + crown + coins |
| Lose Shrink | 1.0s | Tiles scatter/fade |
| Turn Indicator | Loop | Glowing ring on active player |
| Coin Add | 0.6s | Coins fly into counter |
| Button Press | 0.2s | Scale bounce feedback |
| Panel Enter | 0.3s | Slide from right (RTL) |
| Panel Exit | 0.3s | Slide to left (RTL) |
| Loading Spinner | Loop | Crown rotating |
| Toast Appear | 0.3s | Slide down from top |

### 7.5 Audio Assets

| Asset | Format | Duration | Notes |
|-------|--------|----------|-------|
| Tile Place | WAV | 0.3s | Satisfying click |
| Tile Double | WAV | 0.5s | Double tile special sound |
| Tile Draw | WAV | 0.2s | Slide sound |
| Turn Chime | WAV | 0.5s | Gentle notification |
| Win Fanfare | MP3 | 3.0s | Royal fanfare |
| Lose Sound | MP3 | 1.5s | Subtle disappointment |
| Blocked Game | MP3 | 1.0s | Tie/stalemate sound |
| Coin Add | WAV | 0.4s | Coins jingling |
| Coin Spend | WAV | 0.3s | Cash register |
| Button Click | WAV | 0.1s | UI feedback |
| Button Back | WAV | 0.15s | Cancel/back |
| Chat Message | WAV | 0.2s | Notification ping |
| Player Join | WAV | 0.3s | Door open |
| Player Leave | WAV | 0.3s | Door close |
| Countdown Tick | WAV | 0.5s | Clock tick |
| Countdown End | WAV | 1.0s | Time's up |
| Daily Reward | MP3 | 2.0s | Celebration |
| Menu Music | MP3 | 3:00 loop | Arabic-inspired ambient |
| Game Music | MP3 | 4:00 loop | Calm strategy music |
| Victory Music | MP3 | 3:00 loop | Celebration theme |

### 7.6 Production Pipeline

```
Blender → Export → Unity Import Pipeline:

3D Models:
  Blender (.blend)
    → Export FBX (with animations)
    → Import Unity
    → Set up materials (URP)
    → Generate Addressable asset
    → Optimize LODs if needed

2D Assets:
  Blender (for complex shapes)
    → Export PNG (2048×2048 atlas)
  Photoshop/Clip Studio (for flat UI)
    → Export PNG
    → Import Unity Sprite Atlas
    → Generate Addressable asset

Audio:
  Record/Synthesize
    → Edit (Audacity/Reaper)
    → Export WAV (SFX) or MP3 (music)
    → Import Unity
    → Configure AudioMixer groups
    → Generate Addressable asset

Animations:
  Blender (3D animations)
    → Export FBX
  Spine (2D skeletal)
    → Export .atlas + .json + .png
    → Import Spine-Unity
    → Generate Addressable asset
```

### 7.7 Asset Count Summary

| Category | Count | Estimated Total Size |
|----------|-------|---------------------|
| 3D Models | ~15 | 20 MB |
| 2D UI Textures | ~40 | 50 MB |
| 2D Backgrounds | 5 | 30 MB |
| 2D Icons/Logos | ~25 | 10 MB |
| Domino Tile Textures | ~35 | 15 MB |
| Spine Animations | 12 | 25 MB |
| Audio (SFX) | 20 | 10 MB |
| Audio (Music) | 3 | 20 MB |
| Fonts | 2 | 5 MB |
| **Total** | **~157 assets** | **~185 MB** |

---

## 8. Development Phases

### Phase 0: Stabilization (Weeks 1-2)

**Goal:** Fix existing code, add tests, establish patterns.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Test existing Domino tile orientation fixes | 1 | P0 |
| Write unit tests for RoomsService | 2 | P0 |
| Write unit tests for WalletService | 1 | P0 |
| Write unit tests for AuthService | 1 | P0 |
| Add TypeORM migrations (replace synchronize) | 2 | P0 |
| Extract Domino into `src/games/domino/` | 2 | P0 |
| Create `games` registry entity | 1 | P0 |
| Docker Compose (MySQL + Redis + Backend) | 1 | P1 |
| Remove unused deps (pg, sql.js, uuid) | 0.5 | P1 |
| Fix WsJwtGuard, use @CurrentUser | 0.5 | P1 |

**Deliverable:** Stable, tested backend with migration system.

### Phase 1: Platform Core (Weeks 3-5)

**Goal:** Game-agnostic room and matchmaking systems.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Redis module (cache, pub/sub, locks) | 2 | P0 |
| Persistent rooms (entity + service rewrite) | 3 | P0 |
| Room player management (join/leave/reconnect) | 2 | P0 |
| Game-agnostic WebSocket gateway | 3 | P0 |
| Game results entity + recording | 1 | P0 |
| User stats tracking | 1 | P0 |
| Matchmaking queue (Redis-based) | 2 | P1 |
| Leaderboard (Redis sorted sets) | 1 | P1 |
| API documentation (Swagger) | 1 | P1 |

**Deliverable:** Persistent rooms, game-agnostic gateway, matchmaking.

### Phase 2: Unity Networking (Weeks 6-9)

**Goal:** Connect Unity client to backend.

| Task | Est. Days | Priority |
|------|-----------|----------|
| REST client (UnityWebRequest + JWT) | 3 | P0 |
| Socket.IO client setup | 2 | P0 |
| Login/Register UI scene | 3 | P0 |
| Main Menu scene (game selection) | 3 | P0 |
| Lobby UI (room list, create, join) | 3 | P0 |
| Room lobby (player slots, ready) | 2 | P0 |
| Domino game scene (board, tiles, hands) | 5 | P0 |
| Domino tile drag-and-drop input | 2 | P0 |
| Wallet sync + display | 1 | P0 |
| Reconnection handling | 2 | P1 |
| State sync after reconnect | 1 | P1 |
| Loading screen + transitions | 1 | P1 |

**Deliverable:** Playable Domino game connected to backend.

### Phase 3: Social Layer (Weeks 10-12)

**Goal:** Friends, chat, voice.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Friend system (request/accept/block) | 3 | P0 |
| Online status (Redis presence) | 1 | P0 |
| Direct messaging (persistent) | 2 | P0 |
| Room text chat (real-time) | 1 | P0 |
| Agora voice chat integration | 3 | P0 |
| Push notifications (FCM) | 2 | P0 |
| Notification system (in-app) | 1 | P1 |
| Player search | 1 | P1 |
| Friend game invites | 1 | P1 |

**Deliverable:** Social features, voice chat, notifications.

### Phase 4: Monetization (Weeks 13-15)

**Goal:** Shop, IAP, economy.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Shop items + inventory entities | 2 | P0 |
| Shop UI (tabs, item cards) | 3 | P0 |
| Google Play Billing integration | 2 | P0 |
| Coin packs (IAP tiers) | 1 | P0 |
| Daily rewards system | 2 | P1 |
| VIP system | 2 | P1 |
| Avatar customization | 1 | P1 |
| Rewarded ads (AdMob) | 2 | P1 |
| Cosmetic equipping | 1 | P1 |

**Deliverable:** Working shop, IAP, daily rewards, VIP.

### Phase 5: Competition (Weeks 16-18)

**Goal:** Tournaments, leaderboards, rankings.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Tournament entities + logic | 3 | P0 |
| Tournament bracket (single elimination) | 3 | P0 |
| Tournament UI (bracket view, timer) | 3 | P0 |
| Leaderboard UI (global, per-game) | 2 | P0 |
| Season system (ranked resets) | 2 | P1 |
| Achievement system | 2 | P1 |
| Statistics dashboard | 2 | P1 |

**Deliverable:** Tournaments, leaderboards, achievements.

### Phase 6: Second Game — Ludo (Weeks 19-22)

**Goal:** Add Ludo as second game.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Ludo rules engine (`src/games/ludo/`) | 3 | P0 |
| Ludo server-side state machine | 2 | P0 |
| Ludo Unity scene (board, pieces, dice) | 5 | P0 |
| Ludo Unity game logic | 3 | P0 |
| Ludo assets (board, pieces, dice) | 3 | P0 |
| Ludo Addressable group | 1 | P0 |
| Ludo animations + effects | 2 | P1 |

**Deliverable:** Fully playable Ludo game on the platform.

### Phase 7: Production Hardening (Weeks 23-25)

**Goal:** Ship to stores.

| Task | Est. Days | Priority |
|------|-----------|----------|
| Load testing (k6/artillery) | 2 | P0 |
| Security audit | 2 | P0 |
| CI/CD pipeline (GitHub Actions) | 2 | P0 |
| Staging environment (Docker) | 1 | P0 |
| Monitoring (Prometheus + Grafana) | 2 | P1 |
| Error tracking (Sentry) | 1 | P1 |
| Privacy policy + ToS | 1 | P0 |
| Google Play submission | 2 | P0 |
| App Store submission | 2 | P0 |
| Performance profiling (Unity) | 2 | P1 |
| Memory optimization | 1 | P1 |
| App store assets (screenshots, descriptions) | 2 | P0 |

**Deliverable:** Production-ready app in both stores.

### Phase 8: Growth (Weeks 26+)

**Ongoing features:**
- New games (Chess, Backgammon, Baloot)
- Season pass / Battle pass
- Advanced matchmaking (ELO)
- Spectator mode
- Replay system
- Admin dashboard (web)
- Analytics dashboard
- A/B testing framework
- Localization (English, Turkish, French)
- Accessibility features

### Timeline Summary

```
Week:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
       ├──────┤├──────────┤├───────────────┤├───────────┤├───────────┤├───────────┤├──────────┤
Phase:   0        1            2               3           4           5           6        7
       Stab.   Platform   Unity Client    Social     Monetize   Compete    2nd Game  Ship
```

| Milestone | Week | What |
|-----------|------|------|
| **Internal Alpha** | Week 5 | Backend core complete, no client |
| **Playable Prototype** | Week 9 | Domino game playable with backend |
| **Social Beta** | Week 12 | Friends, chat, voice |
| **Closed Beta** | Week 15 | Shop, IAP, daily rewards |
| **Open Beta** | Week 18 | Tournaments, leaderboards |
| **v1.0 Launch** | Week 25 | Domino + Ludo, both stores |

---

*Technical Roadmap — KingsDomino Platform*
*Original architecture. No code or assets copied.*
*Generated by OpenCode, August 2026*
