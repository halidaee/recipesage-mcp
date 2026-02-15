import { describe, it, expect } from 'vitest';
import { AccountConfig, RecipeSageConfig, validateConfig } from '../../src/types/config';

describe('Account Config Types', () => {
  it('should validate a valid config with single account', () => {
    const config: RecipeSageConfig = {
      accounts: [
        {
          id: 'personal',
          email: 'test@example.com',
          password: 'password123',
          default: true
        }
      ]
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('should reject config with no accounts', () => {
    const config: RecipeSageConfig = { accounts: [] };
    expect(() => validateConfig(config)).toThrow('No accounts configured');
  });

  it('should reject config with multiple default accounts', () => {
    const config: RecipeSageConfig = {
      accounts: [
        { id: 'a', email: 'a@test.com', password: 'pass', default: true },
        { id: 'b', email: 'b@test.com', password: 'pass', default: true }
      ]
    };
    expect(() => validateConfig(config)).toThrow('Multiple default accounts');
  });

  it('should reject account with missing email', () => {
    const config = {
      accounts: [{ id: 'test', password: 'pass', default: true }]
    };
    expect(() => validateConfig(config as any)).toThrow('Missing required field');
  });
});
