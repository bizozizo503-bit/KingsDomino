import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, ChatRoomType } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly RATE_LIMIT_WINDOW_MS = 5000;
  private readonly RATE_LIMIT_MAX = 5;

  private rateLimitMap = new Map<string, number[]>();

  constructor(
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
  ) {}

  async sendMessage(
    roomId: string,
    roomType: ChatRoomType,
    senderId: string,
    senderName: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<ChatMessage> {
    this.checkRateLimit(senderId);

    const trimmed = content.trim();
    if (trimmed.length === 0 || trimmed.length > this.MAX_MESSAGE_LENGTH) {
      throw new Error('Invalid message length');
    }

    const message = this.messageRepo.create({
      room_id: roomId,
      room_type: roomType,
      sender_id: senderId,
      sender_name: senderName,
      content: trimmed,
      metadata,
    });

    return this.messageRepo.save(message);
  }

  async getRoomHistory(
    roomId: string,
    limit = 50,
    before?: string,
  ): Promise<ChatMessage[]> {
    const query = this.messageRepo
      .createQueryBuilder('msg')
      .where('msg.room_id = :roomId', { roomId })
      .andWhere('msg.is_deleted = false')
      .orderBy('msg.created_at', 'DESC')
      .take(limit);

    if (before) {
      query.andWhere('msg.created_at < :before', { before });
    }

    return query.getMany();
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.sender_id !== userId) throw new Error('Not your message');

    message.is_deleted = true;
    await this.messageRepo.save(message);
  }

  async getUnreadCount(userId: string, roomIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    for (const roomId of roomIds) {
      const count = await this.messageRepo
        .createQueryBuilder('msg')
        .where('msg.room_id = :roomId', { roomId })
        .andWhere('msg.sender_id != :userId', { userId })
        .andWhere('msg.is_deleted = false')
        .getCount();
      counts[roomId] = count;
    }

    return counts;
  }

  private checkRateLimit(userId: string): void {
    const now = Date.now();
    const timestamps = this.rateLimitMap.get(userId) || [];
    const recent = timestamps.filter(t => now - t < this.RATE_LIMIT_WINDOW_MS);

    if (recent.length >= this.RATE_LIMIT_MAX) {
      throw new Error('Rate limit exceeded');
    }

    recent.push(now);
    this.rateLimitMap.set(userId, recent);
  }
}
