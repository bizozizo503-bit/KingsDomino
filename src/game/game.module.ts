import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { DominoService } from './domino.service';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    // استخدام forwardRef لمنع الاعتماد الدائري والانهيار
    forwardRef(() => RoomsModule), 
  ],
  providers: [GameGateway, DominoService],
  exports: [DominoService],
})
export class GameModule {}

