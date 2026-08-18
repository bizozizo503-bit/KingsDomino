import { BadRequestException, ConflictException } from '@nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';
import { CouponsService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';

type Redemption = { coupon_id: string; user_id: string; wallet_transaction_id: string };

function createRedemptionHarness(options: { perUser?: number; total?: number | null } = {}) {
  const coupon = {
    id: 'coupon-1', code: 'WELCOME', is_active: true, reward_amount: '100',
    max_redemptions_per_user: options.perUser ?? 1,
    max_redemptions_total: options.total ?? null,
    expires_at: null,
  } as Coupon;
  const committed: Redemption[] = [];
  const balances = new Map<string, bigint>();
  let lock = Promise.resolve();
  let transactionId = 0;

  const dataSource = {
    createQueryRunner: () => {
      let releaseLock: () => void = () => undefined;
      let pending: Redemption | undefined;
      let pendingCredit: { userId: string; amount: bigint } | undefined;
      return {
        connect: jest.fn(),
        startTransaction: jest.fn(async () => {
          const previous = lock;
          lock = new Promise<void>((resolve) => { releaseLock = resolve; });
          await previous;
        }),
        manager: {
          findOne: jest.fn(async (_entity: unknown, findOptions: any) => {
            expect(findOptions.lock).toEqual({ mode: 'pessimistic_write' });
            return coupon;
          }),
          count: jest.fn(async (_entity: unknown, countOptions: any) => committed.filter((item) =>
            Object.entries(countOptions.where).every(([key, value]) => item[key as keyof Redemption] === value),
          ).length),
          save: jest.fn(async (redemption: Redemption) => { pending = redemption; }),
        },
        commitTransaction: jest.fn(async () => {
          if (pendingCredit) {
            balances.set(pendingCredit.userId, (balances.get(pendingCredit.userId) ?? 12500n) + pendingCredit.amount);
          }
          if (pending) committed.push(pending);
          releaseLock();
        }),
        rollbackTransaction: jest.fn(async () => { releaseLock(); }),
        release: jest.fn(),
        setCredit: (userId: string, amount: bigint) => { pendingCredit = { userId, amount }; },
      };
    },
  } as any;
  const walletService = {
    creditWithQueryRunner: jest.fn(async (runner: any, userId: string, amount: number, source: TransactionSource) => {
      expect(source).toBe(TransactionSource.COUPON);
      runner.setCredit(userId, BigInt(amount));
      transactionId += 1;
      return { transaction: { id: `transaction-${transactionId}` } };
    }),
  } as any;
  const redemptionRepo = {
    create: jest.fn((redemption: Redemption) => redemption),
  } as any;
  const service = new CouponsService({} as any, redemptionRepo, walletService, dataSource);
  return { service, committed, balances, walletService };
}

describe('CouponsService redemption', () => {
  it('allows a newly registered user to redeem immediately and credits the wallet once', async () => {
    const { service, balances, walletService } = createRedemptionHarness();

    await expect(service.redeem('new-user', 'welcome')).resolves.toMatchObject({ reward_amount: '100' });
    expect(walletService.creditWithQueryRunner).toHaveBeenCalledTimes(1);
    expect(balances.get('new-user')).toBe(12600n);
  });

  it('does not allow the same user to redeem a coupon twice', async () => {
    const { service, balances } = createRedemptionHarness();

    await service.redeem('user-1', 'WELCOME');
    await expect(service.redeem('user-1', 'WELCOME')).rejects.toBeInstanceOf(ConflictException);
    expect(balances.get('user-1')).toBe(12600n);
  });

  it('enforces per-user limits for concurrent requests and credits once', async () => {
    const { service, balances, walletService } = createRedemptionHarness({ perUser: 1 });
    const results = await Promise.allSettled([
      service.redeem('user-1', 'WELCOME'),
      service.redeem('user-1', 'WELCOME'),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')[0].reason).toBeInstanceOf(ConflictException);
    expect(walletService.creditWithQueryRunner).toHaveBeenCalledTimes(1);
    expect(balances.get('user-1')).toBe(12600n);
  });

  it('enforces global limits for concurrent requests', async () => {
    const { service, committed, walletService } = createRedemptionHarness({ total: 1 });
    const results = await Promise.allSettled([
      service.redeem('user-1', 'WELCOME'),
      service.redeem('user-2', 'WELCOME'),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')[0].reason).toBeInstanceOf(BadRequestException);
    expect(committed).toHaveLength(1);
    expect(walletService.creditWithQueryRunner).toHaveBeenCalledTimes(1);
  });

  it('declares a database-level unique coupon/user constraint', () => {
    const index = getMetadataArgsStorage().indices.find((item) => item.target === CouponRedemption);
    expect(index).toMatchObject({ columns: ['coupon_id', 'user_id'] });
    expect(index?.unique).toBe(true);
  });
});
