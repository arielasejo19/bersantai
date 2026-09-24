import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() { const db = getDatabase(); if (!db) throw new ApiError(503, 'Database is not configured'); return db; }
function toRule(row) { return { id: String(row.id), scopeType: row.villa_type_id ? 'villa_type' : 'villa', villaId: row.villa_id ? String(row.villa_id) : null, villaTypeId: row.villa_type_id ? String(row.villa_type_id) : null, targetName: row.villa_type_id ? row.villa_type_name : row.villa_name, name: row.name, stayType: row.stay_type || 'both', ruleType: row.rule_type, startsOn: row.starts_on, endsOn: row.ends_on, price: Number(row.price || 0), isActive: Boolean(row.is_active), createdAt: row.created_at, updatedAt: row.updated_at }; }
function ruleQuery(db) { return db('villa_pricing_rules').leftJoin('villas', 'villas.id', 'villa_pricing_rules.villa_id').leftJoin('villa_types', 'villa_types.id', 'villa_pricing_rules.villa_type_id').select('villa_pricing_rules.*', 'villas.name as villa_name', 'villa_types.name as villa_type_name'); }
function scopedQuery(db, user) {
  let query = ruleQuery(db).orderBy([{ column: 'villa_pricing_rules.rule_type', order: 'asc' }, { column: 'villa_pricing_rules.starts_on', order: 'asc' }]);
  if (user.role === 'host') query.where((builder) => builder.where('villas.owner_user_id', user.id).orWhereExists(db('villas as owned_villas').select(1).whereRaw('owned_villas.villa_type_id = villa_pricing_rules.villa_type_id').andWhere('owned_villas.owner_user_id', user.id)));
  return query;
}
async function ensureTargetAccess(input, user) {
  const db = database();
  if (input.scopeType === 'villa') {
    const query = db('villas').where({ 'villas.id': input.villaId });
    if (user.role === 'host') query.where('villas.owner_user_id', user.id);
    if (!(await query.first())) throw new ApiError(404, 'Villa not found');
    return;
  }
  const query = db('villa_types').where({ 'villa_types.id': input.villaTypeId });
  if (user.role === 'host') query.whereExists(db('villas as owned_villas').select(1).whereRaw('owned_villas.villa_type_id = villa_types.id').andWhere('owned_villas.owner_user_id', user.id));
  if (!(await query.first())) throw new ApiError(404, 'Villa type not found');
}
async function ensureRuleAccess(id, user) { const query = scopedQuery(database(), user).where('villa_pricing_rules.id', id); if (!(await query.first())) throw new ApiError(404, 'Pricing rule not found'); }
export async function listPricingRules(user) { return (await scopedQuery(database(), user)).map(toRule); }
export async function createPricingRule(input, user) { await ensureTargetAccess(input, user); const db = database(); const [id] = await db('villa_pricing_rules').insert({ villa_id: input.scopeType === 'villa' ? input.villaId : null, villa_type_id: input.scopeType === 'villa_type' ? input.villaTypeId : null, name: input.name, stay_type: input.stayType, rule_type: input.ruleType, starts_on: input.startsOn || null, ends_on: input.endsOn || null, price: input.price, is_active: input.isActive }); return toRule(await ruleQuery(db).where('villa_pricing_rules.id', id).first()); }
export async function updatePricingRule(id, input, user) { await ensureRuleAccess(id, user); await ensureTargetAccess(input, user); const db = database(); await db('villa_pricing_rules').where({ id }).update({ villa_id: input.scopeType === 'villa' ? input.villaId : null, villa_type_id: input.scopeType === 'villa_type' ? input.villaTypeId : null, name: input.name, stay_type: input.stayType, rule_type: input.ruleType, starts_on: input.startsOn || null, ends_on: input.endsOn || null, price: input.price, is_active: input.isActive }); return toRule(await ruleQuery(db).where('villa_pricing_rules.id', id).first()); }
export async function deletePricingRule(id, user) { await ensureRuleAccess(id, user); await database()('villa_pricing_rules').where({ id }).del(); }

function chooseRule(rules, ruleType, date, villaId, bookingKind) {
  const candidates = rules.filter((rule) => (rule.stay_type || 'both') !== 'both' ? rule.stay_type === bookingKind : true).filter((rule) => rule.rule_type === ruleType && (rule.rule_type !== 'holiday' || (String(rule.starts_on).slice(0, 10) <= date && String(rule.ends_on).slice(0, 10) >= date)));
  return candidates.sort((left, right) => (Number(right.villa_id === villaId) * 2 + Number(right.stay_type === bookingKind)) - (Number(left.villa_id === villaId) * 2 + Number(left.stay_type === bookingKind)))[0];
}
export async function calculateVillaStayTotal(db, villaId, checkIn, checkOut, basePrice, bookingKind = 'overnight') {
  const rates = await calculateVillaStayRates(db, villaId, checkIn, checkOut, basePrice, bookingKind);
  return rates.reduce((total, rate) => total + rate.price, 0);
}
export async function calculateVillaStayRates(db, villaId, checkIn, checkOut, basePrice, bookingKind = 'overnight') {
  const villa = await db('villas').where({ id: villaId }).select('villa_type_id').first();
  const rules = await db('villa_pricing_rules').where({ is_active: true }).where((query) => query.where({ villa_id: villaId }).orWhere({ villa_type_id: villa?.villa_type_id || 0 }));
  const start = new Date(checkIn); const end = new Date(checkOut || checkIn); let total = 0;
  const rates = [];
  for (const cursor = new Date(start); cursor < end || (cursor.getTime() === start.getTime() && start.getTime() === end.getTime()); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10); const day = cursor.getUTCDay();
    const holiday = chooseRule(rules, 'holiday', date, villaId, bookingKind);
    const seasonal = holiday || chooseRule(rules, day === 0 || day === 6 ? 'weekend' : 'weekday', date, villaId, bookingKind);
    rates.push({ date, price: Number(seasonal?.price ?? basePrice ?? 0), ruleType: seasonal?.rule_type || 'base', ruleName: seasonal?.name || 'Base nightly rate' });
  }
  return rates;
}
