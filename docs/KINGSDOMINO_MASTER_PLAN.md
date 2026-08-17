# KingsDomino — Master Completion Plan

## Goal
Turn the current prototype into a production-ready multiplayer domino game with a consistent royal Arabic UI, authoritative server gameplay, persistent accounts, and a safe economy.

## Delivery order
1. Foundation: configuration, validation, error handling, health check, database migrations/configuration.
2. Identity: users, authentication, sessions/JWT, player profiles.
3. Economy: wallet balances, immutable transaction ledger, idempotency keys, rewards, shop hooks.
4. Multiplayer: persistent rooms/matches, membership rules, reconnect handling, authoritative game state.
5. Domino rules: deck generation, dealing, legal moves, turns, pass/draw rules, scoring, match completion.
6. Realtime: Socket.IO room synchronization, disconnect/reconnect, server-authoritative events.
7. API contract: DTOs, validation, consistent HTTP errors, pagination where needed.
8. Anti-abuse: server-side currency changes only, rate limits, duplicate-request protection, audit trail.
9. Web/mobile integration: one API contract shared by React/Unity clients.
10. UI/design: royal purple + gold visual system, Arabic-first typography, responsive lobby, rooms, game table, shop, profile, leaderboard, rewards, settings.
11. QA: unit tests for game/economy rules, e2e tests for auth/rooms/game/wallet, production build verification.
12. Release: environment configuration, database migration instructions, deployment checklist, Android/Unity integration checklist.

## Non-negotiable rules
- Client code never decides authoritative balances, rewards, winners, or legal moves.
- Every wallet mutation is represented by an auditable transaction.
- Repeated requests with the same idempotency key must not duplicate currency.
- A game can only advance through server-validated state transitions.
- Secrets and production database credentials are never committed.
- `synchronize` is disabled for production; migrations are used instead.
- Existing working endpoints are preserved where practical; breaking changes are documented.

## Current prototype gaps
- Rooms and players are currently held in process memory.
- Persistence is incomplete for multiplayer state.
- Economy/wallet ledger is not yet a first-class backend subsystem.
- API DTO validation and consistent exception handling need strengthening.
- Client UI exists but needs to be unified around the final KingsDomino design system.

## Definition of done
A release is considered complete only when the server can restart without losing persistent account/economy data, two or more authenticated players can complete a match, reconnect safely, and the final client can consume the same documented API/WebSocket contract.
