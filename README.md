# Recipe Sage MCP Server

A Model Context Protocol (MCP) server that provides Claude with access to Recipe Sage accounts.

## Features

- 🔍 Search and retrieve recipes
- ✏️ Create, update, and delete recipes
- 🛒 Manage shopping lists
- 📅 Plan meals with calendar integration
- 👥 Multi-account support
- 🔐 Secure credential storage

## Installation

```bash
npm install
npm run build
```

## Configuration

1. Create config directory:
```bash
mkdir -p ~/.config/recipesage-mcp
```

2. Create accounts file at `~/.config/recipesage-mcp/accounts.json`:
```json
{
  "accounts": [
    {
      "id": "personal",
      "email": "your-email@example.com",
      "password": "your-password",
      "default": true
    }
  ]
}
```

3. Set file permissions:
```bash
chmod 600 ~/.config/recipesage-mcp/accounts.json
```

## Claude Code Configuration

Add the MCP server to Claude Code:

```bash
claude mcp add --transport stdio recipesage -- node /Users/halidaee/recipesage_mcp/dist/index.js
```

## Available Tools

### Recipe Management
- `search_recipes` - Search recipes by text
- `get_recipe` - Get recipe details
- `create_recipe` - Add new recipe
- `update_recipe` - Edit existing recipe
- `delete_recipe` - Remove recipe

### Shopping Lists
- `list_shopping_lists` - View all lists
- `get_shopping_list` - Get list with items
- `create_shopping_list` - Create new list
- `add_to_shopping_list` - Add items
- `remove_from_shopping_list` - Remove item
- `delete_shopping_list` - Remove list

### Meal Planning
- `get_meal_plan` - View meal calendar
- `add_meal_to_plan` - Schedule meal
- `remove_meal_from_plan` - Remove scheduled meal

### Account Management
- `list_accounts` - View configured accounts
- `set_default_account` - Change default account

## Multi-Account Usage

All tools accept an optional `account` parameter:

```javascript
search_recipes({ query: "pasta", account: "family" })
```

If omitted, uses the default account.

## Troubleshooting

This MCP server talks to the Recipe Sage API at `api.recipesage.com`. Recipe Sage is an open-source project ([github.com/julianpoy/RecipeSage](https://github.com/julianpoy/RecipeSage)) that is actively migrating from REST endpoints to tRPC. If things break, it likely means the API has changed upstream.

### What to check

1. **Authentication fails** - Login uses the tRPC endpoint `POST /trpc/users.login` with raw JSON `{ email, password }`. If this breaks, check whether the login procedure has moved or its input format changed. Look at `packages/trpc/src/procedures/users/` in the RecipeSage repo.

2. **Recipe/shopping/meal calls fail** - These currently use REST endpoints (`/recipes`, `/shoppingLists`, `/mealPlans`). The maintainer is moving these to tRPC equivalents at `/trpc/recipes.*`, `/trpc/shoppingLists.*`, `/trpc/mealPlans.*`. If a REST endpoint returns 404, the tRPC version probably exists - check `packages/trpc/src/procedures/` in the repo for the current procedure names.

3. **Auth token rejected ("must be logged in")** - The REST endpoints use `?token=` as a query parameter (not `Authorization: Bearer`). If this stops working, check how the RecipeSage frontend passes auth tokens - look at `packages/frontend/src/` for fetch calls.

### Key files to update

- `src/client.ts` - API base URL (`api.recipesage.com`), login endpoint, auth token handling
- `src/tools/recipes.ts` - Recipe endpoint paths (`/recipes/search`, `/recipes/:id`, etc.)
- `src/tools/shopping.ts` - Shopping list endpoint paths
- `src/tools/meals.ts` - Meal plan endpoint paths

### Migrating from REST to tRPC

When a REST endpoint stops working, the tRPC equivalent typically accepts a raw JSON body at `POST /trpc/{router}.{procedure}`. For example, if `/recipes/search?query=pasta` breaks, try `POST /trpc/recipes.searchRecipes` with `{ query: "pasta" }` as the body. The tRPC response wraps data in `{ result: { data: ... } }`.

## Development

```bash
# Run tests
npm test

# Build
npm run build

# Run in development
npm run dev
```

## License

MIT
