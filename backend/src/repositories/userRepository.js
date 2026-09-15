import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function requireDatabase() {
  const db = getDatabase();

  if (!db) {
    throw new ApiError(503, 'Database is not configured');
  }

  return db;
}

function toSafeUser(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    email: row.email,
    role: row.role,
    accountStatus: row.account_status,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at
  };
}

export async function findUserByEmail(email, trx = requireDatabase()) {
  return trx('users').where({ email }).first();
}

export async function findUserWithProfileById(id, trx = requireDatabase()) {
  const row = await trx('users')
    .leftJoin('profiles', 'profiles.user_id', 'users.id')
    .select(
      'users.id',
      'users.email',
      'users.role',
      'users.account_status',
      'users.created_at',
      'users.updated_at',
      'users.last_login_at',
      'profiles.display_name',
      'profiles.bio',
      'profiles.avatar_url'
    )
    .where('users.id', id)
    .first();

  return toSafeUser(row);
}

export async function createUserWithProfile({ email, passwordHash, displayName }) {
  const db = requireDatabase();

  return db.transaction(async (trx) => {
    const existingUser = await findUserByEmail(email, trx);

    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const [userId] = await trx('users').insert({
      email,
      password_hash: passwordHash,
      role: 'guest',
      account_status: 'active'
    });

    await trx('profiles').insert({
      user_id: userId,
      display_name: displayName
    });

    return findUserWithProfileById(userId, trx);
  });
}

export async function createManagedUser({ email, passwordHash, displayName, role }) {
  const db = requireDatabase();

  return db.transaction(async (trx) => {
    const existingUser = await findUserByEmail(email, trx);

    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const [userId] = await trx('users').insert({
      email,
      password_hash: passwordHash,
      role,
      account_status: 'active'
    });

    await trx('profiles').insert({
      user_id: userId,
      display_name: displayName
    });

    return findUserWithProfileById(userId, trx);
  });
}

export async function updateLastLogin(userId) {
  const db = requireDatabase();

  await db('users').where({ id: userId }).update({
    last_login_at: db.fn.now()
  });
}

export async function listAccounts({ role } = {}) {
  const db = requireDatabase();
  let query = db('users')
    .leftJoin('profiles', 'profiles.user_id', 'users.id')
    .select(
      'users.id',
      'users.email',
      'users.role',
      'users.account_status',
      'users.created_at',
      'users.last_login_at',
      'profiles.display_name'
    )
    .orderBy('users.created_at', 'desc');

  if (role) query = query.where('users.role', role);

  const rows = await query;
  return rows.map((row) => ({
    id: String(row.id),
    email: row.email,
    role: row.role,
    accountStatus: row.account_status,
    displayName: row.display_name,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  }));
}
