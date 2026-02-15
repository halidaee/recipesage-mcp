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
