import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecipeSageClient } from '../../src/client';
import type { AccountConfig } from '../../src/types/config';

describe('RecipeSageClient', () => {
  const mockAccount: AccountConfig = {
    id: 'test',
    email: 'test@example.com',
    password: 'password123'
  };

  let client: RecipeSageClient;

  beforeEach(() => {
    // Mock fetch for authentication
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'test-token-123' })
    });

    client = new RecipeSageClient();
  });

  it('should create a new client for an account', async () => {
    const trpcClient = await client.getClient(mockAccount);
    expect(trpcClient).toBeDefined();
  });

  it('should cache clients per account', async () => {
    const client1 = await client.getClient(mockAccount);
    const client2 = await client.getClient(mockAccount);
    expect(client1).toBe(client2); // Same instance
  });

  it('should create separate clients for different accounts', async () => {
    const account2: AccountConfig = {
      id: 'other',
      email: 'other@example.com',
      password: 'pass456'
    };

    const client1 = await client.getClient(mockAccount);
    const client2 = await client.getClient(account2);
    expect(client1).not.toBe(client2);
  });

  it('should clear cached client', async () => {
    const client1 = await client.getClient(mockAccount);
    client.clearCache(mockAccount.id);
    const client2 = await client.getClient(mockAccount);
    expect(client1).not.toBe(client2);
  });
});

describe('RecipeSageClient Authentication', () => {
  const mockAccount: AccountConfig = {
    id: 'test',
    email: 'test@example.com',
    password: 'password123'
  };

  it('should authenticate and return token', async () => {
    // Mock fetch for login endpoint
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'real-token-123' })
    });

    const client = new RecipeSageClient();
    const token = await client['authenticate'](mockAccount);

    expect(token).toBe('real-token-123');
    expect(fetch).toHaveBeenCalledWith(
      'https://recipesage.com/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: mockAccount.email,
          password: mockAccount.password
        })
      })
    );
  });

  it('should throw on invalid credentials', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    const client = new RecipeSageClient();
    await expect(client['authenticate'](mockAccount))
      .rejects.toThrow('Authentication failed');
  });
});
