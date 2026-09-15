import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('auth routes', () => {
  it('validates missing registration fields', async () => {
    const response = await request(createApp()).post('/api/v1/auth/register').send({}).expect(400);

    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated current-user requests', async () => {
    const response = await request(createApp()).get('/api/v1/auth/me').expect(401);

    expect(response.body.message).toBe('Authentication required');
  });

  it('clears the auth cookie during logout', async () => {
    const response = await request(createApp()).post('/api/v1/auth/logout').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['set-cookie']?.join(';')).toContain('bersantai_session=');
  });
});
