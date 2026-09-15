import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repositories = vi.hoisted(() => ({
  createUserWithProfile: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserWithProfileById: vi.fn(),
  updateLastLogin: vi.fn()
}));

vi.mock('../src/repositories/userRepository.js', () => repositories);

process.env.JWT_SECRET = 'test-secret';

const { loginUser, registerUser } = await import('../src/services/authService.js');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a user with a hashed password and safe response', async () => {
    const safeUser = {
      id: '1',
      email: 'guest@example.com',
      role: 'guest',
      displayName: 'Guest User'
    };

    repositories.findUserByEmail.mockResolvedValue(null);
    repositories.createUserWithProfile.mockResolvedValue(safeUser);

    const result = await registerUser({
      email: 'guest@example.com',
      password: 'Password1',
      displayName: 'Guest User'
    });

    const createPayload = repositories.createUserWithProfile.mock.calls[0][0];
    expect(createPayload.passwordHash).not.toBe('Password1');
    expect(await bcrypt.compare('Password1', createPayload.passwordHash)).toBe(true);
    expect(result.user).toEqual(safeUser);
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.token).toEqual(expect.any(String));
  });

  it('rejects duplicate registration email addresses', async () => {
    repositories.findUserByEmail.mockResolvedValue({ id: 1, email: 'guest@example.com' });

    await expect(
      registerUser({
        email: 'guest@example.com',
        password: 'Password1',
        displayName: 'Guest User'
      })
    ).rejects.toMatchObject({
      statusCode: 409
    });
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('Password1', 4);
    const safeUser = {
      id: '1',
      email: 'guest@example.com',
      role: 'guest',
      displayName: 'Guest User'
    };

    repositories.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'guest@example.com',
      password_hash: passwordHash,
      account_status: 'active'
    });
    repositories.findUserWithProfileById.mockResolvedValue(safeUser);

    const result = await loginUser({
      email: 'guest@example.com',
      password: 'Password1'
    });

    expect(repositories.updateLastLogin).toHaveBeenCalledWith(1);
    expect(result.user).toEqual(safeUser);
    expect(result.token).toEqual(expect.any(String));
  });

  it('uses a generic error for invalid credentials', async () => {
    repositories.findUserByEmail.mockResolvedValue(null);

    await expect(
      loginUser({
        email: 'missing@example.com',
        password: 'Password1'
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password'
    });
  });
});
