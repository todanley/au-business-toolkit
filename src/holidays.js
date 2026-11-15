// AU public holidays 2026–2027, transcribed by hand from official state/territory government pages
// (sources in SOURCES below, checked 15 Nov 2026). type:
//   public   = state/territory-wide public holiday (not a business day)
//   part_day = part-day public holiday (evening only); counted as a business day
//   regional = applies to part of the state only; counted as a business day unless region-specific logic is added
//   limited  = applies to limited groups (e.g. state public service); counted as a business day
//   bank     = bank holiday, not a declared public holiday; counted as a business day unless include_bank=true
export const SOURCES = {
  NSW: 'https://www.nsw.gov.au/about-nsw/public-holidays',
  VIC: 'https://business.vic.gov.au/business-information/public-holidays (2026 and 2027 pages)',
  QLD: 'https://www.qld.gov.au/recreation/travel/holidays/public',
  WA: 'https://www.wa.gov.au/service/employment/workplace-arrangements/public-holidays-western-australia',
  SA: 'https://www.safework.sa.gov.au/resources/public-holidays',
  TAS: 'https://worksafe.tas.gov.au/topics/laws-and-compliance/public-holidays',
  ACT: 'https://www.act.gov.au/living-in-the-act/public-holidays-school-terms-and-daylight-saving',
  NT: 'https://nt.gov.au/nt-public-holidays',
};
export const DATA_CHECKED = '2026-11-15';

const P = 'public', PD = 'part_day', R = 'regional', L = 'limited', B = 'bank';
const h = (date, name, type = P, note) => (note ? { date, name, type, note } : { date, name, type });

// Common national-pattern days per year
const easter = {
  2026: ['2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06'],
  2027: ['2027-03-26', '2027-03-27', '2027-03-28', '2027-03-29'],
};

export const HOLIDAYS = {
  NSW: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][1], 'Easter Saturday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-04-27', 'Additional day (Anzac Day)'), h('2026-06-08', "King's Birthday"), h('2026-08-03', 'Bank Holiday', B, 'Banks and some financial institutions only; not a declared public holiday'), h('2026-10-05', 'Labour Day'), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Boxing Day'), h('2026-12-28', 'Additional day (Boxing Day)')],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][1], 'Easter Saturday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-25', 'Anzac Day'), h('2027-04-26', 'Additional day (Anzac Day)'), h('2027-06-14', "King's Birthday"), h('2027-08-02', 'Bank Holiday', B, 'Banks and some financial institutions only; not a declared public holiday'), h('2027-10-04', 'Labour Day'), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Boxing Day)')],
  },
  VIC: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h('2026-03-09', 'Labour Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][1], 'Saturday before Easter Sunday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-06-08', "King's Birthday"), h('2026-09-25', 'Friday before the AFL Grand Final'), h('2026-11-03', 'Melbourne Cup', P, 'Statewide unless a non-metro council has arranged an alternative local holiday'), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Boxing Day'), h('2026-12-28', 'Additional day (Boxing Day)')],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h('2027-03-08', 'Labour Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][1], 'Saturday before Easter Sunday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-25', 'Anzac Day'), h('2027-06-14', "King's Birthday"), h('2027-11-02', 'Melbourne Cup', P, 'Statewide unless a non-metro council has arranged an alternative local holiday'), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Boxing Day)')],
  },
  QLD: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][1], 'The day after Good Friday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-05-04', 'Labour Day'), h('2026-08-12', 'Royal Queensland Show', R, 'Brisbane area only'), h('2026-10-05', "King's Birthday"), h('2026-12-24', 'Christmas Eve (6pm to midnight)', PD), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Boxing Day'), h('2026-12-28', 'Additional day (Boxing Day)')],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][1], 'The day after Good Friday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-26', 'Anzac Day (observed; 25 April is a Sunday)'), h('2027-05-03', 'Labour Day'), h('2027-08-11', 'Royal Queensland Show', R, 'Brisbane area only'), h('2027-10-04', "King's Birthday"), h('2027-12-24', 'Christmas Eve (6pm to midnight)', PD), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Boxing Day)')],
  },
  WA: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h('2026-03-02', 'Labour Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-04-27', 'Additional day (Anzac Day)'), h('2026-06-01', 'Western Australia Day'), h('2026-09-28', "King's Birthday", P, 'Some regional areas (e.g. Karratha, Port Hedland) observe an alternative date'), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Boxing Day'), h('2026-12-28', 'Additional day (Boxing Day)')],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h('2027-03-01', 'Labour Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-25', 'Anzac Day'), h('2027-04-26', 'Additional day (Anzac Day)'), h('2027-06-07', 'Western Australia Day'), h('2027-09-27', "King's Birthday", P, 'Some regional areas observe an alternative date'), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Boxing Day)')],
  },
  SA: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h('2026-03-09', 'Adelaide Cup Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][1], 'Easter Saturday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-06-08', "King's Birthday"), h('2026-10-05', 'Labour Day'), h('2026-12-24', 'Christmas Eve (7pm to midnight)', PD), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Proclamation Day holiday'), h('2026-12-28', 'Additional day (Proclamation Day)'), h('2026-12-31', "New Year's Eve (7pm to midnight)", PD)],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h('2027-03-08', 'Adelaide Cup Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][1], 'Easter Saturday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-25', 'Anzac Day'), h('2027-06-14', "King's Birthday"), h('2027-10-04', 'Labour Day'), h('2027-12-24', 'Christmas Eve (7pm to midnight)', PD), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Proclamation Day holiday and Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Proclamation Day)'), h('2027-12-31', "New Year's Eve (7pm to midnight)", PD)],
  },
  TAS: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h('2026-02-09', 'Royal Hobart Regatta', R, 'Southern Tasmania only'), h('2026-03-09', 'Eight Hours Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-07', 'Easter Tuesday', L, 'Generally Tasmanian Public Service only'), h('2026-04-25', 'Anzac Day'), h('2026-06-08', "King's Birthday"), h('2026-11-02', 'Recreation Day', R, 'Parts of the state that do not observe Royal Hobart Regatta'), h('2026-12-25', 'Christmas Day'), h('2026-12-28', 'Boxing Day (observed)')],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h('2027-02-08', 'Royal Hobart Regatta', R, 'Southern Tasmania only'), h('2027-03-08', 'Eight Hours Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-03-30', 'Easter Tuesday', L, 'Generally Tasmanian Public Service only'), h('2027-04-25', 'Anzac Day'), h('2027-06-14', "King's Birthday"), h('2027-11-01', 'Recreation Day', R, 'Parts of the state that do not observe Royal Hobart Regatta'), h('2027-12-27', 'Christmas Day (observed)'), h('2027-12-28', 'Boxing Day (observed)')],
  },
  ACT: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h('2026-03-09', 'Canberra Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][1], 'Easter Saturday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-04-27', 'Additional day (Anzac Day)'), h('2026-06-01', 'Reconciliation Day'), h('2026-06-08', "King's Birthday"), h('2026-08-03', 'Bank Holiday', B, 'Bank holiday only'), h('2026-10-05', 'Labour Day'), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Boxing Day'), h('2026-12-28', 'Additional day (Boxing Day)')],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h('2027-03-08', 'Canberra Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][1], 'Easter Saturday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-25', 'Additional day (Anzac Day)'), h('2027-04-26', 'Anzac Day (observed)'), h('2027-05-31', 'Reconciliation Day'), h('2027-06-14', "King's Birthday"), h('2027-08-02', 'Bank Holiday', B, 'Bank holiday only'), h('2027-10-04', 'Labour Day'), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Boxing Day)')],
  },
  NT: {
    2026: [h('2026-01-01', "New Year's Day"), h('2026-01-26', 'Australia Day'), h(easter[2026][0], 'Good Friday'), h(easter[2026][1], 'Easter Saturday'), h(easter[2026][2], 'Easter Sunday'), h(easter[2026][3], 'Easter Monday'), h('2026-04-25', 'Anzac Day'), h('2026-05-04', 'May Day'), h('2026-06-08', "King's Birthday"), h('2026-08-03', 'Picnic Day'), h('2026-12-24', 'Christmas Eve (7pm to midnight)', PD), h('2026-12-25', 'Christmas Day'), h('2026-12-26', 'Boxing Day'), h('2026-12-28', 'Boxing Day Monday'), h('2026-12-31', "New Year's Eve (7pm to midnight)", PD)],
    2027: [h('2027-01-01', "New Year's Day"), h('2027-01-26', 'Australia Day'), h(easter[2027][0], 'Good Friday'), h(easter[2027][1], 'Easter Saturday'), h(easter[2027][2], 'Easter Sunday'), h(easter[2027][3], 'Easter Monday'), h('2027-04-26', 'Anzac Day (observed)'), h('2027-05-03', 'May Day'), h('2027-06-14', "King's Birthday"), h('2027-08-02', 'Picnic Day'), h('2027-12-24', 'Christmas Eve (7pm to midnight)', PD), h('2027-12-25', 'Christmas Day'), h('2027-12-26', 'Boxing Day'), h('2027-12-27', 'Additional day (Christmas Day)'), h('2027-12-28', 'Additional day (Boxing Day)'), h('2027-12-31', "New Year's Eve (7pm to midnight)", PD)],
  },
};

export const PENDING = {
  VIC: { 2027: ['Friday before the AFL Grand Final: date not yet announced (usually the last Friday in September). Not included.'] },
};
export const NOT_COVERED = 'Regional show days (NT, TAS, NSW local holidays, WA regional King\'s Birthday dates) and local event days are not included except where listed as type "regional".';
export const YEARS = [2026, 2027];
