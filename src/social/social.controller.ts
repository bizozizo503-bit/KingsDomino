import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { FriendsService } from './friends.service';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';
import { ChatRoomType } from './entities/chat-message.entity';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly friendsService: FriendsService,
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('profile/me')
  async getMyProfile(@Req() req: any) {
    return this.profileService.getOrCreateProfile(req.user.id, req.user.username);
  }

  @Post('profile/me')
  async updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.profileService.updateProfile(req.user.id, body);
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Get('profile/search')
  async searchPlayers(@Query('q') query: string) {
    return this.profileService.searchPlayers(query || '');
  }

  @Get('friends')
  async getFriends(@Req() req: any) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get('friends/pending')
  async getPendingRequests(@Req() req: any) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  @Post('friends/request/:userId')
  async sendFriendRequest(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.sendRequest(req.user.id, userId);
  }

  @Post('friends/accept/:friendshipId')
  async acceptFriendRequest(@Req() req: any, @Param('friendshipId') friendshipId: string) {
    return this.friendsService.acceptRequest(friendshipId, req.user.id);
  }

  @Post('friends/reject/:friendshipId')
  async rejectFriendRequest(@Req() req: any, @Param('friendshipId') friendshipId: string) {
    return this.friendsService.rejectRequest(friendshipId, req.user.id);
  }

  @Post('friends/remove/:userId')
  async removeFriend(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.removeFriend(req.user.id, userId);
  }

  @Post('friends/block/:userId')
  async blockUser(@Req() req: any, @Param('userId') userId: string) {
    return this.friendsService.blockUser(req.user.id, userId);
  }

  @Get('chat/:roomId/history')
  async getChatHistory(@Param('roomId') roomId: string, @Query('limit') limit?: string) {
    return this.chatService.getRoomHistory(roomId, Number(limit) || 50);
  }

  @Get('notifications')
  async getNotifications(@Req() req: any, @Query('limit') limit?: string) {
    return this.notificationService.getNotifications(req.user.id, Number(limit) || 50);
  }

  @Get('notifications/unread')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post('notifications/read-all')
  async markAllRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
