import { readFileSync, existsSync } from 'fs';
import { AccountConfig, RecipeSageConfig, validateConfig } from './types/config.js';

export class AccountManager {
  private accounts: Map<string, AccountConfig> = new Map();
  private defaultAccountId?: string;

  constructor(private configPath: string) {}

  loadAccounts(): void {
    if (!existsSync(this.configPath)) {
      throw new Error(
        `Config file not found: ${this.configPath}\n` +
        `Please create a config file at ~/.config/recipesage-mcp/accounts.json`
      );
    }

    let config: RecipeSageConfig;
    try {
      const content = readFileSync(this.configPath, 'utf-8');
      config = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in config file: ${this.configPath}`);
    }

    validateConfig(config);

    this.accounts.clear();
    for (const account of config.accounts) {
      this.accounts.set(account.id, account);
      if (account.default) {
        this.defaultAccountId = account.id;
      }
    }

    // If no default specified, use first account
    if (!this.defaultAccountId && config.accounts.length > 0) {
      this.defaultAccountId = config.accounts[0].id;
    }
  }

  getAccount(accountId?: string): AccountConfig {
    const id = accountId || this.defaultAccountId;
    if (!id) {
      throw new Error('No default account configured');
    }

    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

    return account;
  }

  listAccounts(): AccountConfig[] {
    return Array.from(this.accounts.values());
  }

  getDefaultAccountId(): string | undefined {
    return this.defaultAccountId;
  }
}
