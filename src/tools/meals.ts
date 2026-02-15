import type { RecipeSageClient } from '../client.js';
import type { AccountManager } from '../accounts.js';

export interface Meal {
  id?: string;
  title?: string;
  scheduledDate?: string;
  scheduled?: string;
  meal?: string;
  recipeId?: string;
  mealPlanId?: string;
  reference?: number;
  note?: string;
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

    // First get all meal plans
    const mealPlans = await client.get('/mealPlans');

    // Then fetch each meal plan with items
    const mealPlansWithItems = await Promise.all(
      mealPlans.map(async (plan: any) => {
        const fullPlan = await client.get(`/mealPlans/${plan.id}`);
        return fullPlan;
      })
    );

    // Filter items by date range
    const filteredPlans = mealPlansWithItems.map((plan: any) => {
      const items = (plan.items || []).filter((item: any) => {
        if (!item.scheduled) return false;
        const itemDate = item.scheduled.split('T')[0]; // Get YYYY-MM-DD part
        return itemDate >= params.startDate && itemDate <= params.endDate;
      });
      return { ...plan, items };
    });

    return { success: true, mealPlans: filteredPlans };
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

    // Create the meal item
    const createResponse = await client.post(`/mealPlans/${mealPlanId}`, {
      title: params.mealType,
      scheduled: params.date,
      meal: params.mealType,
      recipeId: params.recipeId
    });

    // The API returns { reference: number } but we need the actual item UUID
    // Fetch the meal plan to find the newly created item
    const mealPlan = await client.get(`/mealPlans/${mealPlanId}`);

    // Find the meal item we just created (match by recipe.id and date)
    const items = mealPlan.items || [];
    const createdItem = items.find((item: any) => {
      // Recipe ID can be in item.recipeId or item.recipe.id
      const itemRecipeId = item.recipeId || item.recipe?.id;
      // Scheduled date might include timestamp, so compare just the date part
      const itemDate = item.scheduled?.split('T')[0];
      return (
        itemRecipeId === params.recipeId &&
        itemDate === params.date &&
        item.meal === params.mealType
      );
    });

    if (!createdItem) {
      // Fallback to the reference if we can't find the item
      return {
        success: true,
        meal: {
          reference: createResponse.reference,
          mealPlanId,
          note: 'Created but could not retrieve item ID. Use get_meal_plan to find the item ID for deletion.'
        }
      };
    }

    return {
      success: true,
      meal: {
        id: createdItem.id,
        mealPlanId,
        ...createdItem
      }
    };
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

    await client.delete(`/mealPlans/${mealPlanId}/items/bulk`, { itemIds: params.mealId });
    return { success: true };
  } catch (error) {
    return { success: false, error: { type: 'unknown', message: (error as Error).message } };
  }
}
