import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ShopItem,
  ShopItemType,
  ShopCurrency,
  PlayerInventory,
  PlayerBoost,
} from './entities/shop.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectRepository(ShopItem)
    private shopItemRepo: Repository<ShopItem>,
    @InjectRepository(PlayerInventory)
    private inventoryRepo: Repository<PlayerInventory>,
    @InjectRepository(PlayerBoost)
    private boostRepo: Repository<PlayerBoost>,
    private walletService: WalletService,
  ) {}

  async seedShop(): Promise<void> {
    const count = await this.shopItemRepo.count();
    if (count > 0) return;

    const items: Partial<ShopItem>[] = [
      { key: 'avatar_knight', name: 'فارس', description: 'صورة شخصية فارس', item_type: ShopItemType.AVATAR, currency: ShopCurrency.GOLD, price: 500, is_active: true },
      { key: 'avatar_king', name: 'ملك', description: 'صورة شخصية ملك', item_type: ShopItemType.AVATAR, currency: ShopCurrency.GOLD, price: 1000, is_active: true },
      { key: 'avatar_queen', name: 'ملكة', description: 'صورة شخصية ملكة', item_type: ShopItemType.AVATAR, currency: ShopCurrency.GEMS, price: 100, is_active: true },
      { key: 'avatar_dragon', name: 'تنين', description: 'صورة شخصية تنين', item_type: ShopItemType.AVATAR, currency: ShopCurrency.GEMS, price: 200, is_active: true },
      { key: 'frame_gold', name: 'إطار ذهبي', description: 'إطار ذهبي مزخرف', item_type: ShopItemType.AVATAR_FRAME, currency: ShopCurrency.GOLD, price: 2000, is_active: true },
      { key: 'frame_diamond', name: 'إطار ماسي', description: 'إطار ماسي متوهج', item_type: ShopItemType.AVATAR_FRAME, currency: ShopCurrency.GEMS, price: 150, is_active: true },
      { key: 'frame_fire', name: 'إطار ناري', description: 'إطار مع تأثير نار', item_type: ShopItemType.AVATAR_FRAME, currency: ShopCurrency.GEMS, price: 300, is_active: true },
      { key: 'emote_wave', name: 'تلويح', description: 'إيموجي تلويح يد', item_type: ShopItemType.EMOTE, currency: ShopCurrency.GOLD, price: 100, is_active: true },
      { key: 'emote_clap', name: 'تصفيق', description: 'إيموجي تصفيق', item_type: ShopItemType.EMOTE, currency: ShopCurrency.GOLD, price: 150, is_active: true },
      { key: 'emote_laugh', name: 'ضحك', description: 'إيموجي ضحك', item_type: ShopItemType.EMOTE, currency: ShopCurrency.GOLD, price: 200, is_active: true },
      { key: 'emote_angry', name: 'غضب', description: 'إيموجي غضب', item_type: ShopItemType.EMOTE, currency: ShopCurrency.GEMS, price: 50, is_active: true },
      { key: 'table_royal', name: 'طاولة ملكية', description: 'طاولة ألعاب ملكية فاخرة', item_type: ShopItemType.TABLE_SKIN, currency: ShopCurrency.GEMS, price: 200, is_active: true },
      { key: 'table_wood', name: 'طاولة خشبية', description: 'طاولة خشبية كلاسيكية', item_type: ShopItemType.TABLE_SKIN, currency: ShopCurrency.GOLD, price: 1500, is_active: true },
      { key: 'tile_gold', name: 'قطع ذهبية', description: 'قطع دومينو ذهبية', item_type: ShopItemType.TILE_SKIN, currency: ShopCurrency.GEMS, price: 100, is_active: true },
      { key: 'tile_neon', name: 'قطع نيون', description: 'قطع دومينو متوهجة', item_type: ShopItemType.TILE_SKIN, currency: ShopCurrency.GEMS, price: 250, is_active: true },
      { key: 'title_champion', name: 'البطل', description: 'لقب البطل', item_type: ShopItemType.TITLE, currency: ShopCurrency.GOLD, price: 5000, is_active: true },
      { key: 'title_legend', name: 'الأسطورة', description: 'لقب الأسطورة', item_type: ShopItemType.TITLE, currency: ShopCurrency.GEMS, price: 500, is_active: true },
      { key: 'boost_xp2', name: 'مضاعف XP', description: 'مضاعف XP لمدة ساعة', item_type: ShopItemType.BOOST, currency: ShopCurrency.GOLD, price: 500, is_active: true, metadata: { multiplier: 2, durationMs: 3600000, boostType: 'xp' } },
      { key: 'boost_gold2', name: 'مضاعف ذهب', description: 'مضاعف الذهب لمدة ساعة', item_type: ShopItemType.BOOST, currency: ShopCurrency.GOLD, price: 750, is_active: true, metadata: { multiplier: 2, durationMs: 3600000, boostType: 'gold' } },
      { key: 'energy_50', name: '+50 طاقة', description: '50 طاقة إضافية', item_type: ShopItemType.ENERGY, currency: ShopCurrency.GOLD, price: 200, is_active: true, metadata: { amount: 50 } },
      { key: 'gems_100', name: '100 جوهرة', description: '100 جوهرة', item_type: ShopItemType.GEMS, currency: ShopCurrency.REAL_MONEY, price: 99, is_active: true, metadata: { amount: 100 } },
      { key: 'gems_500', name: '500 جوهرة', description: '500 جوهرة + 50 مكافأة', item_type: ShopItemType.GEMS, currency: ShopCurrency.REAL_MONEY, price: 399, is_active: true, metadata: { amount: 550 } },
      { key: 'gems_1000', name: '1000 جوهرة', description: '1000 جوهرة + 200 مكافأة', item_type: ShopItemType.GEMS, currency: ShopCurrency.REAL_MONEY, price: 699, is_active: true, metadata: { amount: 1200 } },
      { key: 'gold_1000', name: '1000 ذهب', description: 'حقيبة ذهب', item_type: ShopItemType.GOLD_PACK, currency: ShopCurrency.GEMS, price: 50, is_active: true, metadata: { amount: 1000 } },
      { key: 'gold_5000', name: '5000 ذهب', description: 'صندوق ذهب', item_type: ShopItemType.GOLD_PACK, currency: ShopCurrency.GEMS, price: 200, is_active: true, metadata: { amount: 5500 } },
    ];

    for (const data of items) {
      const item = this.shopItemRepo.create(data);
      await this.shopItemRepo.save(item);
    }

    this.logger.log(`Seeded ${items.length} shop items`);
  }

  async getShopItems(category?: string): Promise<ShopItem[]> {
    const where: any = { is_active: true };
    if (category) {
      where.item_type = category;
    }
    return this.shopItemRepo.find({ where, order: { sort_order: 'ASC', price: 'ASC' } });
  }

  async getFeaturedItems(): Promise<ShopItem[]> {
    return this.shopItemRepo.find({ where: { is_active: true, is_featured: true } });
  }

  async getItem(itemKey: string): Promise<ShopItem> {
    const item = await this.shopItemRepo.findOne({ where: { key: itemKey } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async purchaseItem(userId: string, itemKey: string): Promise<{
    item: ShopItem;
    message: string;
  }> {
    const item = await this.getItem(itemKey);

    if (!item.is_active) throw new BadRequestException('Item not available');

    if (item.expires_at && item.expires_at < Date.now()) {
      throw new BadRequestException('Item expired');
    }

    if (item.stock !== null && item.stock <= 0) {
      throw new BadRequestException('Item out of stock');
    }

    if (item.currency === ShopCurrency.GOLD) {
      const idempotencyKey = `shop:${itemKey}:${userId}:${Date.now()}`;
      await this.walletService.debit(
        userId,
        item.price,
        TransactionSource.PURCHASE,
        idempotencyKey,
        item.id,
        { item: itemKey },
      );
    } else if (item.currency === ShopCurrency.GEMS) {
      const idempotencyKey = `shop_gems:${itemKey}:${userId}:${Date.now()}`;
      await this.walletService.debit(
        userId,
        item.price,
        TransactionSource.PURCHASE,
        idempotencyKey,
        item.id,
        { item: itemKey, currency: 'gems' },
      );
    } else if (item.currency === ShopCurrency.REAL_MONEY) {
      throw new BadRequestException('In-app purchase not yet implemented');
    }

    if (item.item_type === ShopItemType.BOOST && item.metadata) {
      await this.boostRepo.save(this.boostRepo.create({
        user_id: userId,
        boost_type: item.metadata.boostType || 'xp',
        multiplier: item.metadata.multiplier || 2,
        expires_at: Date.now() + (item.metadata.durationMs || 3600000),
      }));
    }

    const existingInv = await this.inventoryRepo.findOne({
      where: { user_id: userId, item_key: itemKey },
    });

    if (existingInv && item.item_type !== ShopItemType.BOOST && item.item_type !== ShopItemType.ENERGY) {
      throw new ConflictException('Already owned');
    }

    if (item.item_type === ShopItemType.ENERGY && item.metadata) {
      this.logger.log(`User ${userId} purchased energy: ${item.metadata.amount}`);
    } else {
      await this.inventoryRepo.save(this.inventoryRepo.create({
        user_id: userId,
        item_key: itemKey,
        is_equipped: false,
        purchased_at: Date.now(),
        quantity: 1,
      }));
    }

    if (item.stock !== null) {
      item.stock -= 1;
      await this.shopItemRepo.save(item);
    }

    this.logger.log(`User ${userId} purchased ${itemKey} for ${item.price} ${item.currency}`);

    return {
      item,
      message: `تم شراء ${item.name} بنجاح!`,
    };
  }

  async getInventory(userId: string): Promise<PlayerInventory[]> {
    return this.inventoryRepo.find({
      where: { user_id: userId },
      order: { purchased_at: 'DESC' },
    });
  }

  async equipItem(userId: string, itemKey: string): Promise<PlayerInventory> {
    const inventory = await this.inventoryRepo.findOne({
      where: { user_id: userId, item_key: itemKey },
    });

    if (!inventory) throw new NotFoundException('Item not in inventory');

    const item = await this.getItem(itemKey);

    const existingEquipped = await this.inventoryRepo.findOne({
      where: { user_id: userId, is_equipped: true },
    });

    if (existingEquipped) {
      const existingItem = await this.getItem(existingEquipped.item_key);
      if (existingItem.item_type === item.item_type) {
        existingEquipped.is_equipped = false;
        await this.inventoryRepo.save(existingEquipped);
      }
    }

    inventory.is_equipped = true;
    return this.inventoryRepo.save(inventory);
  }

  async unequipItem(userId: string, itemKey: string): Promise<PlayerInventory> {
    const inventory = await this.inventoryRepo.findOne({
      where: { user_id: userId, item_key: itemKey },
    });

    if (!inventory) throw new NotFoundException('Item not in inventory');

    inventory.is_equipped = false;
    return this.inventoryRepo.save(inventory);
  }

  async getActiveBoosts(userId: string): Promise<PlayerBoost[]> {
    const now = Date.now();
    const boosts = await this.boostRepo.find({
      where: { user_id: userId },
    });

    return boosts.filter(b => b.expires_at > now);
  }

  async hasItem(userId: string, itemKey: string): Promise<boolean> {
    const count = await this.inventoryRepo.count({
      where: { user_id: userId, item_key: itemKey },
    });
    return count > 0;
  }

  async getEquippedItems(userId: string): Promise<PlayerInventory[]> {
    return this.inventoryRepo.find({
      where: { user_id: userId, is_equipped: true },
    });
  }
}
