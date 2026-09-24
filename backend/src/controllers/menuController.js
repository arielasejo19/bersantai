import * as service from '../services/menuService.js';
import { menuCategorySchema, menuItemSchema } from '../validators/menuValidators.js';
import { validateBody } from '../validators/validate.js';
import { updateItemMedia } from '../repositories/menuRepository.js';
import { storeMedia } from '../services/mediaStorageService.js';
import { ApiError } from '../utils/apiError.js';
export async function listPublicMenuItems(_request, response) { response.json({ menuItems: await service.listItems({ activeOnly: true }) }); }
export async function listManagedMenuItems(_request, response) { response.json({ menuItems: await service.listItems() }); }
export async function listMenuCategories(_request, response) { response.json({ categories: await service.listCategories() }); }
export async function createMenuCategory(request, response) { response.status(201).json({ category: await service.createCategory(validateBody(menuCategorySchema, request.body)) }); }
export async function updateMenuCategory(request, response) { response.json({ category: await service.updateCategory(request.params.categoryId, validateBody(menuCategorySchema, request.body)) }); }
export async function deleteMenuCategory(request, response) { await service.deleteCategory(request.params.categoryId); response.status(204).send(); }
export async function createMenuItem(request, response) { response.status(201).json({ menuItem: await service.createItem(validateBody(menuItemSchema, request.body)) }); }
export async function updateMenuItem(request, response) { response.json({ menuItem: await service.updateItem(request.params.menuItemId, validateBody(menuItemSchema, request.body)) }); }
export async function deleteMenuItem(request, response) { await service.deleteItem(request.params.menuItemId); response.status(204).send(); }
export async function uploadMenuItemMedia(request, response) { if (!request.file) throw new ApiError(400, 'A media file is required'); response.json({ menuItem: await updateItemMedia(request.params.menuItemId, await storeMedia(request.file)) }); }