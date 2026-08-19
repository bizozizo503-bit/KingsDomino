import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  WalletTransaction,
  TransactionType,
  TransactionSource,
  WalletCurrency,
} from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepo: Repository<WalletTransaction>,
    private dataSource: DataSource,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { user_id: userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ user_id: userId, balance: '12500', gems_balance: '0' });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getBalance(userId: string): Promise<{ balance: string; gems_balance: string; wallet_id: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance, gems_balance: wallet.gems_balance, wallet_id: wallet.id };
  }

  async getTransactions(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<WalletTransaction[]> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.transactionRepo.find({
      where: { wallet_id: wallet.id },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async credit(
    userId: string,
    amount: number,
    source: TransactionSource,
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, any>,
    currency: WalletCurrency = WalletCurrency.GOLD,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    if (amount <= 0) {
      throw new BadRequestException('المبلغ يجب أن يكون أكبر من صفر');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.creditWithQueryRunner(
        queryRunner, userId, amount, source, idempotencyKey, referenceId, metadata, currency,
      );

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async debit(
    userId: string,
    amount: number,
    source: TransactionSource,
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, any>,
    currency: WalletCurrency = WalletCurrency.GOLD,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    if (amount <= 0) {
      throw new BadRequestException('المبلغ يجب أن يكون أكبر من صفر');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.debitWithQueryRunner(
        queryRunner, userId, amount, source, idempotencyKey, referenceId, metadata, currency,
      );

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async creditWithQueryRunner(
    queryRunner: QueryRunner,
    userId: string,
    amount: number,
    source: TransactionSource,
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, any>,
    currency: WalletCurrency = WalletCurrency.GOLD,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    const wallet = await queryRunner.manager.findOne(Wallet, {
      where: { user_id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) {
      throw new BadRequestException('المحفظة غير موجودة');
    }

    const currentBalance = BigInt(currency === WalletCurrency.GEMS ? wallet.gems_balance : wallet.balance);
    const newBalance = currentBalance + BigInt(amount);
    if (currency === WalletCurrency.GEMS) wallet.gems_balance = newBalance.toString();
    else wallet.balance = newBalance.toString();
    wallet.version += 1;
    await queryRunner.manager.save(wallet);

    const transaction = new WalletTransaction();
    transaction.wallet_id = wallet.id;
    transaction.type = TransactionType.CREDIT;
    transaction.currency = currency;
    transaction.source = source;
    transaction.amount = amount.toString();
    transaction.balance_after = newBalance.toString();
    transaction.idempotency_key = idempotencyKey;
    if (referenceId) transaction.reference_id = referenceId;
    if (metadata) transaction.metadata = metadata;
    await queryRunner.manager.save(transaction);

    return { wallet, transaction };
  }

  async debitWithQueryRunner(
    queryRunner: QueryRunner,
    userId: string,
    amount: number,
    source: TransactionSource,
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, any>,
    currency: WalletCurrency = WalletCurrency.GOLD,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    const wallet = await queryRunner.manager.findOne(Wallet, {
      where: { user_id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) {
      throw new BadRequestException('المحفظة غير موجودة');
    }

    const currentBalance = BigInt(currency === WalletCurrency.GEMS ? wallet.gems_balance : wallet.balance);
    if (currentBalance < BigInt(amount)) {
      throw new BadRequestException('الرصيد غير كافٍ');
    }

    const newBalance = currentBalance - BigInt(amount);
    if (currency === WalletCurrency.GEMS) wallet.gems_balance = newBalance.toString();
    else wallet.balance = newBalance.toString();
    wallet.version += 1;
    await queryRunner.manager.save(wallet);

    const transaction = new WalletTransaction();
    transaction.wallet_id = wallet.id;
    transaction.type = TransactionType.DEBIT;
    transaction.currency = currency;
    transaction.source = source;
    transaction.amount = amount.toString();
    transaction.balance_after = newBalance.toString();
    transaction.idempotency_key = idempotencyKey;
    if (referenceId) transaction.reference_id = referenceId;
    if (metadata) transaction.metadata = metadata;
    await queryRunner.manager.save(transaction);

    return { wallet, transaction };
  }
}
