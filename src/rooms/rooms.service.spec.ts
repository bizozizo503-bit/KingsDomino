import { RoomsService } from './rooms.service';

describe('RoomsService public room serialization', () => {
  const dominoService = { createDeck: jest.fn(), shuffle: jest.fn() } as any;
  let service: RoomsService;

  beforeEach(() => {
    service = new RoomsService(dominoService);
  });

  afterEach(() => service.onModuleDestroy());

  it('never exposes hands or the remaining deck in a public room', () => {
    const room = service.create({ name: 'Room', players: 4, host: 'host', status: 'waiting' });
    room.gameState.dominoDeck = [{ left: 6, right: 6 }];
    room.gameState.hands = { host: [{ left: 1, right: 2 }] };

    const publicRoom = service.toPublicRoom(room);

    expect(publicRoom.gameState).toEqual({
      started: false,
      currentPlayer: '',
      board: [],
      finishReason: undefined,
    });
    expect(JSON.stringify(publicRoom)).not.toContain('dominoDeck');
    expect(JSON.stringify(publicRoom)).not.toContain('hands');
  });
});
