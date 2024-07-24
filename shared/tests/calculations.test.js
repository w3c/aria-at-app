const { calculatePercentage, trimDecimals } = require('../calculations');

describe('Verify calculatePercentage usage', () => {
  it('should throw error if total value is 0', () => {
    expect(() => {
      calculatePercentage(25, 0, { ignoreError: false });
    }).toThrow();
  });

  it('should return proper whole number', () => {
    const value = 25;
    const total = 100;
    const result = calculatePercentage(value, total);

    expect(result).toBe(25);
  });

  it('should return precise value', () => {
    const value = 205;
    const total = 206;
    const result = calculatePercentage(value, total);

    expect(result).toBe(99.51456310679612);
  });
});

describe('Verify trimDecimals usage', () => {
  it('trims decimal places down to 2', () => {
    const decimals = 2;
    const value = 76.25845533342;
    const result = trimDecimals(value, decimals);

    expect(result).toBe(76.25);
  });

  it('trims decimal places down to 1', () => {
    const decimals = 1;
    const value = 76.25845533342;
    const result = trimDecimals(value, decimals);

    expect(result).toBe(76.2);
  });

  it('trims decimal places down to whole number if not provided with decimals', () => {
    const decimals = 0;
    const value = 76.25845533342;
    const result = trimDecimals(value, decimals);

    expect(result).toBe(76);
  });

  it('returns whole number if given whole number with requested decimals', () => {
    const decimals = 4;
    const value = 76;
    const result = trimDecimals(value, decimals);

    expect(result).toBe(76);
  });
});
