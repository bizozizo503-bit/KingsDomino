import { UsersService } from './users.service';

describe('UsersService', () => {
  it('creates a wallet when registering a new user', async () => {
    const user = { id: 'user-1', username: 'new-player' } as any;
    const usersRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(user),
      save: jest.fn().mockResolvedValue(user),
    } as any;
    const walletService = { getOrCreateWallet: jest.fn().mockResolvedValue({ id: 'wallet-1' }) } as any;
    const service = new UsersService(usersRepository, walletService);

    await expect(service.create({ username: 'new-player', password_hash: 'hash' })).resolves.toBe(user);
    expect(walletService.getOrCreateWallet).toHaveBeenCalledWith('user-1');
  });
});
