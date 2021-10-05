import alphabetizeObjectBy from './alphabetizeObjectBy';

describe('alphabetizeObjectBy', () => {
    it('alphabetizes an object', () => {
        const before = { z: 1, y: 2, x: 3 };
        const after = alphabetizeObjectBy(before, ([key]) => key);
        expect(Object.entries(after)).toEqual([
            ['x', 3],
            ['y', 2],
            ['z', 1]
        ]);
    });

    it('returns a shallow copy', () => {
        const identicalObject = {};
        const before = { c: 1, b: 2, a: identicalObject };
        const after = alphabetizeObjectBy(before, ([key]) => key);
        identicalObject.testAddingAProperty = true;
        expect(after.a).toBe(identicalObject);
        expect(after.a.testAddingAProperty).toBe(true);
    });
});
