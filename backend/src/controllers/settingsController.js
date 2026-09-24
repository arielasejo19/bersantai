import { getSystemConfig, updateSystemConfig } from '../services/settingsService.js';
import { z } from 'zod';
import { validateBody } from '../validators/validate.js';
import { storeMedia } from '../services/mediaStorageService.js';

const modeSchema = z.object({ operatingMode: z.enum(['airbnb', 'hotel']), publicSite: z.object({ location: z.string().trim().max(180).optional(), address: z.string().trim().max(180).optional(), contactNumber: z.string().trim().max(50).optional(), email: z.string().trim().email().max(255).optional(), description: z.string().trim().max(255).optional(), mapUrl: z.string().max(1000).optional() }).partial().default({}) });

export async function getConfig(_request, response) {
  response.json({ config: await getSystemConfig() });
}

export async function updateConfig(request, response) {
  const input = validateBody(modeSchema, request.body);
  response.json({ config: await updateSystemConfig(input) });
}

export async function uploadPublicMap(request, response) {
  if (!request.file) return response.status(400).json({ message: 'A map image is required' });
  const media = await storeMedia(request.file);
  const current = await getSystemConfig();
  response.json({ config: await updateSystemConfig({ operatingMode: current.operatingMode, publicSite: { mapUrl: media.url } }) });
}