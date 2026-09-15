import { getSystemConfig, updateSystemConfig } from '../services/settingsService.js';
import { z } from 'zod';
import { validateBody } from '../validators/validate.js';

const modeSchema = z.object({ operatingMode: z.enum(['airbnb', 'hotel']) });

export async function getConfig(_request, response) {
  response.json({ config: await getSystemConfig() });
}

export async function updateConfig(request, response) {
  const input = validateBody(modeSchema, request.body);
  response.json({ config: await updateSystemConfig(input.operatingMode) });
}