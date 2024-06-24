const allEqual = require('./allEqual');

describe('allEqual', () => {
  it('compares an array of items', () => {
    const equalStrings = allEqual(['a', 'a', 'a']);
    expect(equalStrings).toBe(true);

    const notEqualStrings = allEqual(['a', 'a', 'b']);
    expect(notEqualStrings).toBe(false);

    const equalNumbers = allEqual([1119, 1119, 1119]);
    expect(equalNumbers).toBe(true);

    const notEqualNumbers = allEqual([1119, 1119, -1119]);
    expect(notEqualNumbers).toBe(false);

    const equalArrays = allEqual([['123'], ['123'], ['123']]);
    expect(equalArrays).toBe(true);

    const notEqualArrays = allEqual([['123'], ['123'], [['123']]]);
    expect(notEqualArrays).toBe(false);

    const equalObjects = allEqual([{ id: 9 }, { id: 9 }, { id: 9 }]);
    expect(equalObjects).toBe(true);

    const notEqualObjects = allEqual([{ id: 9 }, { id: 9 }, { id: null }]);
    expect(notEqualObjects).toBe(false);

    const notEqualCrossType = allEqual([
      { id: 1, items: [] },
      { id: 1, items: [] },
      null
    ]);
    expect(notEqualCrossType).toBe(false);
  });
});
