import { createVillaType, deleteVillaType, listVillaTypes, updateVillaType } from '../repositories/villaTypeRepository.js';
import { villaTypeSchema } from '../validators/villaTypeValidators.js';
import { validateBody } from '../validators/validate.js';

export async function listPublicVillaTypes(_request, response) { response.json({ villaTypes: await listVillaTypes({ activeOnly: true }) }); }
export async function listManagedVillaTypes(_request, response) { response.json({ villaTypes: await listVillaTypes() }); }
export async function createManagedVillaType(request, response) { response.status(201).json({ villaType: await createVillaType(validateBody(villaTypeSchema, request.body)) }); }
export async function updateManagedVillaType(request, response) { response.json({ villaType: await updateVillaType(request.params.villaTypeId, validateBody(villaTypeSchema, request.body)) }); }
export async function removeManagedVillaType(request, response) { await deleteVillaType(request.params.villaTypeId); response.status(204).send(); }
