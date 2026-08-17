import { DataSource } from 'typeorm';
import { Coupon } from './coupons/entities/coupon.entity';
import { CouponRedemption } from './coupons/entities/coupon-redemption.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[SEED] Refused: this script cannot run in production.');
    process.exit(1);
  }

  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'kingsdomino',
    entities: [Coupon, CouponRedemption],
    synchronize: false,
  });

  await ds.initialize();
  console.log('[SEED] Connected to database.');

  const repo = ds.getRepository(Coupon);

  const existing = await repo.findOne({ where: { code: 'WS-TEST-100' } });
  if (existing) {
    console.log('[SEED] Coupon WS-TEST-100 already exists. Skipping.');
    await ds.destroy();
    process.exit(0);
  }

  const farFuture = new Date('2037-12-31T23:59:59.000Z');

  const coupon = repo.create({
    code: 'WS-TEST-100',
    reward_amount: '100',
    max_redemptions_total: 10,
    max_redemptions_per_user: 1,
    is_active: true,
    expires_at: farFuture,
  });

  await repo.save(coupon);
  console.log('[SEED] Coupon WS-TEST-100 created:');
  console.log({
    code: coupon.code,
    reward_amount: coupon.reward_amount,
    max_redemptions_total: coupon.max_redemptions_total,
    max_redemptions_per_user: coupon.max_redemptions_per_user,
    is_active: coupon.is_active,
    expires_at: coupon.expires_at,
  });

  await ds.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[SEED] Fatal error:', err);
  process.exit(1);
});
