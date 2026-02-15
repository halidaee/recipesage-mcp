# Recipe Sage MCP Server

[![npm version](https://img.shields.io/npm/v/recipesage-mcp?color=0ea5e9)](https://www.npmjs.com/package/recipesage-mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org)

A TypeScript [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that brings [Recipe Sage](https://github.com/julianpoy/RecipeSage) into Claude Code—search recipes, manage shopping lists, and plan meals, all from Claude's context window.

## Features

- 🔍 **Search recipes** – Full-text search across your recipe collection
- ✏️ **Manage recipes** – Create, read, update, and delete recipes
- 🛒 **Shopping lists** – Create lists and add/remove items
- 📅 **Meal planning** – Schedule recipes on a calendar
- 👥 **Multi-account** – Switch between multiple Recipe Sage accounts
- 🔐 **Secure** – Credentials stored locally, never sent to Claude

## Quick Start

### Prerequisites
- Node.js 18+
- Claude Code with MCP support
- A [Recipe Sage](https://www.recipesage.com) account

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/halidaee/recipesage-mcp
cd recipesage-mcp
npm install
npm run build
```

2. **Create config directory:**
```bash
mkdir -p ~/.config/recipesage-mcp
```

3. **Add your account(s) to `~/.config/recipesage-mcp/accounts.json`:**
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

4. **Secure the config file:**
```bash
chmod 600 ~/.config/recipesage-mcp/accounts.json
```

5. **Add to Claude Code:**
```bash
claude mcp add --transport stdio recipesage -- node /path/to/recipesage-mcp/dist/index.js
```

Replace `/path/to/recipesage-mcp` with your actual installation path.

## Usage

All tools are available in Claude Code. Use them directly in your conversations:

### Recipe Management
- `search_recipes(query)` – Search recipes by title or ingredients
- `get_recipe(recipeId)` – Fetch full recipe details
- `create_recipe(title, ingredients, instructions)` – Add a new recipe
- `update_recipe(recipeId, updates)` – Edit an existing recipe
- `delete_recipe(recipeId)` – Remove a recipe

### Shopping Lists
- `list_shopping_lists()` – View all shopping lists
- `get_shopping_list(listId)` – Get a list with all items
- `create_shopping_list(title)` – Create a new list
- `add_to_shopping_list(listId, items)` – Add items to a list
- `remove_from_shopping_list(listId, itemId)` – Remove an item
- `delete_shopping_list(listId)` – Delete a list

### Meal Planning
- `get_meal_plan(startDate, endDate)` – View your meal calendar
- `add_meal_to_plan(date, recipeId, mealType)` – Schedule a recipe
- `remove_meal_from_plan(mealId)` – Remove a scheduled meal

### Account Management
- `list_accounts()` – Show all configured accounts
- `set_default_account(accountId)` – Switch the default account

### Multi-Account Support

Every tool accepts an optional `account` parameter to use a different account:

```javascript
search_recipes({ query: "pasta", account: "family" })
```

If omitted, the default account is used. See [Configuration](#configuration) to set a default.

## Troubleshooting

### Common Issues

**Authentication fails**
- Verify your Recipe Sage credentials are correct in `~/.config/recipesage-mcp/accounts.json`
- Check that `api.recipesage.com` is accessible from your machine
- The MCP uses tRPC login at `POST /trpc/users.login`

**Recipe/shopping/meal tools fail**
- These tools use REST endpoints (`/recipes`, `/shoppingLists`, `/mealPlans`)
- If you see a 404 error, the API endpoint may have moved
- See "API Changes" below for migration guidance

**Auth token rejected ("must be logged in")**
- REST endpoints use `?token=` query parameter authentication (not `Bearer` header)
- Verify the token is being passed correctly

### API Changes

Recipe Sage is an [open-source project](https://github.com/julianpoy/RecipeSage) actively migrating from REST to tRPC. If endpoints break, check the RecipeSage repository:

| Component | Files to Check |
|-----------|-----------------|
| Authentication | `packages/trpc/src/procedures/users/` |
| REST endpoints | `packages/trpc/src/procedures/` (for tRPC equivalents) |
| Frontend implementation | `packages/frontend/src/` (for auth token handling) |

**If a REST endpoint breaks:**
1. Check the [RecipeSage repository](https://github.com/julianpoy/RecipeSage) for the tRPC equivalent
2. tRPC endpoints are at `POST /trpc/{router}.{procedure}` with JSON body
3. Responses are wrapped: `{ result: { data: ... } }`
4. Update the corresponding file in `src/tools/`

**Key files to update:**
- `src/client.ts` – Base URL, login endpoint, auth handling
- `src/tools/recipes.ts` – Recipe endpoints
- `src/tools/shopping.ts` – Shopping list endpoints
- `src/tools/meals.ts` – Meal plan endpoints

## Development

### Setup

```bash
npm install
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Watch mode
npm test -- --watch
```

### Project Structure

```
src/
├── index.ts           # MCP server entry point
├── client.ts          # Recipe Sage API client
├── accounts.ts        # Account configuration management
├── schemas.ts         # MCP tool schema definitions
├── tools/             # Tool implementations
│   ├── recipes.ts
│   ├── shopping.ts
│   ├── meals.ts
│   └── accounts.ts
└── types/
    └── config.ts      # Type definitions
```

### Adding New Tools

1. Create the tool function in `src/tools/`
2. Add the schema to `src/schemas.ts`
3. Register the handler in `src/index.ts`
4. Add tests in `tests/`
5. Update this README

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Acknowledgments

- [Recipe Sage](https://github.com/julianpoy/RecipeSage) – The amazing recipe management platform this MCP integrates with
- [Model Context Protocol](https://modelcontextprotocol.io) – The protocol that makes Claude integrations possible
