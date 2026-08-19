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
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomCodeDto } from './dto/room-code.dto';
import { PlayDominoDto } from './dto/play-domino.dto';

@Controller('rooms')
@UseGuards(AuthGuard('jwt'))
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: CreateRoomDto,
  ) {
    const room = this.roomsService.create({
      name: body.name || 'ملوك الدومينو',
      players: body.players || 4,
      host: req.user.id,
      status: 'waiting',
    });
    return this.roomsService.toPublicRoom(room);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll().map((room) => this.roomsService.toPublicRoom(room));
  }

  @Get(':code')
  findOne(@Param() params: RoomCodeDto) {
    const room = this.roomsService.findByCode(params.code);
    return room ? this.roomsService.toPublicRoom(room) : undefined;
  }

  @Post(':code/join')
  join(
    @Param() params: RoomCodeDto,
    @Req() req: any,
    @Body() body: JoinRoomDto,
  ) {
    const playerId = String(req.user.id);
    const name = body.name || req.user.username;
    const room = this.roomsService.joinRoom(params.code, playerId, name);
    return this.roomsService.toPublicRoom(room);
  }

  @Post(':code/start')
  start(@Param() params: RoomCodeDto, @Req() req: any) {
    try {
      const room = this.roomsService.startGame(params.code, req.user.id);
      return this.roomsService.toPublicRoom(room);
    } catch (error) {
      if (error?.message === 'NOT_HOST') {
        throw new ForbiddenException('فقط صاحب الغرفة يمكنه بدء اللعبة');
      }
      throw error;
    }
  }

  @Post(':code/play')
  play(
    @Param() params: RoomCodeDto,
    @Req() req: any,
    @Body() body: PlayDominoDto,
  ) {
    const result = this.roomsService.playDomino(
      params.code,
      String(req.user.id),
      body.tileIndex,
    );
    return {
      ...result,
      room: this.roomsService.toPublicRoom(result.room),
    };
  }
}
