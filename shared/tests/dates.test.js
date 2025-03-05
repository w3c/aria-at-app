const { convertDateToString } = require('../dates');

describe('convertDateToString', () => {
  const outputFormat = 'MMM D, YYYY [at] h:mm:ss a z';

  it('returns the correctly parsed date for a timestamp', () => {
    const date = '2025-02-03T01:40:16.000Z';
    const formattedDate1 = convertDateToString(date, outputFormat);
    const formattedDate2 = convertDateToString(date, 'DD-MM-YYYY');
    const formattedDate3 = convertDateToString(date, 'MMM D, YYYY');
    const formattedDate4 = convertDateToString(date, 'MMMM [the] Do [of] YYYY');

    expect(formattedDate1).toBe('Feb 3, 2025 at 1:40:16 am UTC');
    expect(formattedDate2).toBe('03-02-2025');
    expect(formattedDate3).toBe('Feb 3, 2025');
    expect(formattedDate4).toBe('February the 3rd of 2025');
  });

  it('returns the correctly parsed UTC date for a non-UTC timestamp', () => {
    const date = '2025-02-02T20:40:16.000-05:00';
    const formattedDate1 = convertDateToString(date, outputFormat);
    const formattedDate2 = convertDateToString(date, 'DD-MM-YYYY');
    const formattedDate3 = convertDateToString(date, 'MMM D, YYYY');
    const formattedDate4 = convertDateToString(date, 'MMMM [the] Do [of] YYYY');

    expect(formattedDate1).toBe('Feb 3, 2025 at 1:40:16 am UTC');
    expect(formattedDate2).toBe('03-02-2025');
    expect(formattedDate3).toBe('Feb 3, 2025');
    expect(formattedDate4).toBe('February the 3rd of 2025');
  });

  it('returns a formatted string AM (English)', () => {
    const date = '2021-11-30T09:51:28.000Z';
    const formattedDate = convertDateToString(date, outputFormat, {
      locale: 'en'
    });
    expect(formattedDate).toBe('Nov 30, 2021 at 9:51:28 am UTC');
  });

  it('returns a formatted string PM (English)', () => {
    const date = '2021-11-30T14:51:28.000Z';
    const formattedDate = convertDateToString(date, outputFormat, {
      locale: 'en'
    });
    expect(formattedDate).toBe('Nov 30, 2021 at 2:51:28 pm UTC');
  });

  it('returns a formatted string when using 24-hour notation in a different locale (French)', () => {
    const date = '2021-11-30T14:51:28.000Z';
    const formattedDate = convertDateToString(date, outputFormat, {
      locale: 'fr'
    });
    // French time uses a lowercase month notation
    expect(formattedDate).toBe('nov. 30, 2021 at 2:51:28 pm UTC');
  });

  it('returns a formatted string when using a different locale (Korean)', () => {
    const date = '2021-11-30T14:51:28.000Z';
    const formattedDate = convertDateToString(date, outputFormat, {
      locale: 'ko'
    });
    expect(formattedDate).toBe('11월 30, 2021 at 2:51:28 오후 UTC');
  });
});
