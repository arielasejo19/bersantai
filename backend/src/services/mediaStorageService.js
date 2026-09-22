import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiError } from '../utils/apiError.js';

const uploadDirectory = fileURLToPath(new URL('../../uploads/', import.meta.url));
const allowedTypes = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/gif', 'gif'],
  ['video/mp4', 'mp4'], ['video/webm', 'webm'], ['video/quicktime', 'mov']
]);

export async function storeMedia(file) {
  const extension = allowedTypes.get(file.mimetype);
  if (!extension) throw new ApiError(400, 'Unsupported media type');
  await fs.mkdir(uploadDirectory, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(uploadDirectory, filename), file.buffer);
  return { url: `/uploads/${filename}`, mediaType: file.mimetype.startsWith('video/') ? 'video' : 'image' };
}
