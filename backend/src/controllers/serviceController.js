import { createService, deleteService, getManagedServices, getPublicServices, updateService } from '../services/serviceService.js';
import { serviceSchema } from '../validators/serviceValidators.js';
import { validateBody } from '../validators/validate.js';
import { updateServiceMedia } from '../repositories/serviceRepository.js';
import { storeMedia } from '../services/mediaStorageService.js';
import { ApiError } from '../utils/apiError.js';

export async function listPublicServices(_request, response) { response.json({ services: await getPublicServices() }); }
export async function listManagedServices(_request, response) { response.json({ services: await getManagedServices() }); }
export async function createManagedService(request, response) { response.status(201).json({ service: await createService(validateBody(serviceSchema, request.body)) }); }
export async function updateManagedService(request, response) { response.json({ service: await updateService(request.params.serviceId, validateBody(serviceSchema, request.body)) }); }
export async function removeManagedService(request, response) { await deleteService(request.params.serviceId); response.status(204).send(); }
export async function uploadServiceMedia(request, response) { if (!request.file) throw new ApiError(400, 'A media file is required'); response.json({ service: await updateServiceMedia(request.params.serviceId, await storeMedia(request.file)) }); }
