const convertAssertionPriority = require('./convertAssertionPriority');

describe('Verify expected values are returned when calling convertAssertionPriority', () => {
    it('expects valid priority strings are returned for known priority inputs', () => {
        const excludePriorityA = convertAssertionPriority(0);
        const excludePriorityB = convertAssertionPriority('EXCLUDE');

        const mustPriorityA = convertAssertionPriority(1);
        const mustPriorityB = convertAssertionPriority('REQUIRED');
        const mustPriorityC = convertAssertionPriority('MUST');

        const shouldPriorityA = convertAssertionPriority(2);
        const shouldPriorityB = convertAssertionPriority('OPTIONAL');
        const shouldPriorityC = convertAssertionPriority('SHOULD');

        const mayPriorityA = convertAssertionPriority(3);
        const mayPriorityB = convertAssertionPriority('MAY');

        expect(excludePriorityA).toEqual('EXCLUDE');
        expect(excludePriorityB).toEqual('EXCLUDE');

        expect(mustPriorityA).toEqual('MUST');
        expect(mustPriorityB).toEqual('MUST');
        expect(mustPriorityC).toEqual('MUST');

        expect(shouldPriorityA).toEqual('SHOULD');
        expect(shouldPriorityB).toEqual('SHOULD');
        expect(shouldPriorityC).toEqual('SHOULD');

        expect(mayPriorityA).toEqual('MAY');
        expect(mayPriorityB).toEqual('MAY');
    });

    it('expects null values are returned for unknown priority inputs', () => {
        const invalidInputA = convertAssertionPriority(-1);
        const invalidInputB = convertAssertionPriority(4);
        const invalidInputC = convertAssertionPriority(12);
        const invalidInputD = convertAssertionPriority('EXCLUDED');
        const invalidInputE = convertAssertionPriority('RANDOM STRING');

        expect(invalidInputA).not.toEqual('MUST');
        expect(invalidInputA).toEqual(null);

        expect(invalidInputB).toEqual(null);

        expect(invalidInputC).not.toEqual('MUST');
        expect(invalidInputC).not.toEqual('SHOULD');
        expect(invalidInputC).toEqual(null);

        expect(invalidInputD).not.toEqual('EXCLUDE');
        expect(invalidInputD).toEqual(null);

        expect(invalidInputE).toEqual(null);
    });
});
