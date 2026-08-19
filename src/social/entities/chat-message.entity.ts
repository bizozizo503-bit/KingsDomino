import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum ChatRoomType {
  GLOBAL = 'global',
  GAME = 'game',
  PRIVATE = 'private',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  room_id: string;

  @Column({ type: 'enum', enum: ChatRoomType, default: ChatRoomType.GLOBAL })
  room_type: ChatRoomType;

  @Column()
  sender_id: string;

  @Column({ length: 100 })
  sender_name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;
}
