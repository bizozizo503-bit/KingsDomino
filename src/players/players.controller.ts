import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  add(@Body() player: any) {
    return this.playersService.add(player);
  }

  @Get()
  findAll() {
    return this.playersService.findAll();
  }
}
