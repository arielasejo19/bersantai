import { createService, deleteService, listServices, updateService } from '../repositories/serviceRepository.js';

export { createService, deleteService, updateService };
export function getPublicServices() { return listServices({ activeOnly: true }); }
export function getManagedServices() { return listServices(); }
