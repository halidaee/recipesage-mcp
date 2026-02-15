# Recipe Sage MCP Server - Design Document

**Date:** 2026-02-14
**Status:** Approved

## Overview

A TypeScript-based Model Context Protocol (MCP) server that provides Claude with access to Recipe Sage accounts. Enables recipe search, management, shopping lists, and meal planning through natural language interactions.

## Goals

- Enable Claude to search and retrieve recipes from Recipe Sage
- Support full CRUD operations on recipes, shopping lists, and meal plans
- Handle multiple Recipe Sage accounts with easy switching
- Store credentials securely outside the codebase
- Provide type-safe API integration using TRPC

## Target Use Case

Primary: Search and retrieve recipes while planning meals or cooking
Secondary: Full recipe management, shopping list coordination, meal planning

## Architecture

### High-Level Structure

```
Claude ↔ MCP Server ↔ TRPC Client ↔ Recipe Sage API (recipesage.com)
```

### Technology Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript 5+
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **API Client:** `@trpc/client`
- **HTTP Client:** Native `fetch` (Node 18+)
- **Testing:** Vitest

### Project Structure

```
recipesage-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── client.ts          # TRPC client setup & authentication
│   ├── accounts.ts        # Multi-account management
│   ├── tools/             # MCP tool definitions
│   │   ├── recipes.ts     # Recipe CRUD operations
│   │   ├── shopping.ts    # Shopping list operations
│   │   ├── meals.ts       # Meal planning operations
│   │   └── accounts.ts    # Account management tools
│   └── types/             # TypeScript types
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
├── package.json
├── tsconfig.json
└── README.md
```

### Credential Storage

**Location:** `~/.config/recipesage-mcp/accounts.json`

**Format:**
```json
{
  "accounts": [
    {
      "id": "personal",
      "email": "you@example.com",
      "password": "your-password",
      "default": true
    },
    {
      "id": "family",
      "email": "family@example.com",
      "password": "family-password"
    }
  ]
}
```

**Security:**
- File permissions: `600` (owner read/write only)
- Located outside project directory
- Never committed to version control

### MCP Configuration

**Claude Code config** (`~/.claude/config.json`):
```json
{
  "mcpServers": {
    "recipesage": {
      "command": "node",
      "args": ["/path/to/recipesage-mcp/dist/index.js"]
    }
  }
}
```

No credentials in MCP config - loaded from separate file.

## Components

### 1. AccountManager (`src/accounts.ts`)

**Responsibilities:**
- Load and validate accounts config file
- Manage multiple account credentials
- Get default account or specific account by ID
- Provide account listing

**Key Methods:**
- `loadAccounts()` - Read and parse config file
- `getAccount(id?)` - Get account by ID or default
- `listAccounts()` - Return all configured accounts
- `getDefaultAccount()` - Get the default account

### 2. RecipeSageClient (`src/client.ts`)

**Responsibilities:**
- Create and configure TRPC client for Recipe Sage
- Handle authentication (login with email/password)
- Store and refresh session tokens per account
- Provide authenticated TRPC instance
- Cache clients per account (singleton pattern)

**Key Methods:**
- `getClient(accountId)` - Get or create authenticated client
- `login(email, password)` - Authenticate with Recipe Sage
- `refreshToken(accountId)` - Refresh expired session
- `clearCache(accountId?)` - Clear cached client(s)

### 3. MCP Tools

**Recipe Tools** (`src/tools/recipes.ts`):
- `search_recipes(query, account?)` - Search recipes by text
- `get_recipe(recipeId, account?)` - Get full recipe details
- `list_recipes(labels?, account?)` - List recipes with optional label filter
- `create_recipe(title, ingredients, instructions, account?)` - Add new recipe
- `update_recipe(recipeId, updates, account?)` - Edit existing recipe
- `delete_recipe(recipeId, account?)` - Delete a recipe

**Shopping List Tools** (`src/tools/shopping.ts`):
- `list_shopping_lists(account?)` - Get all shopping lists
- `get_shopping_list(listId, account?)` - Get specific list with items
- `create_shopping_list(title, account?)` - Create new shopping list
- `add_to_shopping_list(listId, items, account?)` - Add items to list
- `check_off_item(listId, itemId, account?)` - Mark item complete
- `remove_from_shopping_list(listId, itemId, account?)` - Remove item from list
- `delete_shopping_list(listId, account?)` - Delete entire shopping list

**Meal Planning Tools** (`src/tools/meals.ts`):
- `get_meal_plan(startDate, endDate, account?)` - Get meal calendar
- `add_meal_to_plan(date, recipeId, mealType, account?)` - Schedule meal
- `remove_meal_from_plan(mealId, account?)` - Remove scheduled meal

**Account Tools** (`src/tools/accounts.ts`):
- `list_accounts()` - Show available accounts
- `set_default_account(accountId)` - Change default account

**Tool Parameter Pattern:** All tools accept optional `account?: string` as last parameter. If omitted, uses default account from config.

### 4. MCP Server (`src/index.ts`)

**Responsibilities:**
- Initialize MCP server with stdio transport
- Register all tools with the server
- Handle tool invocations and route to appropriate handlers
- Manage errors and return formatted responses

## Data Flow

### Typical Request Flow

```
Claude invokes tool
  ↓
MCP Server receives request
  ↓
AccountManager.getAccount(id or default)
  ↓
RecipeSageClient.getClient(accountId)
  ↓ (if not cached)
Login to Recipe Sage API → Store session token
  ↓
TRPC Client executes API call
  ↓
Recipe Sage API returns response
  ↓
Format results for Claude
  ↓
Return response via MCP
```

### Authentication Flow

**First request for an account:**
1. Tool invoked with `account` parameter (or uses default)
2. AccountManager loads account credentials from config file
3. RecipeSageClient checks if client exists for this account in cache
4. If not cached: create TRPC client, call login endpoint with credentials
5. Store session token/JWT in memory with account ID
6. Return authenticated TRPC client

**Subsequent requests:**
1. RecipeSageClient returns cached client for account
2. If token expired: automatically re-authenticate
3. Use existing session for API calls

### Data Caching Strategy

**In-Memory Only:**
- TRPC client instances (per account)
- Session tokens (per account)
- No recipe data caching (always fetch fresh)

**Rationale:** Recipes may be updated frequently. We want Claude to always see current data. Authentication overhead is minimal with client caching.

### Multi-Account Switching

Each account maintains its own authenticated session independently. Switching accounts is instantaneous using cached clients:

```
search_recipes("pasta", "personal") → Uses personal client
search_recipes("pasta", "family") → Uses family client (both cached)
```

## Error Handling

### Error Categories

**1. Configuration Errors**
- Missing accounts config file
- Invalid JSON in config file
- No accounts configured
- Invalid account ID requested
- Missing required fields (email, password)

**Handling:** Fail fast on startup with clear error messages. Provide helpful instructions to create config file.

**2. Authentication Errors**
- Invalid credentials
- Network timeout during login
- Session token expired and refresh failed
- Recipe Sage API unavailable

**Handling:**
- Invalid credentials: Return clear error to Claude, suggest checking config
- Token expiry: Automatic retry with re-authentication (once)
- Network issues: Return error with suggestion to retry

**3. API Errors**
- Recipe not found (404)
- Permission denied (403)
- Rate limiting (429)
- Invalid parameters (400)
- Server errors (500)

**Handling:**
- Return formatted error messages to Claude
- Include error code and details
- Suggest corrective actions where applicable

**4. Tool Parameter Errors**
- Missing required parameters
- Invalid parameter types
- Invalid date formats for meal planning
- Invalid recipe IDs

**Handling:** Validate parameters before API calls, return clear error messages with expected format.

### Error Message Format

All errors returned to Claude follow consistent format:

```typescript
{
  success: false,
  error: {
    type: "authentication" | "not_found" | "validation" | "network" | "unknown",
    message: "Human-readable error description",
    details?: "Additional context or suggestions"
  }
}
```

### Retry Strategy

**Automatic retries:**
- Authentication token refresh (once)
- Network timeouts (once with exponential backoff)

**No retries:**
- Invalid credentials (user must fix config)
- 404 not found (won't change on retry)
- 400 validation errors (user must fix parameters)

### Logging

- **Development:** Verbose logging to stderr (won't interfere with stdio MCP protocol)
- **Production:** Error-level logging only (authentication attempts, API errors, configuration issues)

## Testing

### Testing Strategy

**Unit Tests:**
- AccountManager: Load config, validate accounts, get default account, handle missing config
- RecipeSageClient: Authentication flow, token caching, client creation, error handling
- Tool functions: Parameter validation, error formatting, account parameter handling

**Integration Tests:**
- End-to-end tool execution with mocked TRPC client
- Multi-account switching and independent client caching
- Authentication flow with mocked login endpoint

**Manual Testing:**
- Real API calls against actual Recipe Sage account
- MCP protocol verification using MCP inspector
- Claude Code integration testing

### Testing Tools

- **Framework:** Vitest (fast, TypeScript-native)
- **Mocking:** Vitest built-in mocks
- **Coverage Target:** 80%+ on core logic

### Manual Testing Checklist

- [ ] Create accounts config file
- [ ] Start MCP server and verify stdio communication
- [ ] Test each tool with default account
- [ ] Test each tool with explicit account parameter
- [ ] Test invalid credentials handling
- [ ] Test network error scenarios
- [ ] Verify Claude can invoke all tools successfully

## Implementation Phases

### Phase 1: Foundation
- Project setup (TypeScript, MCP SDK, TRPC)
- AccountManager implementation
- RecipeSageClient with authentication
- Basic MCP server scaffold

### Phase 2: Recipe Tools
- Implement recipe search, get, list
- Implement recipe create, update, delete
- Unit tests for recipe tools

### Phase 3: Shopping & Meal Planning
- Implement shopping list tools
- Implement meal planning tools
- Integration tests for multi-account support

### Phase 4: Polish & Documentation
- Error handling refinement
- Documentation and README
- Manual testing with Claude
- CI/CD setup

## Next Steps

1. Create detailed implementation plan using `superpowers:writing-plans`
2. Set up project structure and dependencies
3. Implement Phase 1 components
4. Iterate through remaining phases with TDD approach
