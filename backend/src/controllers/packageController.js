import * as service from '../services/packageService.js';
import { packageSchema } from '../validators/packageValidators.js';
import { validateBody } from '../validators/validate.js';
import { updatePackageMedia } from '../repositories/packageRepository.js';
import { storeMedia } from '../services/mediaStorageService.js';
import { ApiError } from '../utils/apiError.js';
export async function listPublicPackages(_request, response) { response.json({ packages: await service.listPackages({ activeOnly: true }) }); }
export async function listManagedPackages(_request, response) { response.json({ packages: await service.listPackages() }); }
export async function createManagedPackage(request, response) { response.status(201).json({ package: await service.createPackage(validateBody(packageSchema, request.body)) }); }
export async function updateManagedPackage(request, response) { response.json({ package: await service.updatePackage(request.params.packageId, validateBody(packageSchema, request.body)) }); }
export async function deleteManagedPackage(request, response) { await service.deletePackage(request.params.packageId); response.status(204).send(); }
export async function uploadManagedPackageMedia(request, response) { if (!request.file) throw new ApiError(400, 'A media file is required'); response.json({ package: await updatePackageMedia(request.params.packageId, await storeMedia(request.file)) }); }