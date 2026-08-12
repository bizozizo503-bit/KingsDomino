import { Injectable } from '@nestjs/common';
import { Player } from './player.interface';

@Injectable()
export class PlayersService {
  private players: Player[] = [];
  private nextId = 1;

  add(player: Player) {
    const newPlayer = {
      ...player,
      id: this.nextId++,
    };

    this.players.push(newPlayer);

    return newPlayer;
  }

  findAll(): Player[] {
    return this.players;
  }

  findByRoom(roomCode: string): Player[] {
    return this.players.filter(p => p.roomCode === roomCode);
  }
}
