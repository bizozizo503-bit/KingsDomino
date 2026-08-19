import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProfile } from './entities/player-profile.entity';
import { Friendship } from './entities/friendship.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Notification } from './entities/notification.entity';
import { ProfileService } from './profile.service';
import { FriendsService } from './friends.service';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';
import { SocialController } from './social.controller';
import { SocialGateway } from './social.gateway';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerProfile, Friendship, ChatMessage, Notification]),
    UsersModule,
    CommonModule,
  ],
  controllers: [SocialController],
  providers: [
    ProfileService,
    FriendsService,
    ChatService,
    NotificationService,
    SocialGateway,
  ],
  exports: [ProfileService, FriendsService, ChatService, NotificationService],
})
export class SocialModule {}
