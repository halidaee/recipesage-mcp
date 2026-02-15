import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  SearchRecipesParams,
  GetRecipeParams,
  CreateRecipeParams,
  UpdateRecipeParams,
  DeleteRecipeParams
} from '../../../src/tools/recipes';

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
        get: vi.fn().mockResolvedValue({
          data: [
            { id: '1', title: 'Pasta Carbonara', description: 'Classic Italian' },
            { id: '2', title: 'Pasta Alfredo', description: 'Creamy pasta' }
          ]
        }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })
    };
  });

  it('should search recipes with query', async () => {
    const params: SearchRecipesParams = { query: 'pasta' };
    const result = await searchRecipes(params, mockAccountManager, mockClient);

    expect(result.success).toBe(true);
    expect(result.recipes).toHaveLength(2);
    expect(result.recipes![0].title).toBe('Pasta Carbonara');
  });

  it('should use specified account', async () => {
    const params: SearchRecipesParams = { query: 'pasta', account: 'other' };
    await searchRecipes(params, mockAccountManager, mockClient);

    expect(mockAccountManager.getAccount).toHaveBeenCalledWith('other');
  });

  it('should handle API errors gracefully', async () => {
    mockClient.getClient.mockResolvedValue({
      get: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const params: SearchRecipesParams = { query: 'pasta' };
    const result = await searchRecipes(params, mockAccountManager, mockClient);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('network');
  });
});

describe('Get Recipe Tool', () => {
  let mockAccountManager: any;
  let mockClient: any;

  beforeEach(() => {
    mockAccountManager = {
      getAccount: vi.fn().mockReturnValue({ id: 'test' })
    };
  });

  it('should get recipe by ID', async () => {
    mockClient = {
      getClient: vi.fn().mockResolvedValue({
        get: vi.fn().mockResolvedValue({
          id: '1',
          title: 'Pasta Carbonara',
          ingredients: 'pasta\neggs\nbacon',
          instructions: 'Cook pasta, mix with eggs and bacon'
        }),
      })
    };

    const params: GetRecipeParams = { recipeId: '1' };
    const result = await getRecipe(params, mockAccountManager, mockClient);

    expect(result.success).toBe(true);
    expect(result.recipe?.title).toBe('Pasta Carbonara');
  });

  it('should return error for non-existent recipe', async () => {
    mockClient = {
      getClient: vi.fn().mockResolvedValue({
        get: vi.fn().mockRejectedValue(new Error('Recipe not found')),
      })
    };

    const params: GetRecipeParams = { recipeId: '999' };
    const result = await getRecipe(params, mockAccountManager, mockClient);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });
});

describe('Create Recipe Tool', () => {
  let mockAccountManager: any;
  let mockClient: any;

  beforeEach(() => {
    mockAccountManager = {
      getAccount: vi.fn().mockReturnValue({ id: 'test' })
    };

    mockClient = {
      getClient: vi.fn().mockResolvedValue({
        post: vi.fn().mockResolvedValue({
          id: 'new-123',
          title: 'My New Recipe',
        }),
      })
    };
  });

  it('should create a new recipe', async () => {
    const params: CreateRecipeParams = {
      title: 'My New Recipe',
      ingredients: 'ingredient 1',
      instructions: 'Step 1'
    };
    const result = await createRecipe(params, mockAccountManager, mockClient);

    expect(result.success).toBe(true);
    expect(result.recipe?.id).toBe('new-123');
  });

  it('should validate required fields', async () => {
    const params: any = { title: 'No ingredients' };
    const result = await createRecipe(params, mockAccountManager, mockClient);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
  });
});

describe('Update Recipe Tool', () => {
  let mockAccountManager: any;
  let mockClient: any;

  beforeEach(() => {
    mockAccountManager = {
      getAccount: vi.fn().mockReturnValue({ id: 'test' })
    };

    mockClient = {
      getClient: vi.fn().mockResolvedValue({
        put: vi.fn().mockResolvedValue({
          id: '1',
          title: 'Updated Title'
        }),
      })
    };
  });

  it('should update existing recipe', async () => {
    const params: UpdateRecipeParams = {
      recipeId: '1',
      updates: { title: 'Updated Title' }
    };
    const result = await updateRecipe(params, mockAccountManager, mockClient);

    expect(result.success).toBe(true);
    expect(result.recipe?.title).toBe('Updated Title');
  });
});

describe('Delete Recipe Tool', () => {
  let mockAccountManager: any;
  let mockClient: any;

  beforeEach(() => {
    mockAccountManager = {
      getAccount: vi.fn().mockReturnValue({ id: 'test' })
    };

    mockClient = {
      getClient: vi.fn().mockResolvedValue({
        delete: vi.fn().mockResolvedValue({}),
      })
    };
  });

  it('should delete recipe', async () => {
    const params: DeleteRecipeParams = { recipeId: '1' };
    const result = await deleteRecipe(params, mockAccountManager, mockClient);

    expect(result.success).toBe(true);
  });
});
