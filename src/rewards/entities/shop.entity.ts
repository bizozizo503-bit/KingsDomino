import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum ShopItemType {
  AVATAR = 'avatar',
  AVATAR_FRAME = 'avatar_frame',
  EMOTE = 'emote',
  TABLE_SKIN = 'table_skin',
  TILE_SKIN = 'tile_skin',
  TITLE = 'title',
  BOOST = 'boost',
  ENERGY = 'energy',
  GEMS = 'gems',
  GOLD_PACK = 'gold_pack',
}

export enum ShopCurrency {
  GOLD = 'gold',
  GEMS = 'gems',
  REAL_MONEY = 'real_money',
}

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  key: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'enum', enum: ShopItemType })
  item_type: ShopItemType;

  @Column({ type: 'enum', enum: ShopCurrency })
  currency: ShopCurrency;

  @Column({ type: 'int' })
  price: number;

  @Column({ nullable: true, length: 200 })
  image_url: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ type: 'bigint', nullable: true })
  expires_at: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('player_inventory')
export class PlayerInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  item_key: string;

  @Column({ type: 'boolean', default: false })
  is_equipped: boolean;

  @Column({ type: 'bigint', default: 0 })
  purchased_at: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('player_boosts')
export class PlayerBoost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  boost_type: string;

  @Column({ type: 'int', default: 1 })
  multiplier: number;

  @Column({ type: 'bigint' })
  expires_at: number;

  @CreateDateColumn()
  created_at: Date;
}
