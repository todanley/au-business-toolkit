import assert from 'node:assert/strict';
import worker, { validateAbn, validateAcn, gst } from '../src/index.js';
import { HOLIDAYS } from '../src/holidays.js';

let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log('ok   ', name); } catch (e) { fail++; console.log('FAIL ', name, '\n     ', e.message); } };
const call = async (path, env = {}, headers = {}) => { const r = await worker.fetch(new Request('https://x.test' + path, { headers }), env); return { status: r.status, body: await r.json() }; };
const wd = (s) => new Date(s + 'T00:00:00Z').getUTCDay();

await t('ABN ATO example 51 824 753 556 valid', () => assert.equal(validateAbn('51 824 753 556').valid, true));
await t('ABN 53 004 085 616 valid', () => assert.equal(validateAbn('53004085616').valid, true));
await t('ABN altered digit invalid', () => assert.equal(validateAbn('51 824 753 557').valid, false));
await t('ABN wrong length invalid', () => assert.equal(validateAbn('1234').valid, false));
await t('ACN ASIC examples valid', () => { for (const a of ['000 000 019', '000 250 000', '000 500 005', '001 000 004', '005 999 977', '010 499 966', '004 085 616']) assert.equal(validateAcn(a).valid, true, a); });
await t('ACN bad check digit invalid', () => assert.equal(validateAcn('004 085 617').valid, false));
await t('GST add 100 -> 110', () => assert.deepEqual([gst('100', 'add').gst, gst('100', 'add').amount_inc_gst], [10, 110]));
await t('GST remove 110 -> 100', () => assert.deepEqual([gst('110', 'remove').amount_ex_gst, gst('110', 'remove').gst], [100, 10]));
await t('GST remove 19.99', () => assert.equal(gst('19.99', 'remove').amount_ex_gst, 18.17));

// Data sanity
await t('All holiday dates are real, sorted, in the right year, no duplicates', () => {
  for (const [st, ys] of Object.entries(HOLIDAYS)) for (const [y, list] of Object.entries(ys)) {
    const ds = list.map((x) => x.date);
    assert.deepEqual([...ds].sort(), ds, `${st} ${y} sorted`); assert.equal(new Set(ds).size, ds.length, `${st} ${y} dupes`);
    for (const d of ds) { assert.equal(new Date(d + 'T00:00:00Z').toISOString().slice(0, 10), d); assert.equal(d.slice(0, 4), y); }
  }
});
await t('"Additional"/"observed" days fall on Mon or Tue', () => {
  for (const [st, ys] of Object.entries(HOLIDAYS)) for (const list of Object.values(ys)) for (const x of list)
    if (/Additional day \((Christmas|Boxing|Proclamation)|observed\)$|Boxing Day Monday/.test(x.name) && !/Anzac/.test(x.name)) assert.ok([1, 2].includes(wd(x.date)), `${st} ${x.date} ${x.name}`);
});
await t('Good Friday is a Friday, Easter Monday a Monday everywhere', () => {
  for (const ys of Object.values(HOLIDAYS)) for (const list of Object.values(ys)) for (const x of list) {
    if (x.name === 'Good Friday') assert.equal(wd(x.date), 5, x.date);
    if (x.name === 'Easter Monday') assert.equal(wd(x.date), 1, x.date);
  }
});
await t("King's Birthday = 2nd Monday in June (all but QLD, WA)", () => {
  for (const st of ['NSW', 'VIC', 'SA', 'TAS', 'ACT', 'NT']) for (const list of Object.values(HOLIDAYS[st])) {
    const k = list.find((x) => x.name === "King's Birthday"); const day = +k.date.slice(8);
    assert.ok(k.date.slice(5, 7) === '06' && wd(k.date) === 1 && day >= 8 && day <= 14, `${st} ${k.date}`);
  }
});
await t('Every state has 2026 and 2027 data, 8 jurisdictions', () => { assert.equal(Object.keys(HOLIDAYS).length, 8); for (const ys of Object.values(HOLIDAYS)) assert.deepEqual(Object.keys(ys), ['2026', '2027']); });

// Endpoints
await t('GET /holidays NSW 2026', async () => { const r = await call('/holidays?state=nsw&year=2026'); assert.equal(r.status, 200); assert.equal(r.body.count, 14); assert.ok(r.body.source.includes('nsw.gov.au')); });
await t('Year outside data -> 422', async () => assert.equal((await call('/holidays?state=NSW&year=2030')).status, 422));
await t('Bad state -> 400', async () => assert.equal((await call('/holidays?state=XX&year=2026')).status, 400));
await t('check: Christmas 2026 NSW not business day', async () => { const r = await call('/business-days/check?state=NSW&date=2026-12-25'); assert.equal(r.body.business, false); assert.equal(r.body.reason, 'public_holiday'); });
await t('check: Melbourne Cup only a holiday in VIC', async () => { assert.equal((await call('/business-days/check?state=VIC&date=2026-11-03')).body.business, false); assert.equal((await call('/business-days/check?state=NSW&date=2026-11-03')).body.business, true); });
await t('check: NSW bank holiday counted as business day unless include_bank', async () => { assert.equal((await call('/business-days/check?state=NSW&date=2026-08-03')).body.business, true); assert.equal((await call('/business-days/check?state=NSW&date=2026-08-03&include_bank=true')).body.business, false); });
await t('add: 2026-12-24 + 1 business day NSW = 2026-12-29', async () => assert.equal((await call('/business-days/add?state=NSW&date=2026-12-24&days=1')).body.result, '2026-12-29'));
await t('add: 2026-04-02 + 1 VIC = 2026-04-07 (Easter)', async () => assert.equal((await call('/business-days/add?state=VIC&date=2026-04-02&days=1')).body.result, '2026-04-07'));
await t('add: negative days', async () => assert.equal((await call('/business-days/add?state=QLD&date=2026-04-07&days=-1')).body.result, '2026-04-02'));
await t('add: crosses into 2027', async () => assert.equal((await call('/business-days/add?state=NSW&date=2026-12-31&days=1')).body.result, '2027-01-04'));
await t('count: NSW Dec 2026 = 21 business days (23 weekdays - 25th - 28th)', async () => assert.equal((await call('/business-days/count?state=NSW&start=2026-12-01&end=2026-12-31')).body.business_days, 21));
await t('Invalid date -> 400', async () => assert.equal((await call('/business-days/check?state=NSW&date=2026-02-30')).status, 400));
await t('Unknown path -> 404', async () => assert.equal((await call('/nope')).status, 404));
await t('Proxy secret enforced when configured', async () => {
  const env = { RAPIDAPI_PROXY_SECRET: 'test-secret' };
  assert.equal((await call('/health', env)).status, 403);
  assert.equal((await call('/health', env, { 'X-RapidAPI-Proxy-Secret': 'wrong' })).status, 403);
  assert.equal((await call('/health', env, { 'X-RapidAPI-Proxy-Secret': 'test-secret' })).status, 200);
});

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
