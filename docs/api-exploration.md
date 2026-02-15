# Recipe Sage API Exploration

## API Base URL

- Production: `https://www.recipesage.com/api/`
- Local/self-hosted: `http://localhost:3000/api/`

## Architecture

Recipe Sage uses a **hybrid REST + tRPC** API:
- Legacy REST routes at `/api/{resource}`
- Modern tRPC procedures at `/api/trpc/{router}.{procedure}`

## Authentication

- **Login:** `POST /users/login`
- **Request:** `{ email: string, password: string }`
- **Response:** `{ token: string, userId: string, email: string }`
- **Token usage:** `Authorization: Bearer {token}` header

## Recipe Endpoints

### REST
- `GET /recipes/search?q={query}` - Search recipes
- `GET /recipes/:recipeId` - Get recipe by ID
- `GET /recipes/by-page?page=N&folder=main` - Paginated list
- `POST /recipes` - Create recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe

### tRPC
- `recipes.searchRecipes` (Query)
- `recipes.getRecipe` (Query) - `{ id: UUID }`
- `recipes.createRecipe` (Mutation)
- `recipes.updateRecipe` (Mutation)
- `recipes.deleteRecipe` (Mutation) - `{ id: UUID }`

### Recipe Schema
```
{
  title: string (1-254 chars, required),
  description: string,
  yield: string,
  activeTime: string,
  totalTime: string,
  source: string,
  url: string,
  notes: string,
  ingredients: string,
  instructions: string,
  rating: number (1-5) | null,
  folder: "main" | "inbox",
  labelIds: UUID[],
  imageIds: UUID[]
}
```

**Note:** `ingredients` and `instructions` are single strings in the API, not arrays.

## Shopping List Endpoints

### REST
- `GET /shoppingLists` - List all
- `GET /shoppingLists/:id` - Get with items
- `POST /shoppingLists` - Create list `{ title, collaboratorUserIds }`
- `POST /shoppingLists/:id` - Add item `{ title, completed, categoryTitle }`
- `DELETE /shoppingLists/:id/items` - Remove items `{ itemIds: UUID[] }`
- `DELETE /shoppingLists/:id` - Delete list

### tRPC
- `shoppingLists.getShoppingLists` (Query)
- `shoppingLists.getShoppingList` (Query) - `{ id: UUID }`
- `shoppingLists.createShoppingList` (Mutation)
- `shoppingLists.createShoppingListItem` (Mutation)
- `shoppingLists.deleteShoppingListItem` (Mutation)
- `shoppingLists.deleteShoppingList` (Mutation)

## Meal Plan Endpoints

### REST
- `GET /mealPlans` - List all meal plans
- `GET /mealPlans/:id` - Get plan with items
- `POST /mealPlans` - Create plan `{ title, collaboratorUserIds }`
- `POST /mealPlans/:id` - Add item `{ title, scheduledDate, meal, recipeId }`
- `DELETE /mealPlans/:id/items` - Remove items `{ itemIds }`
- `DELETE /mealPlans/:id` - Delete plan

### Meal types
`"breakfast" | "lunch" | "dinner" | "snacks" | "other"`

### tRPC
- `mealPlans.getMealPlans` (Query)
- `mealPlans.getMealPlan` (Query) - `{ id: UUID }`
- `mealPlans.createMealPlan` (Mutation)
- `mealPlans.createMealPlanItem` (Mutation)
- `mealPlans.deleteMealPlanItem` (Mutation)
- `mealPlans.deleteMealPlan` (Mutation)

## Key Implementation Notes

1. Meal plans and shopping lists are **containers** with items inside them
2. `ingredients` and `instructions` are strings (not arrays) in the API
3. The tRPC endpoint format is: `POST /api/trpc/{router}.{procedure}`
4. Meal types include "snacks" and "other" (not just "snack")
