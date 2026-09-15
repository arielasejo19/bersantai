import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function requireDatabase() {
  const db = getDatabase();

  if (!db) {
    throw new ApiError(503, 'Database is not configured');
  }

  return db;
}

function toProfile(row) {
  if (!row) return null;

  return {
    userId: String(row.user_id),
    email: row.email,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findProfileByUserId(userId) {
  const db = requireDatabase();
  const row = await db('profiles')
    .join('users', 'users.id', 'profiles.user_id')
    .select(
      'profiles.user_id',
      'users.email',
      'profiles.display_name',
      'profiles.bio',
      'profiles.avatar_url',
      'profiles.created_at',
      'profiles.updated_at'
    )
    .where('profiles.user_id', userId)
    .first();

  return toProfile(row);
}

export async function updateProfileByUserId(userId, updates) {
  const db = requireDatabase();

  await db('profiles').where({ user_id: userId }).update({
    display_name: updates.displayName,
    bio: updates.bio,
    avatar_url: updates.avatarUrl
  });

  return findProfileByUserId(userId);
}
