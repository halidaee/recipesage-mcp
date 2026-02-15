import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchRecipes, SearchRecipesParams } from '../../../src/tools/recipes';
import { RecipeSageClient } from '../../../src/client';
import { AccountManager } from '../../../src/accounts';

vi.mock('../../../src/client');
vi.mock('../../../src/accounts');

describe('Recipe Search Tool', () => {
  let mockAccountManager: any;
  let mockClient: any;

  beforeEach(() => {
    mockAccountManager = {
      getAccount: vi.fn().mockReturnValue({
        id: 'test',
        email: 'test@example.com',
        password: 'pass'
      })
    };

    mockClient = {
      getClient: vi.fn().mockResolvedValue({
        recipes: {
          search: vi.fn().mockResolvedValue({
            recipes: [
              { id: '1', title: 'Pasta Carbonara', description: 'Classic Italian' },
              { id: '2', title: 'Pasta Alfredo', description: 'Creamy pasta' }
            ]
          })
        }
      })
    };
  });

  it('should search recipes with query', async () => {
    const params: SearchRecipesParams = { query: 'pasta' };
    const result = await searchRecipes(params, mockAccountManager, mockClient);

    expect(result.success).toBe(true);
    expect(result.recipes).toHaveLength(2);
    expect(result.recipes[0].title).toBe('Pasta Carbonara');
  });

  it('should use specified account', async () => {
    const params: SearchRecipesParams = { query: 'pasta', account: 'other' };
    await searchRecipes(params, mockAccountManager, mockClient);

    expect(mockAccountManager.getAccount).toHaveBeenCalledWith('other');
  });

  it('should handle API errors gracefully', async () => {
    mockClient.getClient.mockResolvedValue({
      recipes: {
        search: vi.fn().mockRejectedValue(new Error('Network error'))
      }
    });

    const params: SearchRecipesParams = { query: 'pasta' };
    const result = await searchRecipes(params, mockAccountManager, mockClient);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('network');
  });
});
