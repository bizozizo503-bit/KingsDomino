import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship, FriendRequestStatus } from './entities/friendship.entity';

export interface FriendProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  isOnline: boolean;
  lastSeen: number;
}

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
  ) {}

  async sendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot add yourself as friend');
    }

    const existing = await this.friendshipRepo.findOne({
      where: [
        { requester_id: requesterId, addressee_id: addresseeId },
        { requester_id: addresseeId, addressee_id: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === FriendRequestStatus.BLOCKED) {
        throw new BadRequestException('Cannot send friend request');
      }
      if (existing.status === FriendRequestStatus.ACCEPTED) {
        throw new ConflictException('Already friends');
      }
      if (existing.status === FriendRequestStatus.PENDING && existing.requester_id === requesterId) {
        throw new ConflictException('Request already sent');
      }
      if (existing.status === FriendRequestStatus.PENDING && existing.requester_id === addresseeId) {
        existing.status = FriendRequestStatus.ACCEPTED;
        existing.accepted_at = Date.now();
        return this.friendshipRepo.save(existing);
      }
    }

    const friendship = this.friendshipRepo.create({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: FriendRequestStatus.PENDING,
    });

    return this.friendshipRepo.save(friendship);
  }

  async acceptRequest(friendshipId: string, userId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepo.findOne({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.addressee_id !== userId) throw new BadRequestException('Not your request');
    if (friendship.status !== FriendRequestStatus.PENDING) throw new BadRequestException('Request not pending');

    friendship.status = FriendRequestStatus.ACCEPTED;
    friendship.accepted_at = Date.now();
    return this.friendshipRepo.save(friendship);
  }

  async rejectRequest(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepo.findOne({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.addressee_id !== userId) throw new BadRequestException('Not your request');

    friendship.status = FriendRequestStatus.REJECTED;
    await this.friendshipRepo.save(friendship);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = await this.friendshipRepo.findOne({
      where: [
        { requester_id: userId, addressee_id: friendId, status: FriendRequestStatus.ACCEPTED },
        { requester_id: friendId, addressee_id: userId, status: FriendRequestStatus.ACCEPTED },
      ],
    });

    if (!friendship) throw new NotFoundException('Friendship not found');
    await this.friendshipRepo.remove(friendship);
  }

  async blockUser(userId: string, blockedId: string): Promise<void> {
    const existing = await this.friendshipRepo.findOne({
      where: [
        { requester_id: userId, addressee_id: blockedId },
        { requester_id: blockedId, addressee_id: userId },
      ],
    });

    if (existing) {
      existing.status = FriendRequestStatus.BLOCKED;
      await this.friendshipRepo.save(existing);
    } else {
      const friendship = this.friendshipRepo.create({
        requester_id: userId,
        addressee_id: blockedId,
        status: FriendRequestStatus.BLOCKED,
      });
      await this.friendshipRepo.save(friendship);
    }
  }

  async getFriends(userId: string): Promise<Friendship[]> {
    return this.friendshipRepo.find({
      where: [
        { requester_id: userId, status: FriendRequestStatus.ACCEPTED },
        { addressee_id: userId, status: FriendRequestStatus.ACCEPTED },
      ],
    });
  }

  async getPendingRequests(userId: string): Promise<Friendship[]> {
    return this.friendshipRepo.find({
      where: { addressee_id: userId, status: FriendRequestStatus.PENDING },
      order: { created_at: 'DESC' },
    });
  }

  async getSentRequests(userId: string): Promise<Friendship[]> {
    return this.friendshipRepo.find({
      where: { requester_id: userId, status: FriendRequestStatus.PENDING },
      order: { created_at: 'DESC' },
    });
  }

  async getFriendIds(userId: string): Promise<string[]> {
    const friends = await this.getFriends(userId);
    return friends.map(f =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.friendshipRepo.findOne({
      where: [
        { requester_id: userId1, addressee_id: userId2, status: FriendRequestStatus.ACCEPTED },
        { requester_id: userId2, addressee_id: userId1, status: FriendRequestStatus.ACCEPTED },
      ],
    });
    return !!friendship;
  }

  async getFriendship(userId1: string, userId2: string): Promise<Friendship | null> {
    return this.friendshipRepo.findOne({
      where: [
        { requester_id: userId1, addressee_id: userId2 },
        { requester_id: userId2, addressee_id: userId1 },
      ],
    });
  }
}
