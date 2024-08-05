const deepPickEqual = require('./deepPickEqual');

describe('deepPickEqual', () => {
  it('allows you to compare two equivalent nested objects', () => {
    const left = {
      id: 1,
      items: [
        {
          id: 2,
          value: 'ab'
        },
        {
          id: 3,
          value: 'banana'
        }
      ],
      shallow: {
        id: 4,
        other: true
      },
      diff: [{ abc: 'def' }, true, false]
    };
    const right = {
      id: 1,
      items: [
        {
          id: 2,
          value: 'bobby'
        },
        {
          id: 3,
          value: 'apple'
        }
      ],
      shallow: {
        id: 4,
        other: false
      }
    };
    const result = deepPickEqual([left, right], { pickKeys: ['id'] });
    expect(result).toBe(true);
  });

  it('finds nested differences', () => {
    const shallow = deepPickEqual(
      [
        { id: 1, diff: 9 },
        { id: 2, diff: 8 }
      ],
      { pickKeys: ['id'] }
    );
    expect(shallow).toBe(false);

    const nested = deepPickEqual(
      [
        { id: 1, nest: { id: 2, diff: 1 } },
        { id: 1, nest: { id: 3, alt: 4 } }
      ],
      { pickKeys: ['id'] }
    );
    expect(nested).toBe(false);

    const deeplyNested = deepPickEqual([
      { id: 1, nest: [{ id: 2, more: [{ id: 3 }] }] },
      { id: 1, nest: [{ id: 2, more: [{ id: 4 }] }] }
    ]);
    expect(deeplyNested).toBe(false);
  });

  it('requires identical array order', () => {
    const arrayOrder = deepPickEqual(
      [
        [{ id: 1 }, { id: 2 }],
        [{ id: 2 }, { id: 1 }]
      ],
      { pickKeys: ['id'] }
    );
    expect(arrayOrder).toBe(false);

    const correctArrayOrder = deepPickEqual(
      [
        [{ id: 1 }, { id: 2 }],
        [{ id: 1 }, { id: 2 }]
      ],
      { pickKeys: ['id'] }
    );
    expect(correctArrayOrder).toBe(true);
  });

  it('fails without erroring when the object shape is different', () => {
    const left = {
      leftObj: { id: 1 },
      leftArray: [{ id: 2 }]
    };
    const right = {
      rightObj: { id: 1 },
      rightArray: [{ id: 2 }]
    };
    const result = deepPickEqual([left, right]);
    expect(result).toBe(false);
  });

  it('supports skipping parts with the excludeKeys option', () => {
    const left = {
      id: 1,
      ignore: [{ id: 2 }]
    };
    const right = {
      id: 1,
      ignore: [{ id: 3 }]
    };
    const result = deepPickEqual([left, right], {
      pickKeys: ['id'],
      excludeKeys: ['ignore']
    });
    expect(result).toBe(true);
  });

  it('compares more than two items', () => {
    const result = deepPickEqual([
      { a: { b: [[123, { c: 999 }]] } },
      { a: { b: [[123, { c: 999 }]] } },
      { a: { b: [[123, { c: 999 }]] } }
    ]);
    expect(result).toBe(true);
  });
});
