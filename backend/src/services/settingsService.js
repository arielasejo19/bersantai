import { getOperatingMode, getPublicSiteSettings, setOperatingMode, setPublicSiteSettings } from '../repositories/settingsRepository.js';

export const getSystemConfig = async () => ({ operatingMode: await getOperatingMode(), publicSite: await getPublicSiteSettings() });
export const updateSystemConfig = async (input) => ({ operatingMode: await setOperatingMode(input.operatingMode), publicSite: await setPublicSiteSettings(input.publicSite || {}) });