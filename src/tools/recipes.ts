import type { RecipeSageClient } from '../client.js';
import type { AccountManager } from '../accounts.js';

export interface SearchRecipesParams {
  query: string;
  account?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients?: string[];
  instructions?: string;
}

export interface ToolResult {
  success: boolean;
  recipes?: Recipe[];
  error?: {
    type: 'authentication' | 'not_found' | 'validation' | 'network' | 'unknown';
    message: string;
    details?: string;
  };
}

export async function searchRecipes(
  params: SearchRecipesParams,
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    const response = await (client as any).recipes.search({ query: params.query });

    return {
      success: true,
      recipes: response.recipes
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          type: error.message.includes('Authentication') ? 'authentication' : 'network',
          message: error.message
        }
      };
    }
    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'An unknown error occurred'
      }
    };
  }
}

export interface GetRecipeParams {
  recipeId: string;
  account?: string;
}

export interface GetRecipeResult {
  success: boolean;
  recipe?: Recipe;
  error?: ToolResult['error'];
}

export async function getRecipe(
  params: GetRecipeParams,
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<GetRecipeResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    const recipe = await (client as any).recipes.getById({ id: params.recipeId });

    return {
      success: true,
      recipe
    };
  } catch (error) {
    if (error instanceof Error) {
      const isNotFound = error.message.includes('not found');
      return {
        success: false,
        error: {
          type: isNotFound ? 'not_found' : 'unknown',
          message: error.message
        }
      };
    }
    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'An unknown error occurred'
      }
    };
  }
}

export interface CreateRecipeParams {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  account?: string;
}

export async function createRecipe(
  params: CreateRecipeParams,
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<GetRecipeResult> {
  // Validate required fields
  if (!params.title || !params.ingredients || !params.instructions) {
    return {
      success: false,
      error: {
        type: 'validation',
        message: 'Missing required fields: title, ingredients, and instructions are required'
      }
    };
  }

  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    const recipe = await (client as any).recipes.create({
      title: params.title,
      description: params.description,
      ingredients: params.ingredients,
      instructions: params.instructions
    });

    return {
      success: true,
      recipe
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: error.message
        }
      };
    }
    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'An unknown error occurred'
      }
    };
  }
}

export interface UpdateRecipeParams {
  recipeId: string;
  updates: Partial<Recipe>;
  account?: string;
}

export async function updateRecipe(
  params: UpdateRecipeParams,
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<GetRecipeResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    const recipe = await (client as any).recipes.update({
      id: params.recipeId,
      ...params.updates
    });

    return {
      success: true,
      recipe
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: error.message
        }
      };
    }
    return {
      success: false,
      error: { type: 'unknown', message: 'An unknown error occurred' }
    };
  }
}

export interface DeleteRecipeParams {
  recipeId: string;
  account?: string;
}

export async function deleteRecipe(
  params: DeleteRecipeParams,
  accountManager: AccountManager,
  recipeSageClient: RecipeSageClient
): Promise<ToolResult> {
  try {
    const account = accountManager.getAccount(params.account);
    const client = await recipeSageClient.getClient(account);

    await (client as any).recipes.delete({ id: params.recipeId });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: error.message
        }
      };
    }
    return {
      success: false,
      error: { type: 'unknown', message: 'An unknown error occurred' }
    };
  }
}
