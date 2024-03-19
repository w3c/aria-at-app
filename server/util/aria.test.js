const { hashTest, hashTests } = require('./aria');
const singleTest = require('../tests/mock-data/aria-util/singleTest.json');
const singleTestWithChangedId = require('../tests/mock-data/aria-util/singleTestWithChangedId.json');
const singleTestWithChangedTitle = require('../tests/mock-data/aria-util/singleTestWithChangedTitle.json');
const singleTestWithoutIds = require('../tests/mock-data/aria-util/singleTestWithoutIds.json');
const testsWithInstructionsSayingEnsureA = require('../tests/mock-data/aria-util/testsWithInstructionsSayingEnsureA.json');
const testsWithInstructionsSayingInsureA = require('../tests/mock-data/aria-util/testsWithInstructionsSayingInsureA.json');
const testsWithInstructionsSayingInsureB = require('../tests/mock-data/aria-util/testsWithInstructionsSayingInsureB.json');
// Sourced from https://github.com/w3c/aria-at/commits/master/tests/command-button
const commandButton_V20230823_V1 = require('../tests/mock-data/aria-util/commandButton_V20230823_V1.json');
const commandButton_V20231206_V2 = require('../tests/mock-data/aria-util/commandButton_V20231206_V2.json');
const commandButton_V20231213_V2 = require('../tests/mock-data/aria-util/commandButton_V20231213_V2.json');

describe('Verify test hashes are matching as expected - (v1 test format)', () => {
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

describe('Verify test hashes are matching as expected - (v2 test format)', () => {
  it('should not match a v2 test format version with a v1 test format version', () => {
    // Based on https://github.com/w3c/aria-at/commit/836fb2a997f5b2844035b8c934f8fda9833cd5b2
    const v1TestsHash = hashTests(commandButton_V20230823_V1);

    // Based on https://github.com/w3c/aria-at/commit/d9a19f815d0f21194023b1c5919eb3b04d5c1ab7
    const v2TestsHash_1 = hashTests(commandButton_V20231206_V2);
    // Based on https://github.com/w3c/aria-at/commit/565a87b4111acebdb883d187b581e82c42a73844
    const v2TestsHash_2 = hashTests(commandButton_V20231213_V2);

    expect(v1TestsHash).not.toEqual(v2TestsHash_1);
    expect(v1TestsHash).not.toEqual(v2TestsHash_2);
  });

  it('should not completely match a collection of tests hash with updated AT settings', () => {
    // The difference between them is that there have been updated setting identifiers for VoiceOver tests;
    // quickNavOn -> singleQuickKeyNavOn
    // Compare with https://github.com/w3c/aria-at/compare/d9a19f8..565a87b

    // Based on https://github.com/w3c/aria-at/commit/d9a19f815d0f21194023b1c5919eb3b04d5c1ab7
    const v2TestsHash_1 = hashTests(commandButton_V20231206_V2);
    // Based on https://github.com/w3c/aria-at/commit/565a87b4111acebdb883d187b581e82c42a73844
    const v2TestsHash_2 = hashTests(commandButton_V20231213_V2);

    expect(v2TestsHash_1).not.toEqual(v2TestsHash_2);
  });

  it('should match collection of tests not a part of updated AT settings', () => {
    // Only tests[].at.key === 'voiceover_macos' was affected, not nvda or jaws
    const filterFn = t => t.at.key !== 'voiceover_macos';

    // Based on https://github.com/w3c/aria-at/commit/d9a19f815d0f21194023b1c5919eb3b04d5c1ab7
    const v2TestsHash_1 = hashTests(
      commandButton_V20231206_V2.filter(filterFn)
    );

    // Based on https://github.com/w3c/aria-at/commit/565a87b4111acebdb883d187b581e82c42a73844
    const v2TestsHash_2 = hashTests(
      commandButton_V20231213_V2.filter(filterFn)
    );

    expect(v2TestsHash_1).toEqual(v2TestsHash_2);
  });

  it('should match individual tests not a part of updated AT settings', () => {
    // Pos 0 and pos 1 of both commandButtonV2 tests point to JAWS and NVDA tests respectively
    const v2TestHash_1_JAWS = hashTest(commandButton_V20231206_V2[0]);
    const v2TestHash_2_JAWS = hashTest(commandButton_V20231213_V2[0]);

    const v2TestHash_1_NVDA = hashTest(commandButton_V20231206_V2[1]);
    const v2TestHash_2_NVDA = hashTest(commandButton_V20231213_V2[1]);

    expect(v2TestHash_1_JAWS).toEqual(v2TestHash_2_JAWS);
    expect(v2TestHash_1_NVDA).toEqual(v2TestHash_2_NVDA);
  });

  it('should ONLY match affected individual tests for AT with updated settings', () => {
    // The difference between them is that there have been updated setting identifiers for VoiceOver tests;
    // quickNavOn -> singleQuickKeyNavOn
    //
    // Based on https://github.com/w3c/aria-at/compare/d9a19f8...565a87b#diff-4e3dcd0a202f268ebec2316344f136c3a83d6e03b3f726775cb46c57322ff3a0,
    // only 'navForwardsToButton' and 'navBackToButton' tests were affected. The individual tests for 'reqInfoAboutButton'
    // should still match
    const findFn = (t, testId) =>
      t.at.key === 'voiceover_macos' && t.rawTestId === testId;

    // Original VO tests
    const navForwardsToButtonVO_1 = commandButton_V20231206_V2.find(t =>
      findFn(t, 'navForwardsToButton')
    );
    const navForwardsToButtonVOHash_1 = hashTest(navForwardsToButtonVO_1);

    const navBackToButtonVO_1 = commandButton_V20231206_V2.find(t =>
      findFn(t, 'navBackToButton')
    );
    const navBackToButtonVOHash_1 = hashTest(navBackToButtonVO_1);

    const reqInfoAboutButtonVO_1 = commandButton_V20231206_V2.find(t =>
      findFn(t, 'reqInfoAboutButton')
    );
    const reqInfoAboutButtonVOHash_1 = hashTest(reqInfoAboutButtonVO_1);

    // Updated VO tests
    const navForwardsToButtonVO_2 = commandButton_V20231213_V2.find(t =>
      findFn(t, 'navForwardsToButton')
    );
    const navForwardsToButtonVOHash_2 = hashTest(navForwardsToButtonVO_2);

    const navBackToButtonVO_2 = commandButton_V20231213_V2.find(t =>
      findFn(t, 'navBackToButton')
    );
    const navBackToButtonVOHash_2 = hashTest(navBackToButtonVO_2);

    const reqInfoAboutButtonVO_2 = commandButton_V20231213_V2.find(t =>
      findFn(t, 'reqInfoAboutButton')
    );
    const reqInfoAboutButtonVOHash_2 = hashTest(reqInfoAboutButtonVO_2);

    expect(navForwardsToButtonVOHash_1).not.toEqual(
      navForwardsToButtonVOHash_2
    );
    expect(navBackToButtonVOHash_1).not.toEqual(navBackToButtonVOHash_2);
    expect(reqInfoAboutButtonVOHash_1).toEqual(reqInfoAboutButtonVOHash_2);
  });
});
