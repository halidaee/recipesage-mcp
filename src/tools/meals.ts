import type { RecipeSageClient } from '../client.js';
import type { AccountManager } from '../accounts.js';

export interface Meal {
  id: string;
  title: string;
  scheduledDate: string;
  meal: string;
  recipeId?: string;
}

export interface ToolResult {
  success: boolean;
  mealPlans?: any[];
  mealPlan?: any;
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
    const mealPlans = await client.get('/mealPlans');
    return { success: true, mealPlans };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function addMealToPlan(
  params: { date: string; recipeId: string; mealType: string; mealPlanId?: string; account?: string; },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    // If no mealPlanId provided, get the first meal plan or create one
    let mealPlanId = params.mealPlanId;
    if (!mealPlanId) {
      const plans = await client.get('/mealPlans');
      if (Array.isArray(plans) && plans.length > 0) {
        mealPlanId = plans[0].id;
      } else {
        const newPlan = await client.post('/mealPlans', { title: 'Meal Plan' });
        mealPlanId = newPlan.id;
      }
    }

    const meal = await client.post(`/mealPlans/${mealPlanId}`, {
      title: params.mealType,
      scheduledDate: params.date,
      meal: params.mealType,
      recipeId: params.recipeId
    });
    return { success: true, meal };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}

export async function removeMealFromPlan(
  params: { mealId: string; mealPlanId?: string; account?: string },
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    let mealPlanId = params.mealPlanId;
    if (!mealPlanId) {
      const plans = await client.get('/mealPlans');
      if (Array.isArray(plans) && plans.length > 0) {
        mealPlanId = plans[0].id;
      } else {
        throw new Error('No meal plans found');
      }
    }

    await client.delete(`/mealPlans/${mealPlanId}/items`, { itemIds: [params.mealId] });
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}
