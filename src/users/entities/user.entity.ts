import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  PLAYER = 'player',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  username: string;

  @Column({ unique: true, nullable: true, length: 255 })
  email: string;

  @Column({ select: false })
  password_hash: string;

  @Column({ nullable: true, length: 50 })
  display_name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true, length: 20 })
  auth_provider: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
