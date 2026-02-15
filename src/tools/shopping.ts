import type { RecipeSageClient } from '../client.js';
import type { AccountManager } from '../accounts.js';

export interface ShoppingList {
  id: string;
  title: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  title: string;
  completed: boolean;
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
    const lists = await client.get('/shoppingLists');
    return { success: true, lists };
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
    const list = await client.get(`/shoppingLists/${params.listId}`);
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
    const list = await client.post('/shoppingLists', { title: params.title });
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
    for (const item of params.items) {
      await client.post(`/shoppingLists/${params.listId}`, { title: item });
    }
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
    await client.delete(`/shoppingLists/${params.listId}/items`, { itemIds: [params.itemId] });
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
    await client.delete(`/shoppingLists/${params.listId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}
