import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(AuthGuard('jwt'))
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { name?: string; players?: number },
  ) {
    return this.roomsService.create({
      name: body.name || 'ملوك الدومينو',
      players: Number(body.players) || 4,
      host: req.user.id,
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
  join(
    @Param('code') code: string,
    @Req() req: any,
    @Body() body: { name?: string },
  ) {
    const playerId = String(req.user.id);
    const name = body.name || req.user.username;
    return this.roomsService.joinRoom(code, playerId, name);
  }

  @Post(':code/start')
  start(@Param('code') code: string, @Req() req: any) {
    try {
      return this.roomsService.startGame(code, req.user.id);
    } catch (error) {
      if (error?.message === 'NOT_HOST') {
        throw new ForbiddenException('فقط صاحب الغرفة يمكنه بدء اللعبة');
      }
      throw error;
    }
  }

  @Post(':code/play')
  play(
    @Param('code') code: string,
    @Req() req: any,
    @Body() body: { tileIndex?: number },
  ) {
    return this.roomsService.playDomino(
      code,
      String(req.user.id),
      Number(body.tileIndex),
    );
  }
}
