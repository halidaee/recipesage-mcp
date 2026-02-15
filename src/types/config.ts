export interface AccountConfig {
  id: string;
  email: string;
  password: string;
  default?: boolean;
}

export interface RecipeSageConfig {
  accounts: AccountConfig[];
}

export function validateConfig(config: RecipeSageConfig): void {
  if (!config.accounts || config.accounts.length === 0) {
    throw new Error('No accounts configured');
  }

  const defaultAccounts = config.accounts.filter(a => a.default);
  if (defaultAccounts.length > 1) {
    throw new Error('Multiple default accounts found. Only one account can be default.');
  }

  for (const account of config.accounts) {
    if (!account.id || !account.email || !account.password) {
      throw new Error(`Missing required field in account: ${account.id || 'unknown'}`);
    }
  }
}
