import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user_id: userId,
      type,
      title,
      message,
      data,
    });
    return this.notificationRepo.save(notification);
  }

  async getNotifications(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, user_id: userId },
      { is_read: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepo.delete({ id: notificationId, user_id: userId });
  }

  async sendFriendRequest(fromUserId: string, fromUsername: string, toUserId: string): Promise<void> {
    await this.create(
      toUserId,
      NotificationType.FRIEND_REQUEST,
      'طلب صداقة',
      `${fromUsername} يريد أن يكون صديقك`,
      { fromUserId },
    );
  }

  async sendGameResult(userId: string, gameId: string, won: boolean): Promise<void> {
    await this.create(
      userId,
      NotificationType.GAME_RESULT,
      won ? 'فوز!' : 'خسارة',
      won ? 'لقد فزت في المباراة!' : 'لقد خسرت المباراة. حظاً موفقاً في المرة القادمة!',
      { gameId, won },
    );
  }

  async sendAchievement(userId: string, achievementName: string, description: string): Promise<void> {
    await this.create(
      userId,
      NotificationType.ACHIEVEMENT,
      'إنجاز جديد!',
      `${achievementName}: ${description}`,
    );
  }

  async sendDailyReward(userId: string, amount: number): Promise<void> {
    await this.create(
      userId,
      NotificationType.DAILY_REWARD,
      'مكافأة يومية',
      `حصلت على ${amount} ذهب كمكافأة يومية!`,
      { amount },
    );
  }
}
