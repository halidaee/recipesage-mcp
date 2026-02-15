#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { AccountManager } from './accounts.js';
import { RecipeSageClient } from './client.js';
import { homedir } from 'os';
import { join } from 'path';

// Import all tools
import * as recipeTools from './tools/recipes.js';
import * as shoppingTools from './tools/shopping.js';
import * as mealTools from './tools/meals.js';
import * as accountTools from './tools/accounts.js';

const CONFIG_PATH = join(homedir(), '.config', 'recipesage-mcp', 'accounts.json');

export function createServer(): Server {
  const server = new Server(
    {
      name: 'recipesage-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Initialize managers
  const accountManager = new AccountManager(CONFIG_PATH);
  const recipeSageClient = new RecipeSageClient();

  // Load accounts
  try {
    accountManager.loadAccounts();
  } catch (error) {
    console.error('Failed to load accounts:', error);
    process.exit(1);
  }

  // Register tool handlers
  server.setRequestHandler('tools/call' as any, async (request: any) => {
    const { name, arguments: args } = request.params;

    let result: any;
    try {
      switch (name) {
        // Recipe tools
        case 'search_recipes':
          result = await recipeTools.searchRecipes(args as any, accountManager, recipeSageClient);
          break;
        case 'get_recipe':
          result = await recipeTools.getRecipe(args as any, accountManager, recipeSageClient);
          break;
        case 'create_recipe':
          result = await recipeTools.createRecipe(args as any, accountManager, recipeSageClient);
          break;
        case 'update_recipe':
          result = await recipeTools.updateRecipe(args as any, accountManager, recipeSageClient);
          break;
        case 'delete_recipe':
          result = await recipeTools.deleteRecipe(args as any, accountManager, recipeSageClient);
          break;

        // Shopping list tools
        case 'list_shopping_lists':
          result = await shoppingTools.listShoppingLists(args as any, accountManager, recipeSageClient);
          break;
        case 'get_shopping_list':
          result = await shoppingTools.getShoppingList(args as any, accountManager, recipeSageClient);
          break;
        case 'create_shopping_list':
          result = await shoppingTools.createShoppingList(args as any, accountManager, recipeSageClient);
          break;
        case 'add_to_shopping_list':
          result = await shoppingTools.addToShoppingList(args as any, accountManager, recipeSageClient);
          break;
        case 'remove_from_shopping_list':
          result = await shoppingTools.removeFromShoppingList(args as any, accountManager, recipeSageClient);
          break;
        case 'delete_shopping_list':
          result = await shoppingTools.deleteShoppingList(args as any, accountManager, recipeSageClient);
          break;

        // Meal planning tools
        case 'get_meal_plan':
          result = await mealTools.getMealPlan(args as any, accountManager, recipeSageClient);
          break;
        case 'add_meal_to_plan':
          result = await mealTools.addMealToPlan(args as any, accountManager, recipeSageClient);
          break;
        case 'remove_meal_from_plan':
          result = await mealTools.removeMealFromPlan(args as any, accountManager, recipeSageClient);
          break;

        // Account tools
        case 'list_accounts':
          result = accountTools.listAccounts(accountManager);
          break;
        case 'set_default_account':
          result = accountTools.setDefaultAccount(args as any, accountManager);
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: {
              type: 'unknown',
              message: error instanceof Error ? error.message : 'Unknown error'
            }
          }, null, 2)
        }],
        isError: true
      };
    }
  });

  return server;
}

// Run server if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  const transport = new StdioServerTransport();
  server.connect(transport);

  console.error('Recipe Sage MCP Server running on stdio');
}
