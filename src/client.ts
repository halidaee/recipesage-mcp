import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AccountConfig } from './types/config.js';

// Placeholder for Recipe Sage TRPC router type
// Will be refined once we explore the actual API
type RecipeSageRouter = any;

interface CachedClient {
  client: ReturnType<typeof createTRPCClient<RecipeSageRouter>>;
  token?: string;
}

export class RecipeSageClient {
  private clients: Map<string, CachedClient> = new Map();
  private readonly apiUrl = 'https://recipesage.com/api';

  async getClient(account: AccountConfig) {
    const cached = this.clients.get(account.id);
    if (cached) {
      return cached.client;
    }

    const token = await this.authenticate(account);
    const client = this.createTRPCClient(token);

    this.clients.set(account.id, { client, token });
    return client;
  }

  private async authenticate(account: AccountConfig): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: account.password
        })
      });

      if (!response.ok) {
        throw new Error(
          `Authentication failed for account ${account.id}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Authentication error: ${error.message}`);
      }
      throw error;
    }
  }

  private createTRPCClient(token: string) {
    return createTRPCClient<RecipeSageRouter>({
      links: [
        httpBatchLink({
          url: this.apiUrl,
          headers: () => ({
            authorization: `Bearer ${token}`
          })
        })
      ]
    });
  }

  clearCache(accountId?: string): void {
    if (accountId) {
      this.clients.delete(accountId);
    } else {
      this.clients.clear();
    }
  }
}
