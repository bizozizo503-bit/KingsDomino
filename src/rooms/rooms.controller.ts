import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() body: { name?: string; players?: number; host?: string }) {
    return this.roomsService.create({
      name: body.name || 'ملوك الدومينو',
      players: Number(body.players) || 4,
      host: body.host || 'Player',
      status: 'waiting',
    });
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.roomsService.findByCode(code);
  }

  @Post(':code/join')
  join(@Param('code') code: string, @Body() body: { playerId?: number; name?: string }) {
    return this.roomsService.joinRoom(
      code,
      Number(body.playerId),
      body.name || `Player${body.playerId}`,
    );
  }

  @Post(':code/start')
  start(@Param('code') code: string) {
    return this.roomsService.startGame(code);
  }

  @Post(':code/play')
  play(
    @Param('code') code: string,
    @Body() body: { playerId?: number; tileIndex?: number },
  ) {
    return this.roomsService.playDomino(
      code,
      Number(body.playerId),
      Number(body.tileIndex),
    );
  }
}
