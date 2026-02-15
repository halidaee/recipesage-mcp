import type { AccountConfig } from './types/config.js';

export interface ApiClient {
  get(path: string, params?: Record<string, string>): Promise<any>;
  post(path: string, body?: any): Promise<any>;
  put(path: string, body?: any): Promise<any>;
  delete(path: string, body?: any): Promise<any>;
}

interface CachedEntry {
  client: ApiClient;
  token: string;
}

export class RecipeSageClient {
  private cache: Map<string, CachedEntry> = new Map();
  private readonly apiUrl = 'https://api.recipesage.com';

  async getClient(account: AccountConfig): Promise<ApiClient> {
    const cached = this.cache.get(account.id);
    if (cached) {
      return cached.client;
    }

    const token = await this.authenticate(account);
    const client = this.createApiClient(token);

    this.cache.set(account.id, { client, token });
    return client;
  }

  async authenticate(account: AccountConfig): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/trpc/users.login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: account.password
        })
      });

      if (!response.ok) {
        const text = await response.text();
        let message = response.statusText;
        try {
          const err = JSON.parse(text);
          message = err.error?.message || message;
        } catch {}
        throw new Error(
          `Authentication failed for account ${account.id}: ${message}`
        );
      }

      const data = await response.json() as { result: { data: { token: string } } };
      return data.result.data.token;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Authentication failed')) {
        throw new Error(`Authentication error: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Authentication error: ${error.message}`);
      }
      throw error;
    }
  }

  private createApiClient(token: string): ApiClient {
    const apiUrl = this.apiUrl;

    async function request(method: string, path: string, body?: any, params?: Record<string, string>): Promise<any> {
      const url = new URL(`${apiUrl}${path}`);
      url.searchParams.set('token', token);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          url.searchParams.set(k, v);
        }
      }

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body !== undefined && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        const text = await response.text();
        let message = response.statusText;
        try {
          const err = JSON.parse(text);
          message = err.error?.message || err.message || message;
        } catch {}
        throw new Error(message);
      }

      const text = await response.text();
      if (!text) return {};
      return JSON.parse(text);
    }

    return {
      get: (path, params) => request('GET', path, undefined, params),
      post: (path, body) => request('POST', path, body),
      put: (path, body) => request('PUT', path, body),
      delete: (path, body) => request('DELETE', path, body),
    };
  }

  clearCache(accountId?: string): void {
    if (accountId) {
      this.cache.delete(accountId);
    } else {
      this.cache.clear();
    }
  }
}
