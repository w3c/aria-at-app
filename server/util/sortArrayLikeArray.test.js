const sortArrayLikeArray = require('./sortArrayLikeArray');

describe('sortArrayLikeArray', () => {
  it('sorts array based on another array', () => {
    const unordered = [
      { id: 3, name: 'Samantha' },
      { id: 4, name: 'Stephanie' },
      { id: 1, name: 'Jessica' },
      { id: 2, name: 'Amanda' }
    ];

    const ordered = [1, 2, 3, 4];

    const result = sortArrayLikeArray(unordered, ordered, {
      identifyArrayItem: item => item.id || item
    });

    expect(result).toEqual([
      { id: 1, name: 'Jessica' },
      { id: 2, name: 'Amanda' },
      { id: 3, name: 'Samantha' },
      { id: 4, name: 'Stephanie' }
    ]);
    expect(unordered[0].id).toBe(3); // should not be mutated
  });

  it('works without the identifyArrayItem function', () => {
    const unordered = [3, 4, 1, 2];
    const ordered = [1, 2, 3, 4];
    const result = sortArrayLikeArray(unordered, ordered);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('throws when unexpected item encountered', () => {
    const unordered = [3, 4, 1, 2];
    const ordered = [1, 2, 3];
    expect(() => {
      sortArrayLikeArray(unordered, ordered);
    }).toThrowErrorMatchingInlineSnapshot(
      `"Item or items in array1 do not exist in array2."`
    );
  });
});
