# Setup Guide

## Initial Setup

1. Install dependencies and build:
```bash
npm install
npm run build
```

2. Create config directory:
```bash
mkdir -p ~/.config/recipesage-mcp
```

3. Create accounts file at `~/.config/recipesage-mcp/accounts.json`:
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

4. Secure the credentials file:
```bash
chmod 600 ~/.config/recipesage-mcp/accounts.json
```

5. Add to Claude Code:
```bash
claude mcp add --transport stdio recipesage -- node /path/to/recipesage_mcp/dist/index.js
```

## Available Tools

### Recipe Management
- `search_recipes` - Search recipes by text query
- `get_recipe` - Get detailed recipe information by ID
- `create_recipe` - Create a new recipe (title, ingredients, instructions required)
- `update_recipe` - Update an existing recipe
- `delete_recipe` - Delete a recipe

### Shopping Lists
- `list_shopping_lists` - View all shopping lists
- `get_shopping_list` - Get a list with its items
- `create_shopping_list` - Create a new list
- `add_to_shopping_list` - Add items to a list
- `remove_from_shopping_list` - Remove an item from a list
- `delete_shopping_list` - Delete a list

### Meal Planning
- `get_meal_plan` - View meal plan for a date range
- `add_meal_to_plan` - Schedule a meal (date, recipe, meal type)
- `remove_meal_from_plan` - Remove a scheduled meal

### Account Management
- `list_accounts` - View configured accounts (passwords hidden)
- `set_default_account` - Change the default account

## Multi-Account Usage

All tools accept an optional `account` parameter:

```
search_recipes({ query: "pasta", account: "family" })
```

If omitted, the default account is used. The first account in the config is the default unless one has `"default": true`.
