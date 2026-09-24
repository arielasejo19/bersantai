import { createPricingRule, deletePricingRule, listPricingRules, updatePricingRule } from '../repositories/pricingRepository.js';
import { pricingRuleSchema } from '../validators/pricingValidators.js';
import { validateBody } from '../validators/validate.js';
export async function listManagedPricingRules(request, response) { response.json({ pricingRules: await listPricingRules(request.user) }); }
export async function createManagedPricingRule(request, response) { response.status(201).json({ pricingRule: await createPricingRule(validateBody(pricingRuleSchema, request.body), request.user) }); }
export async function updateManagedPricingRule(request, response) { response.json({ pricingRule: await updatePricingRule(request.params.ruleId, validateBody(pricingRuleSchema, request.body), request.user) }); }
export async function deleteManagedPricingRule(request, response) { await deletePricingRule(request.params.ruleId, request.user); response.status(204).send(); }