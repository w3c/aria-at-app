const { hashTest, hashTests } = require('./aria');
const singleTest = require('../tests/mock-data/aria-util/singleTest.json');
const singleTestWithChangedId = require('../tests/mock-data/aria-util/singleTestWithChangedId.json');
const singleTestWithChangedTitle = require('../tests/mock-data/aria-util/singleTestWithChangedTitle.json');
const singleTestWithoutIds = require('../tests/mock-data/aria-util/singleTestWithoutIds.json');
const testsWithInstructionsSayingEnsureA = require('../tests/mock-data/aria-util/testsWithInstructionsSayingEnsureA.json');
const testsWithInstructionsSayingInsureA = require('../tests/mock-data/aria-util/testsWithInstructionsSayingInsureA.json');
const testsWithInstructionsSayingInsureB = require('../tests/mock-data/aria-util/testsWithInstructionsSayingInsureB.json');

describe('Verify test hashes are matching as expected', () => {
    it('should have a matching hash for with the same test, but with ids excluded for one', () => {
        const testHashA = hashTest(singleTest);
        const testHashB = hashTest(singleTestWithoutIds);

        expect(testHashA).toEqual(testHashB);
    });

    it('should have a matching hash with the same test, but having a changed id', () => {
        const testHashA = hashTest(singleTest);
        const testHashB = hashTest(singleTestWithChangedId);

        expect(testHashA).toEqual(testHashB);
    });

    it('should not have a matching has with the same test, but different test content (title)', () => {
        const testHashA = hashTest(singleTest);
        const testHashB = hashTest(singleTestWithChangedTitle);

        expect(testHashA).not.toEqual(testHashB);
    });

    it('should match TestPlanVersion.hashedTests for Alert 252 in production', () => {
        const testPlanVersionHashedTestsAlert252 =
            '2236c51249aa66f67720b9c9bb25d35532fd26c2';
        // InsureA is based on TestPlanVersion 252 as the tests/alert directory was updated; see
        // https://github.com/w3c/aria-at/commit/9ccc788
        const testsHashA = hashTests(testsWithInstructionsSayingInsureA);

        expect(testsHashA).toEqual(testPlanVersionHashedTestsAlert252);
    });

    it('should match test hash in production', () => {
        const singleTestHashInProduction =
            '5a0f2508e73f3de8de176923c946d6e9024144bd';

        const testIndex0Hash = hashTest(testsWithInstructionsSayingInsureA[0]);
        // singleTest.json is based on testsWithInstructionsSayingInsureA[0]
        const singleTestHash = hashTest(singleTest);

        expect(singleTestHashInProduction).toEqual(testIndex0Hash);
        expect(singleTestHashInProduction).toEqual(singleTestHash);
    });

    it('should have matching hashes for collections of matching tests, but different ids', () => {
        // These tests are based on the tests/alert history seen at
        // https://github.com/w3c/aria-at/commits/master/tests/alert

        // InsureA is based on TestPlanVersion 252 as the tests/alert directory was updated; see
        // https://github.com/w3c/aria-at/commit/9ccc788
        const testsHashA = hashTests(testsWithInstructionsSayingInsureA);

        // InsureB is based on TestPlanVersion 435 (a copy version of 252, the tests/alert directory
        // was not updated between these commits, therefore the tests would remain the same; see
        // https://github.com/w3c/aria-at/commit/0c61f71 and
        // https://github.com/w3c/aria-at/compare/9ccc788..0c61f71)
        const testsHashB = hashTests(testsWithInstructionsSayingInsureB);

        expect(testsHashA).toEqual(testsHashB);
    });

    it('should not have matching hashes for collections of non-matching tests', () => {
        // InsureA is based on TestPlanVersion 252; see https://github.com/w3c/aria-at/commit/9ccc788
        const testsHashA = hashTests(testsWithInstructionsSayingInsureA);

        // EnsureA is based on TestPlanVersion 815, when the tests/alert directory was next updated;
        // see https://github.com/w3c/aria-at/commit/e87df45
        const testsHashB = hashTests(testsWithInstructionsSayingEnsureA);

        expect(testsHashA).not.toEqual(testsHashB);
    });
});
