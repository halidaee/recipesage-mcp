export const toolSchemas = [
  {
    name: 'search_recipes',
    description: 'Search for recipes by text query',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (recipe name, ingredients, etc.)'
        },
        account: {
          type: 'string',
          description: 'Account ID to use (optional, uses default if not specified)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_recipe',
    description: 'Get detailed information about a specific recipe',
    inputSchema: {
      type: 'object' as const,
      properties: {
        recipeId: { type: 'string', description: 'Recipe ID' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['recipeId']
    }
  },
  {
    name: 'create_recipe',
    description: 'Create a new recipe',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Recipe title' },
        description: { type: 'string', description: 'Recipe description' },
        ingredients: { type: 'string', description: 'Ingredients (one per line)' },
        instructions: { type: 'string', description: 'Cooking instructions' },
        source: { type: 'string', description: 'Recipe source' },
        url: { type: 'string', description: 'Source URL' },
        yield: { type: 'string', description: 'Serving size' },
        activeTime: { type: 'string', description: 'Active cooking time' },
        totalTime: { type: 'string', description: 'Total time' },
        notes: { type: 'string', description: 'Additional notes' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['title', 'ingredients', 'instructions']
    }
  },
  {
    name: 'update_recipe',
    description: 'Update an existing recipe',
    inputSchema: {
      type: 'object' as const,
      properties: {
        recipeId: { type: 'string', description: 'Recipe ID to update' },
        updates: {
          type: 'object',
          description: 'Fields to update (title, description, ingredients, instructions, etc.)'
        },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['recipeId', 'updates']
    }
  },
  {
    name: 'delete_recipe',
    description: 'Delete a recipe',
    inputSchema: {
      type: 'object' as const,
      properties: {
        recipeId: { type: 'string', description: 'Recipe ID to delete' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['recipeId']
    }
  },
  {
    name: 'list_shopping_lists',
    description: 'Get all shopping lists',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account: { type: 'string', description: 'Account ID (optional)' }
      }
    }
  },
  {
    name: 'get_shopping_list',
    description: 'Get a shopping list with its items',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listId: { type: 'string', description: 'Shopping list ID' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['listId']
    }
  },
  {
    name: 'create_shopping_list',
    description: 'Create a new shopping list',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Shopping list title' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['title']
    }
  },
  {
    name: 'add_to_shopping_list',
    description: 'Add items to a shopping list',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listId: { type: 'string', description: 'Shopping list ID' },
        items: {
          type: 'array',
          items: { type: 'string' },
          description: 'Items to add'
        },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['listId', 'items']
    }
  },
  {
    name: 'remove_from_shopping_list',
    description: 'Remove an item from a shopping list',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listId: { type: 'string', description: 'Shopping list ID' },
        itemId: { type: 'string', description: 'Item ID to remove' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['listId', 'itemId']
    }
  },
  {
    name: 'delete_shopping_list',
    description: 'Delete a shopping list',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listId: { type: 'string', description: 'Shopping list ID' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['listId']
    }
  },
  {
    name: 'get_meal_plan',
    description: 'Get meal plan for a date range',
    inputSchema: {
      type: 'object' as const,
      properties: {
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['startDate', 'endDate']
    }
  },
  {
    name: 'add_meal_to_plan',
    description: 'Add a meal to the meal plan',
    inputSchema: {
      type: 'object' as const,
      properties: {
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        recipeId: { type: 'string', description: 'Recipe ID' },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          description: 'Meal type'
        },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['date', 'recipeId', 'mealType']
    }
  },
  {
    name: 'remove_meal_from_plan',
    description: 'Remove a meal from the plan',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mealId: { type: 'string', description: 'Meal plan item ID' },
        account: { type: 'string', description: 'Account ID (optional)' }
      },
      required: ['mealId']
    }
  },
  {
    name: 'list_accounts',
    description: 'List all configured Recipe Sage accounts',
    inputSchema: {
      type: 'object' as const,
      properties: {}
    }
  },
  {
    name: 'set_default_account',
    description: 'Change the default Recipe Sage account',
    inputSchema: {
      type: 'object' as const,
      properties: {
        accountId: { type: 'string', description: 'Account ID to set as default' }
      },
      required: ['accountId']
    }
  }
];
