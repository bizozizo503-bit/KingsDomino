import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GameEvent, EventStatus, PlayerEventProgress } from './entities/event.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';
import { ProfileService } from '../social/profile.service';
import { NotificationService } from '../social/notification.service';
import { NotificationType } from '../social/entities/notification.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(GameEvent)
    private eventRepo: Repository<GameEvent>,
    @InjectRepository(PlayerEventProgress)
    private progressRepo: Repository<PlayerEventProgress>,
    private walletService: WalletService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private dataSource: DataSource,
  ) {}

  async createEvent(data: {
    name: string;
    description: string;
    eventType: GameEvent['event_type'];
    imageUrl?: string;
    missions: GameEvent['missions'];
    startAt: number;
    endAt: number;
    rewards?: Record<string, any>;
  }): Promise<GameEvent> {
    const event = this.eventRepo.create({
      name: data.name,
      description: data.description,
      event_type: data.eventType,
      status: EventStatus.UPCOMING,
      image_url: data.imageUrl,
      missions: data.missions,
      start_at: data.startAt,
      end_at: data.endAt,
      rewards: data.rewards || {},
    });

    return this.eventRepo.save(event);
  }

  async activateEvent(eventId: string): Promise<GameEvent> {
    const event = await this.getEvent(eventId);
    if (event.status === EventStatus.ACTIVE) {
      throw new BadRequestException('Event already active');
    }
    event.status = EventStatus.ACTIVE;
    event.is_active = true;
    return this.eventRepo.save(event);
  }

  async finishEvent(eventId: string): Promise<GameEvent> {
    const event = await this.getEvent(eventId);
    event.status = EventStatus.FINISHED;
    event.is_active = false;
    event.end_at = Date.now();
    return this.eventRepo.save(event);
  }

  async updateProgress(
    eventId: string,
    userId: string,
    missionType: string,
    increment: number = 1,
    gameId?: string,
  ): Promise<PlayerEventProgress> {
    const event = await this.getEvent(eventId);

    if (event.status !== EventStatus.ACTIVE) {
      throw new BadRequestException('Event is not active');
    }

    let progress = await this.progressRepo.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        event_id: eventId,
        user_id: userId,
        mission_progress: {},
        is_completed: false,
        is_reward_claimed: false,
      });
    }

    if (!progress.mission_progress) {
      progress.mission_progress = {};
    }

    for (const mission of event.missions || []) {
      if (mission.mission_type === missionType && (!mission.game_id || mission.game_id === gameId)) {
        const current = progress.mission_progress[mission.id] || 0;
        progress.mission_progress[mission.id] = Math.min(current + increment, mission.target);
      }
    }

    progress.last_updated = Date.now();

    const allComplete = (event.missions || []).every(
      m => (progress.mission_progress[m.id] || 0) >= m.target,
    );
    if (allComplete && !progress.is_completed) {
      progress.is_completed = true;
      await this.notificationService.create(
        userId,
        NotificationType.EVENT_COMPLETED,
        'اكتملت المهمة!',
        `أكملت جميع مهمات حدث ${event.name}`,
        { eventId },
      );
    }

    return this.progressRepo.save(progress);
  }

  async claimEventReward(eventId: string, userId: string): Promise<{
    gold: number;
    xp: number;
    message: string;
  }> {
    const event = await this.getEvent(eventId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let totalGold = 0;
    let totalXp = 0;

    try {
      const progress = await queryRunner.manager.findOne(PlayerEventProgress, {
        where: { event_id: eventId, user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!progress) throw new NotFoundException('No progress found');
      if (!progress.is_completed) throw new BadRequestException('Event not completed');
      if (progress.is_reward_claimed) throw new BadRequestException('Already claimed');

      for (const mission of event.missions || []) {
        totalGold += mission.reward_gold;
        totalXp += mission.reward_xp;
      }

      if (totalGold > 0) {
        await this.walletService.creditWithQueryRunner(
          queryRunner,
          userId,
          totalGold,
          TransactionSource.OTHER,
          `event_reward:${eventId}:${userId}`,
          eventId,
          { eventId, missions: Object.keys(progress.mission_progress) },
        );
      }

      progress.is_reward_claimed = true;
      await queryRunner.manager.save(progress);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    if (totalXp > 0) {
      await this.profileService.addXp(userId, totalXp);
    }

    this.logger.log(`User ${userId} claimed event reward: ${totalGold} gold, ${totalXp} xp`);

    return {
      gold: totalGold,
      xp: totalXp,
      message: `حصلت على ${totalGold} ذهب و ${totalXp} XP!`,
    };
  }

  async getEvent(eventId: string): Promise<GameEvent> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async getActiveEvents(): Promise<GameEvent[]> {
    return this.eventRepo.find({
      where: { status: EventStatus.ACTIVE },
      order: { end_at: 'ASC' },
    });
  }

  async getUpcomingEvents(): Promise<GameEvent[]> {
    return this.eventRepo.find({
      where: { status: EventStatus.UPCOMING },
      order: { start_at: 'ASC' },
    });
  }

  async getFinishedEvents(): Promise<GameEvent[]> {
    return this.eventRepo.find({
      where: { status: EventStatus.FINISHED },
      order: { end_at: 'DESC' },
    });
  }

  async getMyProgress(userId: string, eventId?: string): Promise<PlayerEventProgress[]> {
    const where: any = { user_id: userId };
    if (eventId) where.event_id = eventId;
    return this.progressRepo.find({ where });
  }

  async getEventLeaderboard(eventId: string, limit = 50): Promise<Array<{
    userId: string;
    missionsCompleted: number;
    totalScore: number;
  }>> {
    const progresses = await this.progressRepo.find({
      where: { event_id: eventId },
    });

    const scored = progresses.map(p => ({
      userId: p.user_id,
      missionsCompleted: Object.values(p.mission_progress || {}).filter(
        (v, i, arr) => v >= 1,
      ).length,
      totalScore: Object.values(p.mission_progress || {}).reduce((sum, v) => sum + v, 0),
    }));

    scored.sort((a, b) => b.totalScore - a.totalScore);

    return scored.slice(0, limit);
  }

  async getOrCreateProgress(eventId: string, userId: string): Promise<PlayerEventProgress> {
    let progress = await this.progressRepo.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        event_id: eventId,
        user_id: userId,
        mission_progress: {},
        is_completed: false,
        is_reward_claimed: false,
      });
      progress = await this.progressRepo.save(progress);
    }

    return progress;
  }
}
