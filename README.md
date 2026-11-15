# AU Business Toolkit

A small, dependency-free JSON API for Australian business apps, built as a Cloudflare Worker. It covers ABN/ACN checks, GST maths, public holidays for every state and territory, and business-day calculations.

## Hosted API

If you'd rather not run it yourself, the hosted version is on RapidAPI (free tier available):
https://rapidapi.com/todanley/api/au-business-toolkit

## What it does

- **ABN validation**: 11-digit format and ATO checksum, returns the standard spaced format (`51 824 753 556`).
- **ACN/ARBN validation**: 9-digit format and ASIC check digit.
- **GST**: add or remove 10% GST, rounded to cents.
- **Public holidays**: NSW, VIC, QLD, WA, SA, TAS, ACT and NT for 2026 and 2027, including substitute/additional days. Each holiday is tagged `public`, `part_day`, `regional`, `limited` or `bank`, and every response includes the official source URL.
- **Business days**: is a date a business day, add/subtract N business days, count business days in a range, per state.

## Endpoints (all `GET`, JSON responses)

| Endpoint | Parameters | Notes |
|---|---|---|
| `/health` | – | Name, version, endpoints, covered years |
| `/abn/validate` | `abn` | Spaces allowed |
| `/acn/validate` | `acn` | Spaces allowed |
| `/gst` | `amount`, `mode=add\|remove` | Default `add` |
| `/holidays` | `state`, `year` | `state`: NSW, VIC, QLD, WA, SA, TAS, ACT, NT |
| `/business-days/check` | `state`, `date` (YYYY-MM-DD) | |
| `/business-days/add` | `state`, `date`, `days` (−500..500) | Start date excluded |
| `/business-days/count` | `state`, `start`, `end` | Inclusive, max 800 days |

Business-day endpoints accept `include_bank=true` to also treat bank holidays (NSW/ACT, first Monday in August) as non-business days. Weekends and `public` holidays are non-business days; `part_day`, `regional`, `limited` and `bank` holidays are listed but counted as business days by default.

Example:

```
GET /business-days/add?state=NSW&date=2026-12-24&days=1
→ { "result": "2026-12-29", "holidays_skipped": [ Christmas Day, Boxing Day, Additional day (Boxing Day) ], ... }
```

The full spec is in `openapi.json` (OpenAPI 3.0).

## Self-deploy (Cloudflare Workers free plan)

Requirements: Node.js 18+ and a free Cloudflare account.

```
npm install
npm test                       # run the test suite
npx wrangler dev               # local server on http://localhost:8787
npx wrangler login             # opens a browser to authorise Wrangler
npx wrangler deploy            # deploys to https://au-business-toolkit.<your-subdomain>.workers.dev
```

Optional gateway lock: if you put the API behind RapidAPI or your own gateway, set a shared secret with

```
npx wrangler secret put RAPIDAPI_PROXY_SECRET
```

When it's set, every request must carry the header `X-RapidAPI-Proxy-Secret` with that value, or it gets a 403. When it isn't set, the API is open. Never commit the secret; for local testing put it in `.dev.vars` (git-ignored).

## Tests

```
npm test
```

28 checks: ABN/ACN known-valid and invalid numbers, GST rounding, holiday data sanity (real dates, sorted, Good Friday is a Friday, King's Birthday is the 2nd Monday in June where applicable, substitute days fall on Mon/Tue), endpoint behaviour, error codes and the proxy-secret check.

## Limits

- A valid checksum means the number is well-formed, not that the business or company is registered. There are no register lookups.
- No TFN validation, on purpose: a TFN is a personal identifier.
- Holiday data is entered by hand from each state and territory government's public-holidays page (sources in `src/holidays.js`). Local show days and council holidays are not included; Victoria's 2027 AFL Grand Final Friday is not announced yet. Please confirm with the official source for payroll-critical decisions, and add future years in `src/holidays.js`.
- Nothing sent to the API is stored or logged.

## Licence

MIT, see `LICENSE`. Holiday dates are public information published by the Australian state and territory governments; source pages are credited in `src/holidays.js`.

Author: Stanley J
