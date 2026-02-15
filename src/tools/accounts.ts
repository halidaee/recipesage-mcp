import type { AccountManager } from '../accounts.js';

export interface AccountInfo {
  id: string;
  email: string;
  default?: boolean;
}

export interface ToolResult {
  success: boolean;
  accounts?: AccountInfo[];
  error?: { type: string; message: string; };
}

export function listAccounts(accountManager: AccountManager): ToolResult {
  try {
    const accounts = accountManager.listAccounts().map(acc => ({
      id: acc.id,
      email: acc.email,
      default: acc.default
    }));
    return { success: true, accounts };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export function setDefaultAccount(
  params: { accountId: string },
  accountManager: AccountManager
): ToolResult {
  try {
    accountManager.setDefaultAccount(params.accountId);
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}
