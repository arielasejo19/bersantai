import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() { const db = getDatabase(); if (!db) throw new ApiError(503, 'Database is not configured'); return db; }

export async function createChallenge(email) {
  const db = database();
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recent = await db('email_verification_challenges').where({ email }).where('created_at', '>', since).count({ count: '*' }).first();
  if (Number(recent.count) >= 5) throw new ApiError(429, 'Too many verification codes requested. Please try again later.');
  await db('email_verification_challenges').where({ email }).update({ expires_at: new Date() });
  const code = String(crypto.randomInt(100000, 1000000));
  const challengeId = crypto.randomUUID();
  await db('email_verification_challenges').insert({ email, code_hash: await bcrypt.hash(code, 10), verification_token: challengeId, expires_at: new Date(Date.now() + 10 * 60 * 1000) });
  return { challengeId, code };
}

export async function verifyChallenge(email, challengeId, code) {
  const db = database();
  const challenge = await db('email_verification_challenges').where({ email, verification_token: challengeId }).whereNull('verified_at').first();
  if (!challenge || new Date(challenge.expires_at) < new Date()) throw new ApiError(400, 'This verification code has expired. Request a new code.');
  if (!(await bcrypt.compare(code, challenge.code_hash))) throw new ApiError(400, 'Invalid verification code');
  await db('email_verification_challenges').where({ id: challenge.id }).update({ verified_at: db.fn.now() });
  return { verificationToken: challenge.verification_token };
}

export async function isVerifiedChallenge(email, verificationToken) {
  const challenge = await database()('email_verification_challenges').where({ email, verification_token: verificationToken }).whereNotNull('verified_at').first();
  return Boolean(challenge && new Date(challenge.expires_at) >= new Date());
}
