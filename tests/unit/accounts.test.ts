import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AccountConfig, RecipeSageConfig, validateConfig } from '../../src/types/config';
import { AccountManager } from '../../src/accounts';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

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

describe('AccountManager', () => {
  const testConfigDir = join(tmpdir(), 'recipesage-mcp-test');
  const testConfigPath = join(testConfigDir, 'accounts.json');

  beforeEach(() => {
    mkdirSync(testConfigDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testConfigDir, { recursive: true, force: true });
  });

  it('should load valid config from file', () => {
    const config = {
      accounts: [
        { id: 'test', email: 'test@example.com', password: 'pass123', default: true }
      ]
    };
    writeFileSync(testConfigPath, JSON.stringify(config));

    const manager = new AccountManager(testConfigPath);
    manager.loadAccounts();

    expect(manager.getAccount('test')).toEqual(config.accounts[0]);
  });

  it('should throw if config file does not exist', () => {
    const manager = new AccountManager('/nonexistent/path.json');
    expect(() => manager.loadAccounts()).toThrow('Config file not found');
  });

  it('should throw if config file has invalid JSON', () => {
    writeFileSync(testConfigPath, 'invalid json{');
    const manager = new AccountManager(testConfigPath);
    expect(() => manager.loadAccounts()).toThrow('Invalid JSON');
  });
});
