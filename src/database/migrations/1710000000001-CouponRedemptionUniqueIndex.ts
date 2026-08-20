import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Guarded migration to restore the UNIQUE(coupon_id, user_id) invariant that the
 * CouponRedemption entity declares but the pre-existing database never enforced.
 *
 * Pre-existing data has duplicate (coupon_id, user_id) rows (3 duplicate pairs
 * found during Phase 1 audit). A unique index cannot be created while duplicates
 * exist, so this migration:
 *   1. Reports any duplicate pairs (no data deletion).
 *   2. Creates the unique index ONLY when the table is clean.
 *
 * If duplicates are present it fails loudly so a human (financial owner) can
 * review and resolve the data first. This deliberately does NOT delete or merge
 * redemption rows — that is a business decision owned by the wallet/coupons team.
 */
export class CouponRedemptionUniqueIndex1710000000001 implements MigrationInterface {
  name = 'CouponRedemptionUniqueIndex1710000000001';

  private readonly INDEX_NAME = 'UQ_coupon_redemption_coupon_user';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'coupon_redemptions';

    const tableExists = await queryRunner.hasTable(table);
    if (!tableExists) {
      return;
    }

    const existing = await queryRunner.query(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
      [table, this.INDEX_NAME],
    );

    if (existing && existing.length > 0) {
      return;
    }

    const duplicates = await queryRunner.query(
      `SELECT coupon_id, user_id, COUNT(*) AS cnt
       FROM \`${table}\`
       GROUP BY coupon_id, user_id
       HAVING COUNT(*) > 1`,
    );

    if (duplicates && duplicates.length > 0) {
      throw new Error(
        `Cannot create unique index ${this.INDEX_NAME} on ${table}: ` +
          `${duplicates.length} duplicate (coupon_id, user_id) pairs exist. ` +
          `Resolve duplicates first (financial owner decision).`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE \`${table}\`
       ADD CONSTRAINT ${this.INDEX_NAME} UNIQUE (coupon_id, user_id)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`coupon_redemptions\` DROP INDEX ${this.INDEX_NAME}`,
    );
  }
}