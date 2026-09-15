import { getOperatingMode, setOperatingMode } from '../repositories/settingsRepository.js';

export const getSystemConfig = async () => ({ operatingMode: await getOperatingMode() });
export const updateSystemConfig = async (operatingMode) => ({ operatingMode: await setOperatingMode(operatingMode) });