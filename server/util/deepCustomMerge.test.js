const deepCustomMerge = require('./deepCustomMerge');

describe('deepCustomMerge', () => {
    it('deeply merges two arrays', () => {
        const left = [
            {
                id: 'uniqueLeft'
            },
            {
                id: 'common1',
                nested: [
                    {
                        id: 'nestedUniqueLeft'
                    },
                    {
                        id: 'common2',
                        leftOnly: true,
                        both: 'leftShouldBeOverridden'
                    }
                ]
            }
        ];
        const right = [
            {
                id: 'uniqueRight'
            },
            {
                id: 'common1',
                nested: [
                    {
                        id: 'nestedUniqueRight'
                    },
                    {
                        id: 'common2',
                        rightOnly: true,
                        both: 'rightShouldTakePrecedence'
                    }
                ]
            }
        ];
        const result = deepCustomMerge(left, right, {
            identifyArrayItem: item => item.id
        });
        expect(result).toEqual([
            {
                id: 'uniqueLeft'
            },
            {
                id: 'common1',
                nested: [
                    {
                        id: 'nestedUniqueLeft'
                    },
                    {
                        id: 'common2',
                        leftOnly: true,
                        both: 'rightShouldTakePrecedence',
                        rightOnly: true
                    },
                    {
                        id: 'nestedUniqueRight'
                    }
                ]
            },
            {
                id: 'uniqueRight'
            }
        ]);
    });

    it('handles non array inputs', () => {
        const objMerge = deepCustomMerge({ a: 1, b: 2 }, { c: 1, b: 999 });
        expect(objMerge).toMatchObject({ a: 1, b: 999, c: 1 });

        const strMerge = deepCustomMerge('abc', 'xyz');
        expect(strMerge).toBe('xyz');

        const intMerge = deepCustomMerge(123, 456);
        expect(intMerge).toBe(456);

        const nullMerge = deepCustomMerge(null, null);
        expect(nullMerge).toBe(null);
    });

    it('supports removing array items', () => {
        const left = {
            items: [{ id: 1 }, { id: 2 }]
        };
        const right = {
            items: [{ id: 2 }]
        };
        const inclusive = deepCustomMerge(left, right, {
            identifyArrayItem: item => item.id
        });
        const exclusive = deepCustomMerge(left, right, {
            identifyArrayItem: item => item.id,
            removeArrayItems: true
        });
        expect(inclusive.items).toEqual([{ id: 1 }, { id: 2 }]);
        expect(exclusive.items).toEqual([{ id: 2 }]);
    });
});
