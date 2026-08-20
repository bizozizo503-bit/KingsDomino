import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

interface Tile {
  left: number;
  right: number;
}

interface Hand {
  hand: Tile[];
  currentPlayer: string;
  board: Tile[];
  players: string[];
  playerNames: Record<string, string>;
}

function waitForEvent(
  socket: Socket,
  event: string,
  timeoutMs = 15000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout waiting for "${event}"`)),
      timeoutMs,
    );
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForEventMatching(
  socket: Socket,
  event: string,
  predicate: (data: any) => boolean,
  timeoutMs = 15000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout waiting for "${event}" matching predicate`)),
      timeoutMs,
    );
    const onData = (data: any) => {
      if (predicate(data)) {
        clearTimeout(timer);
        socket.off(event, onData);
        resolve(data);
      }
    };
    socket.on(event, onData);
  });
}

function findPlayableTile(hand: Tile[], board: Tile[]): number | null {
  if (board.length === 0) return 0;
  const leftEnd = board[0].left;
  const rightEnd = board[board.length - 1].right;
  for (let i = 0; i < hand.length; i++) {
    const t = hand[i];
    if (
      t.left === leftEnd ||
      t.right === leftEnd ||
      t.left === rightEnd ||
      t.right === rightEnd
    ) {
      return i;
    }
  }
  return null;
}

describe('Domino Online MVP (e2e WS smoke test)', () => {
  let app: INestApplication;
  let server: any;
  let baseUrl: string;

  let token1: string;
  let token2: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api', {
      exclude: ['auth/register', 'auth/login', 'auth/refresh'],
    });

    await app.init();
    await app.listen(0);

    server = app.getHttpServer();
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    const stamp = Date.now();
    const r1 = await request(server).post('/auth/register').send({
      username: `ws_test_p1_${stamp}`,
      email: `ws_p1_${stamp}@test.dev`,
      password: 'Test@12345',
    });
    expect(r1.status).toBe(201);
    token1 = r1.body.access_token;
    user1Id = r1.body.user.id;

    const r2 = await request(server).post('/auth/register').send({
      username: `ws_test_p2_${stamp}`,
      email: `ws_p2_${stamp}@test.dev`,
      password: 'Test@12345',
    });
    expect(r2.status).toBe(201);
    token2 = r2.body.access_token;
    user2Id = r2.body.user.id;
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('runs a full 2-player domino match over WebSocket and emits gameOver', async () => {
    // 1. Create a room via REST (host = user1)
    const createResp = await request(server)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token1}`)
      .send({ players: 2, name: 'MVP Smoke' });
    expect(createResp.status).toBe(201);
    const roomCode = createResp.body.code;
    expect(roomCode).toMatch(/^[a-fA-F0-9]{6}$/);

    // 2. Connect both players over WebSocket
    const p1: Socket = io(baseUrl, {
      transports: ['websocket'],
      auth: { token: token1 },
    });
    const p2: Socket = io(baseUrl, {
      transports: ['websocket'],
      auth: { token: token2 },
    });

    await Promise.all([
      waitForEvent(p1, 'connect'),
      waitForEvent(p2, 'connect'),
    ]);

    // Allow the server to finish async JWT auth before the first message
    await wait(500);

    // 3. Both join the room
    p1.emit('joinRoom', { roomCode, name: 'Player One' });
    p2.emit('joinRoom', { roomCode, name: 'Player Two' });

    const roomUpdatedP1 = await waitForEventMatching(
      p1,
      'roomUpdated',
      (room) => room.players.length === 2,
    );
    expect(roomUpdatedP1.players.length).toBe(2);
    expect(roomUpdatedP1.status).toBe('waiting');

    // 4. Host starts the game
    p1.emit('startGame', { roomCode });

    const [start1, start2] = await Promise.all([
      waitForEvent(p1, 'gameStarted'),
      waitForEvent(p2, 'gameStarted'),
    ]);

    const state1: Hand = {
      hand: start1.hand,
      currentPlayer: start1.currentPlayer,
      board: start1.board,
      players: start1.players,
      playerNames: start1.playerNames,
    };
    const state2: Hand = {
      hand: start2.hand,
      currentPlayer: start2.currentPlayer,
      board: start2.board,
      players: start2.players,
      playerNames: start2.playerNames,
    };

    expect(state1.hand.length).toBe(7);
    expect(state2.hand.length).toBe(7);
    expect(state1.players).toContain(user1Id);
    expect(state1.players).toContain(user2Id);

    // 5. Out-of-turn play must be rejected
    const offending = state1.currentPlayer === user1Id ? p2 : p1;
    const wrongToken = state1.currentPlayer === user1Id ? token2 : token1;
    const rejectedPromise = waitForEvent(offending, 'gameError', 5000);
    offending.emit('playDomino', { roomCode, tileIndex: 0 });
    const err = await rejectedPromise;
    expect(err.message).toBe('ليس دورك الآن');
    expect(wrongToken.length).toBeGreaterThan(0);

    // 6. Play the game to completion
    let current: Hand = state1;
    let other: Hand = state2;
    let activeSocket: Socket = p1;
    let otherSocket: Socket = p2;

    const gameOverPromise = waitForEvent(p1, 'gameOver', 20000);

    const playNext = async () => {
      const board = current.board;
      const idx = findPlayableTile(current.hand, board);
      expect(idx).not.toBeNull();
      if (idx === null) return;

      activeSocket.emit('playDomino', { roomCode, tileIndex: idx });

      const [mine, theirs] = await Promise.all([
        waitForEvent(activeSocket, 'dominoPlayed', 10000),
        waitForEvent(otherSocket, 'dominoPlayed', 10000),
      ]);

      current.hand.splice(idx, 1);
      current.board = mine.board;
      other.board = theirs.board;

      if (mine.winner || mine.blocked) return;

      if (mine.currentPlayer === user1Id) {
        activeSocket = p1;
        otherSocket = p2;
        current = state1;
        other = state2;
      } else {
        activeSocket = p2;
        otherSocket = p1;
        current = state2;
        other = state1;
      }
      await playNext();
    };

    if (current.currentPlayer === user1Id) {
      activeSocket = p1;
      otherSocket = p2;
    } else {
      activeSocket = p2;
      otherSocket = p1;
      current = state2;
      other = state1;
    }

    await playNext();

    const over = await gameOverPromise;
    expect(over.roomCode).toBe(roomCode);
    expect(['normal', 'blocked']).toContain(over.finishReason);
    expect(over.scores).toBeDefined();
    if (over.finishReason === 'normal') {
      expect(over.winner).toBeDefined();
      expect(over.scores[over.winner]).toBe(0);
    }
    expect(over.players.length).toBeGreaterThanOrEqual(1);

    // 7. Persistence: a finished GameSession row must exist for this room
    const dataSource = app.get(DataSource);
    const rows = await dataSource.query(
      `SELECT status, winner_id, finish_reason, result
       FROM game_sessions WHERE room_code = ?`,
      [roomCode],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe('finished');
    expect(rows[0].finish_reason).toBe(over.finishReason);
    if (over.winner) {
      expect(rows[0].winner_id).toBe(over.winner);
    }

    p1.disconnect();
    p2.disconnect();
  }, 30000);
});