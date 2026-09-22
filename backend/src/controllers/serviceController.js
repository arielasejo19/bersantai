import { createService, deleteService, getManagedServices, getPublicServices, updateService } from '../services/serviceService.js';
import { serviceSchema } from '../validators/serviceValidators.js';
import { validateBody } from '../validators/validate.js';

export async function listPublicServices(_request, response) { response.json({ services: await getPublicServices() }); }
export async function listManagedServices(_request, response) { response.json({ services: await getManagedServices() }); }
export async function createManagedService(request, response) { response.status(201).json({ service: await createService(validateBody(serviceSchema, request.body)) }); }
export async function updateManagedService(request, response) { response.json({ service: await updateService(request.params.serviceId, validateBody(serviceSchema, request.body)) }); }
export async function removeManagedService(request, response) { await deleteService(request.params.serviceId); response.status(204).send(); }
