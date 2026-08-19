import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEvent, PlayerEventProgress } from './entities/event.entity';
import { EventService } from './event.service';
import { EventsController } from './events.controller';
import { WalletModule } from '../wallet/wallet.module';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEvent, PlayerEventProgress]),
    WalletModule,
    SocialModule,
  ],
  controllers: [EventsController],
  providers: [EventService],
  exports: [EventService],
})
export class EventsModule {}
