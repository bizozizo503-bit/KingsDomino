import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponRedemption)
    private redemptionRepo: Repository<CouponRedemption>,
    private walletService: WalletService,
    private dataSource: DataSource,
  ) {}

  async redeem(userId: string, code: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Serializing redemptions per coupon makes both per-user and global limits atomic.
      const coupon = await queryRunner.manager.findOne(Coupon, {
        where: { code: code.toUpperCase(), is_active: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!coupon) {
        throw new NotFoundException('الكوبون غير موجود أو منتهي الصلاحية');
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new BadRequestException('انتهت صلاحية هذا الكوبون');
      }

      const userRedemptionCount = await queryRunner.manager.count(CouponRedemption, {
        where: { coupon_id: coupon.id, user_id: userId },
      });
      if (userRedemptionCount >= coupon.max_redemptions_per_user) {
        throw new ConflictException('لقد استخدمت هذا الكوبون بالحد الأقصى المسموح');
      }

      if (coupon.max_redemptions_total !== null) {
        const totalRedemptions = await queryRunner.manager.count(CouponRedemption, {
          where: { coupon_id: coupon.id },
        });
        if (totalRedemptions >= coupon.max_redemptions_total) {
          throw new BadRequestException('تم استنفاد جميع مرات الاستبدال لهذا الكوبون');
        }
      }

      const amount = parseInt(coupon.reward_amount, 10);
      const idempotencyKey = `coupon:${coupon.id}:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      const wallet = await this.walletService.creditWithQueryRunner(
        queryRunner,
        userId,
        amount,
        TransactionSource.COUPON,
        idempotencyKey,
        coupon.id,
        { code: coupon.code },
      );

      const redemption = this.redemptionRepo.create({
        coupon_id: coupon.id,
        user_id: userId,
        wallet_transaction_id: wallet.transaction.id,
      });
      await queryRunner.manager.save(redemption);

      await queryRunner.commitTransaction();

      return {
        message: 'تم استبدال الكوبون بنجاح',
        reward_amount: coupon.reward_amount,
        transaction_id: wallet.transaction.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error?.code === '23505' ||
        error?.code === 'ER_DUP_ENTRY' ||
        error?.errno === 1062
      ) {
        throw new ConflictException('لقد استخدمت هذا الكوبون من قبل');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
