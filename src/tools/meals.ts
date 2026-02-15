import type { RecipeSageClient } from '../client.js';
import type { AccountManager } from '../accounts.js';

export interface Meal {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  recipeName?: string;
}

export interface ToolResult {
  success: boolean;
  meals?: Meal[];
  meal?: Meal;
  error?: { type: string; message: string; };
}

export async function getMealPlan(
  params: { startDate: string; endDate: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    const response = await (client as any).meals.getPlan({ startDate: params.startDate, endDate: params.endDate });
    return { success: true, meals: response.meals };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function addMealToPlan(
  params: { date: string; recipeId: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; account?: string; },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    const meal = await (client as any).meals.add({ date: params.date, recipeId: params.recipeId, mealType: params.mealType });
    return { success: true, meal };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function removeMealFromPlan(
  params: { mealId: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);
    await (client as any).meals.remove({ id: params.mealId });
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}
