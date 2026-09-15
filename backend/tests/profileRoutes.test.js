import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('profile routes', () => {
  it('requires authentication to read a profile', async () => {
    const response = await request(createApp()).get('/api/v1/profile').expect(401);

    expect(response.body.message).toBe('Authentication required');
  });

  it('requires authentication to update a profile', async () => {
    const response = await request(createApp())
      .put('/api/v1/profile')
      .send({ displayName: 'Guest User' })
      .expect(401);

    expect(response.body.message).toBe('Authentication required');
  });
});
