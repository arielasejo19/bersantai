import { pingDatabase } from '../repositories/healthRepository.js';

export async function getHealthStatus() {
  const database = await pingDatabase();

  return {
    status: 'ok',
    service: 'bersantai-api',
    timestamp: new Date().toISOString(),
    database
  };
}
