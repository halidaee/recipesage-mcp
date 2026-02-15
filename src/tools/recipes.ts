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

    const response = await client.recipes.search({ query: params.query });

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
