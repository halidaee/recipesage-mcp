import type { RecipeSageClient } from '../client.js';
import type { AccountManager } from '../accounts.js';

export interface ShoppingList {
  id: string;
  title: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface ToolResult {
  success: boolean;
  lists?: ShoppingList[];
  list?: ShoppingList;
  error?: { type: string; message: string; };
}

export async function listShoppingLists(
  params: { account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    const response = await (client as any).shopping.list();
    return { success: true, lists: response.lists };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function getShoppingList(
  params: { listId: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    const list = await (client as any).shopping.getById({ id: params.listId });
    return { success: true, list };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function createShoppingList(
  params: { title: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    const list = await (client as any).shopping.create({ title: params.title });
    return { success: true, list };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function addToShoppingList(
  params: { listId: string; items: string[]; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    await (client as any).shopping.addItems({ listId: params.listId, items: params.items });
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function removeFromShoppingList(
  params: { listId: string; itemId: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    await (client as any).shopping.removeItem({ listId: params.listId, itemId: params.itemId });
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function deleteShoppingList(
  params: { listId: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    await (client as any).shopping.delete({ id: params.listId });
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}
