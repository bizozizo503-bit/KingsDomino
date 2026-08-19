import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChatEventDto, PlayDominoEventDto } from './game-events.dto';

describe('Game event DTOs', () => {
  it('rejects invalid tile indexes', async () => {
    const payload = plainToInstance(PlayDominoEventDto, { roomCode: 'A1B2C3', tileIndex: -1 });
    await expect(validate(payload)).resolves.not.toHaveLength(0);
  });

  it('rejects oversized chat messages', async () => {
    const payload = plainToInstance(ChatEventDto, { roomCode: 'A1B2C3', message: 'x'.repeat(201) });
    await expect(validate(payload)).resolves.not.toHaveLength(0);
  });
});
