# Kings Domino Platform

## Current implementation target

Kings Domino is being expanded from a domino prototype into a modular 2D social gaming platform.

### Core areas
- Home and game lobby
- Playable domino modes and AI
- Multiplayer-ready rooms and WebSocket architecture
- Player profiles, levels, XP and statistics
- Daily rewards and missions
- Virtual in-game economy with server-authoritative validation
- Cosmetic shop
- Tournaments and leaderboards
- Friends, chat and notifications
- Admin dashboard

### Engineering rules
- Keep the visual identity original to Kings Domino.
- Never trust the client for game results or reward calculations.
- Use idempotent server operations for reward claims and transactions.
- Keep game modules independent so new games can be added without rebuilding the platform.
- Keep production credentials out of source control.

Developer: Mohamed El Araby
