import { getHealthStatus } from '../services/healthService.js';

export async function getHealth(_request, response, next) {
  try {
    const health = await getHealthStatus();
    response.status(200).json(health);
  } catch (error) {
    next(error);
  }
}
