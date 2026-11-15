// AU Business Toolkit API — Cloudflare Worker (module syntax). No external calls, no storage, no logging of inputs.
import { HOLIDAYS, SOURCES, DATA_CHECKED, PENDING, NOT_COVERED, YEARS } from './holidays.js';

const STATES = Object.keys(HOLIDAYS);
const VERSION = '1.0.0';

// ---------- helpers ----------
const json = (status, body) => new Response(JSON.stringify(body, null, 2), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
class ApiError extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
const need = (v, name) => { if (v === null || v === undefined || String(v).trim() === '') throw new ApiError(400, 'missing_parameter', `Missing required parameter: ${name}`); return String(v).trim(); };
const digitsOnly = (s) => s.replace(/[\s-]/g, '');

// ---------- ABN / ACN (format + checksum only; no register lookup) ----------
export function validateAbn(input) {
  const raw = digitsOnly(input);
  if (!/^\d{11}$/.test(raw)) return { input, valid: false, reason: 'An ABN has exactly 11 digits (spaces allowed).' };
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const d = raw.split('').map(Number); d[0] -= 1;
  const sum = d.reduce((a, x, i) => a + x * w[i], 0);
  const valid = sum % 89 === 0;
  return { input, valid, formatted: `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5, 8)} ${raw.slice(8)}`, ...(valid ? {} : { reason: 'Checksum failed.' }),
    note: 'Format and checksum only. A valid checksum does not mean the ABN is registered or active; check the ABN Lookup service for that.' };
}
export function validateAcn(input) {
  const raw = digitsOnly(input);
  if (!/^\d{9}$/.test(raw)) return { input, valid: false, reason: 'An ACN/ARBN has exactly 9 digits (spaces allowed).' };
  const d = raw.split('').map(Number);
  const sum = d.slice(0, 8).reduce((a, x, i) => a + x * (8 - i), 0);
  const check = (10 - (sum % 10)) % 10;
  const valid = check === d[8];
  return { input, valid, formatted: `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`, ...(valid ? {} : { reason: 'Check digit failed.' }),
    note: 'Format and check digit only. It does not confirm the company exists; use the ASIC register for that.' };
}

// ---------- GST (10%) ----------
const cents = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
export function gst(amountStr, mode = 'add') {
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e12) throw new ApiError(400, 'invalid_amount', 'amount must be a number between 0 and 1,000,000,000,000');
  if (mode === 'add') { const g = cents(amount * 0.1); return { mode, amount_ex_gst: cents(amount), gst: g, amount_inc_gst: cents(amount + g), rate: 0.1 }; }
  if (mode === 'remove') { const ex = cents(amount / 1.1); return { mode, amount_inc_gst: cents(amount), gst: cents(amount - ex), amount_ex_gst: ex, rate: 0.1 }; }
  throw new ApiError(400, 'invalid_mode', 'mode must be "add" or "remove"');
}

// ---------- dates ----------
const ISO = /^\d{4}-\d{2}-\d{2}$/;
function parseDate(s, name) {
  if (!ISO.test(s)) throw new ApiError(400, 'invalid_date', `${name} must be YYYY-MM-DD`);
  const d = new Date(s + 'T00:00:00Z');
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) throw new ApiError(400, 'invalid_date', `${name} is not a real date`);
  return d;
}
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const dow = (d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()];
function getState(s) {
  const st = need(s, 'state').toUpperCase();
  if (!STATES.includes(st)) throw new ApiError(400, 'invalid_state', `state must be one of ${STATES.join(', ')}`);
  return st;
}
function yearData(state, year) {
  const list = HOLIDAYS[state][year];
  if (!list) throw new ApiError(422, 'year_not_covered', `Holiday data covers ${YEARS.join(' and ')} only.`);
  return list;
}
function closedSet(state, year, includeBank) {
  return new Map(yearData(state, year).filter((x) => x.type === 'public' || (includeBank && x.type === 'bank')).map((x) => [x.date, x]));
}
function isBusinessDay(d, state, includeBank) {
  const wd = d.getUTCDay();
  const hol = closedSet(state, d.getUTCFullYear(), includeBank).get(iso(d));
  if (wd === 0 || wd === 6) return { business: false, reason: 'weekend', holiday: hol || null };
  if (hol) return { business: false, reason: 'public_holiday', holiday: hol };
  return { business: true, reason: null, holiday: null };
}

// ---------- router ----------
async function route(url) {
  const q = url.searchParams; const p = url.pathname.replace(/\/+$/, '') || '/';
  const bank = q.get('include_bank') === 'true';
  switch (p) {
    case '/':
    case '/health':
      return { name: 'AU Business Toolkit', version: VERSION, endpoints: ['/abn/validate', '/acn/validate', '/gst', '/holidays', '/business-days/check', '/business-days/add', '/business-days/count'], holiday_years: YEARS, holiday_data_checked: DATA_CHECKED };
    case '/abn/validate': return validateAbn(need(q.get('abn'), 'abn'));
    case '/acn/validate': return validateAcn(need(q.get('acn'), 'acn'));
    case '/gst': return gst(need(q.get('amount'), 'amount'), (q.get('mode') || 'add').toLowerCase());
    case '/holidays': {
      const state = getState(q.get('state')); const year = Number(need(q.get('year'), 'year'));
      const list = yearData(state, year).map((x) => ({ ...x, weekday: dow(new Date(x.date + 'T00:00:00Z')) }));
      return { state, year, count: list.length, holidays: list, pending: PENDING[state]?.[year] || [], not_covered: NOT_COVERED, source: SOURCES[state], data_checked: DATA_CHECKED };
    }
    case '/business-days/check': {
      const state = getState(q.get('state')); const d = parseDate(need(q.get('date'), 'date'), 'date');
      return { date: iso(d), weekday: dow(d), state, ...isBusinessDay(d, state, bank) };
    }
    case '/business-days/add': {
      const state = getState(q.get('state')); let d = parseDate(need(q.get('date'), 'date'), 'date');
      const n = Number(need(q.get('days'), 'days'));
      if (!Number.isInteger(n) || Math.abs(n) > 500) throw new ApiError(400, 'invalid_days', 'days must be an integer between -500 and 500');
      const step = n >= 0 ? 1 : -1; let left = Math.abs(n); const skipped = [];
      while (left > 0) { d = addDays(d, step); const r = isBusinessDay(d, state, bank); if (r.business) left--; else if (r.holiday) skipped.push(r.holiday); }
      return { start: q.get('date'), days: n, state, result: iso(d), weekday: dow(d), holidays_skipped: skipped, counting: 'Start date excluded; weekends and public holidays skipped.' };
    }
    case '/business-days/count': {
      const state = getState(q.get('state')); const s = parseDate(need(q.get('start'), 'start'), 'start'); const e = parseDate(need(q.get('end'), 'end'), 'end');
      if (e < s) throw new ApiError(400, 'invalid_range', 'end must be on or after start');
      if ((e - s) / 86400000 > 800) throw new ApiError(400, 'invalid_range', 'range must be 800 days or less');
      let count = 0; const hols = [];
      for (let d = s; d <= e; d = addDays(d, 1)) { const r = isBusinessDay(d, state, bank); if (r.business) count++; else if (r.reason === 'public_holiday') hols.push(r.holiday); }
      return { start: iso(s), end: iso(e), state, business_days: count, inclusive: true, public_holidays_in_range: hols };
    }
    default: throw new ApiError(404, 'not_found', `Unknown endpoint ${p}`);
  }
}

export default {
  async fetch(request, env = {}) {
    // Only accept traffic from RapidAPI when the secret is configured (wrangler secret put RAPIDAPI_PROXY_SECRET).
    if (env.RAPIDAPI_PROXY_SECRET && request.headers.get('x-rapidapi-proxy-secret') !== env.RAPIDAPI_PROXY_SECRET) {
      return json(403, { error: 'forbidden', message: 'Requests must come through RapidAPI.' });
    }
    if (request.method !== 'GET') return json(405, { error: 'method_not_allowed', message: 'Use GET.' });
    try { return json(200, await route(new URL(request.url))); }
    catch (e) { if (e instanceof ApiError) return json(e.status, { error: e.code, message: e.message }); return json(500, { error: 'internal_error', message: 'Unexpected error.' }); }
  },
};
