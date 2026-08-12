import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    GameModule,
  ],
  controllers: [
    RoomsController,
  ],
  providers: [
    RoomsService,
  ],
  exports: [
    RoomsService,
  ],
})
export class RoomsModule {}
