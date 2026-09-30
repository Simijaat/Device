import { describe, it, expect } from 'vitest';
import { apiClient } from './apiClient';

describe('apiClient', () => {
  it('should be defined', () => {
      expect(apiClient).toBeDefined();
  });
});
