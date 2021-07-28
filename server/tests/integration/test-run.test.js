const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models/index');
const validateTestResult = require('../../util/validateTestResult');

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

describe('test queue', () => {
    it('displays test plan run', async () => {
        const testPlanRunId = 1;

        const result = await query(
            gql`
                query {
                    testPlanRun(id: ${testPlanRunId}) {
                        testResultCount
                        tester {
                            id
                            username
                        }
                        testResults {
                            title
                            index
                            referenceFilePath
                            isComplete
                            isSkipped
                            assertions {
                                command
                                priority
                                manualAssertion
                            }
                            assertionsCount
                            assertionsPassed
                            unexpectedBehaviorCount
                        }
                    }
                }
            `
        );

        expect(result).toEqual(
            expect.objectContaining({
                testPlanRun: expect.objectContaining({
                    testResultCount: expect.any(Number),
                    tester: {
                        id: expect.anything(),
                        username: expect.any(String)
                    },
                    testResults: expect.arrayContaining([
                        expect.objectContaining({
                            title: expect.any(String),
                            index: expect.any(Number),
                            referenceFilePath: expect.any(String),
                            isComplete: expect.any(Boolean),
                            isSkipped: expect.any(Boolean),
                            assertions: expect.arrayContaining([
                                {
                                    command: expect.any(String),
                                    priority: expect.any(String),
                                    manualAssertion: expect.any(String)
                                }
                            ]),
                            assertionsCount: expect.any(Number),
                            assertionsPassed: expect.any(Number),
                            unexpectedBehaviorCount: expect.any(Number)
                        })
                    ])
                })
            })
        );
    });

    it('updates test plan run serializedForm data', async () => {
        await dbCleaner(async () => {
            const testReportId = '1';
            const testerId = '2';
            const testPlanResultIndex = 1;

            // create new testPlanRun
            const assignTesterResult = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testReportId}) {
                        assignTester(userId: ${testerId}) {
                            testPlanReport {
                                draftTestPlanRuns {
                                    id
                                    tester {
                                        id
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // id of newly created testPlanRun
            const testPlanRunId = assignTesterResult.testPlanReport.assignTester.testPlanReport.draftTestPlanRuns.find(
                run => run.tester.id === testerId
            ).id;

            const previous = await query(gql`
                query {
                    testPlanRun(id: ${testPlanRunId}) {
                        testResultCount
                        tester {
                            id
                            username
                        }
                        testResults {
                            index
                            serializedForm {
                                name
                            }
                        }
                    }
                }
            `);

            const previousTestResult = previous.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            const result = await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        updateTestResult(
                            input: {
                                index: ${testPlanResultIndex}
                                test: {
                                    htmlFile: "tests/checkbox/test-01-navigate-to-unchecked-checkbox-reading.html"
                                    testFullName: "Navigate to an unchecked checkbox in reading mode"
                                    executionOrder: 1
                                }
                                serializedForm: [
                                    {
                                        name: "result-0-0"
                                        value: "on"
                                        checked: true
                                        disabled: false
                                        indeterminate: false
                                    }
                                    {
                                        name: "result-0-1"
                                        value: "on"
                                        checked: false
                                        disabled: false
                                        indeterminate: false
                                    }
                                ]
                            }
                        ) {
                            testPlanRun {
                                testResultCount
                                tester {
                                    id
                                    username
                                }
                                testResults {
                                    index
                                    serializedForm {
                                        name
                                        value
                                        checked
                                        disabled
                                        indeterminate
                                    }
                                }
                            }
                        }
                    }
                }
            `);
            const testResult = result.testPlanRun.updateTestResult.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            expect(previousTestResult).not.toBeTruthy();

            expect(testResult).toBeTruthy();
            expect(testResult.serializedForm).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String),
                        value: expect.any(String),
                        checked: expect.any(Boolean),
                        disabled: expect.any(Boolean),
                        indeterminate: expect.any(Boolean)
                    })
                ])
            );
        });
    });

    it('updates test plan run result data', async () => {
        await dbCleaner(async () => {
            const testPlanRunId = 1;
            const testPlanResultIndex = 1;

            // If testResult is submitted, means the user submitted that test's
            // form.
            // Checking to see if testResult is not yet 'complete'
            const previous = await query(
                gql`
                query {
                    testPlanRun(id: ${testPlanRunId}) {
                        testResultCount
                        tester {
                            id
                            username
                        }
                        testResults {
                            index
                            isComplete
                            result {
                                test
                            }
                        }
                    }
                }
            `
            );
            const previousTestResult = previous.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            const result = await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        updateTestResult(
                            input: {
                                index: ${testPlanResultIndex}
                                result: {
                                    test: "Navigate to an unchecked checkbox in reading mode"
                                    status: "PASS"
                                    details: {
                                        name: "Navigate to an unchecked checkbox in reading mode"
                                        task: "navigate to unchecked checkbox"
                                        summary: {
                                            required: { fail: 0, pass: 12 }
                                            optional: { fail: 0, pass: 0 }
                                            unexpectedCount: 0
                                        }
                                        commands: [
                                            {
                                                output: "Success"
                                                command: "X / Shift+X"
                                                support: "FULL"
                                                assertions: [
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Role \\"checkbox\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Name \\"Lettuce\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "State of the checkbox (not checked) is conveyed"
                                                    }
                                                ]
                                                unexpected_behaviors: []
                                            }
                                            {
                                                output: "Success"
                                                command: "F / Shift+F"
                                                support: "FULL"
                                                assertions: [
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Role \\"checkbox\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Name \\"Lettuce\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "State of the checkbox (not checked) is conveyed"
                                                    }
                                                ]
                                                unexpected_behaviors: []
                                            }
                                            {
                                                output: "Success"
                                                command: "Tab / Shift+Tab"
                                                support: "FULL"
                                                assertions: [
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Role \\"checkbox\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Name \\"Lettuce\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "State of the checkbox (not checked) is conveyed"
                                                    }
                                                ]
                                                unexpected_behaviors: []
                                            }
                                            {
                                                output: "Success"
                                                command: "Up Arrow / Down Arrow"
                                                support: "FULL"
                                                assertions: [
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Role \\"checkbox\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "Name \\"Lettuce\\" is conveyed"
                                                    }
                                                    {
                                                        pass: "Good Output "
                                                        priority: "1"
                                                        assertion: "State of the checkbox (not checked) is conveyed"
                                                    }
                                                ]
                                                unexpected_behaviors: []
                                            }
                                        ]
                                        specific_user_instruction: "Navigate to the first checkbox. Note: it should be in the unchecked state."
                                    }
                                }
                            }
                        ) {
                            testPlanRun {
                                testResultCount
                                tester {
                                    id
                                    username
                                }
                                testResults {
                                    index
                                    isComplete
                                    result {
                                        test
                                    }
                                }
                            }
                        }
                    }
                }
            `);
            const testResult = result.testPlanRun.updateTestResult.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            expect(previousTestResult.isComplete).toEqual(false);
            expect(testResult.isComplete).toEqual(true);
        });
    });

    it('fails to update test if invalid test object provided for new test plan run', async () => {
        await dbCleaner(async () => {
            const testReportId = '1';
            const testerId = '2';
            const testPlanResultIndex = 1;

            // create new testPlanRun
            const assignTesterResult = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testReportId}) {
                        assignTester(userId: ${testerId}) {
                            testPlanReport {
                                draftTestPlanRuns {
                                    id
                                    tester {
                                        id
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // id of newly created testPlanRun
            const testPlanRunId = assignTesterResult.testPlanReport.assignTester.testPlanReport.draftTestPlanRuns.find(
                run => run.tester.id === testerId
            ).id;

            const updateTestPlanResult = async () => {
                await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        updateTestResult(
                            input: {
                                index: ${testPlanResultIndex}
                                test: {
                                    testFullName: "Navigate to an unchecked checkbox in reading mode"
                                    executionOrder: 1
                                }
                            }
                        ) {
                            testPlanRun {
                                testResultCount
                                tester {
                                    id
                                    username
                                }
                                testResults {
                                    index
                                    serializedForm {
                                        name
                                        value
                                        checked
                                        disabled
                                        indeterminate
                                    }
                                }
                            }
                        }
                    }
                }
            `);
            };

            await expect(updateTestPlanResult()).rejects.toThrow(
                /ValidationError/gi
            );
        });
    });

    it('fails to update serializedForm if no test object provided for new test plan run', async () => {
        await dbCleaner(async () => {
            const testReportId = '1';
            const testerId = '2';
            const testPlanResultIndex = 1;

            // create new testPlanRun
            const assignTesterResult = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testReportId}) {
                        assignTester(userId: ${testerId}) {
                            testPlanReport {
                                draftTestPlanRuns {
                                    id
                                    tester {
                                        id
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // id of newly created testPlanRun
            const testPlanRunId = assignTesterResult.testPlanReport.assignTester.testPlanReport.draftTestPlanRuns.find(
                run => run.tester.id === testerId
            ).id;

            const updateTestPlanResult = async () => {
                await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        updateTestResult(
                            input: {
                                index: ${testPlanResultIndex}
                                serializedForm: [
                                    {
                                        name: "result-0-0"
                                        value: "on"
                                        checked: true
                                        disabled: false
                                        indeterminate: false
                                    }
                                    {
                                        name: "result-0-1"
                                        value: "on"
                                        checked: false
                                        disabled: false
                                        indeterminate: false
                                    }
                                ]
                            }
                        ) {
                            testPlanRun {
                                testResultCount
                                tester {
                                    id
                                    username
                                }
                                testResults {
                                    index
                                    serializedForm {
                                        name
                                        value
                                        checked
                                        disabled
                                        indeterminate
                                    }
                                }
                            }
                        }
                    }
                }
            `);
            };

            await expect(updateTestPlanResult()).rejects.toThrow(
                /no 'test' object provided/gi
            );
        });
    });

    it('transforms testResult.test priority keys from numbers to strings', async () => {
        const testResult = {
            test: {
                htmlFile:
                    'tests/checkbox/test-01-navigate-to-unchecked-checkbox-reading.html',
                testFullName:
                    'Navigate to an unchecked checkbox in reading mode',
                executionOrder: 1
            },
            issues: [76],
            result: {
                test: 'Navigate to an unchecked checkbox in reading mode',
                status: 'PASS',
                details: {
                    name: 'Navigate to an unchecked checkbox in reading mode',
                    task: 'navigate to unchecked checkbox',
                    summary: {
                        '1': { fail: 0, pass: 12 },
                        '2': { fail: 0, pass: 0 },
                        unexpectedCount: 0
                    },
                    commands: [
                        {
                            output: 'Success',
                            command: 'X / Shift+X',
                            support: 'FULL',
                            assertions: [
                                {
                                    pass: 'Good Output ',
                                    priority: '1',
                                    assertion: "Role 'checkbox' is conveyed"
                                },
                                {
                                    pass: 'Good Output ',
                                    priority: '1',
                                    assertion: "Name 'Lettuce' is conveyed"
                                },
                                {
                                    pass: 'Good Output ',
                                    priority: '1',
                                    assertion:
                                        'State of the checkbox (not checked) is conveyed'
                                }
                            ],
                            unexpected_behaviors: []
                        }
                    ],
                    specific_user_instruction:
                        'Navigate to the first checkbox. Note: it should be in the unchecked state.'
                }
            },
            serializedForm: [
                { name: '', value: 'Success', disabled: false },
                {
                    name: 'result-0-0',
                    value: 'on',
                    checked: true,
                    disabled: false,
                    indeterminate: false
                },
                {
                    name: 'result-0-0',
                    value: 'on',
                    checked: false,
                    disabled: false,
                    indeterminate: false
                },
                {
                    name: 'result-0-0',
                    value: 'on',
                    checked: false,
                    disabled: false,
                    indeterminate: false
                },
                {
                    name: 'result-0-1',
                    value: 'on',
                    checked: true,
                    disabled: false,
                    indeterminate: false
                }
            ]
        };

        const previousRequiredPassValue =
            testResult.result.details.summary['1'].pass;
        const previousRequiredFailValue =
            testResult.result.details.summary['1'].fail;
        const previousOptionalPassValue =
            testResult.result.details.summary['2'].pass;
        const previousOptionalFailValue =
            testResult.result.details.summary['2'].fail;

        expect(testResult.result.details.summary).toHaveProperty('1');
        expect(testResult.result.details.summary).toHaveProperty('2');

        // transform testResult if required
        const validatedTestResult = await validateTestResult(testResult);

        expect(validatedTestResult.result.details.summary).toHaveProperty(
            'required'
        );
        expect(validatedTestResult.result.details.summary).toHaveProperty(
            'optional'
        );
        expect(validatedTestResult.result.details.summary).not.toHaveProperty(
            '1'
        );
        expect(validatedTestResult.result.details.summary).not.toHaveProperty(
            '2'
        );

        expect(previousRequiredPassValue).toEqual(
            validatedTestResult.result.details.summary.required.pass
        );
        expect(previousRequiredFailValue).toEqual(
            validatedTestResult.result.details.summary.required.fail
        );
        expect(previousOptionalPassValue).toEqual(
            validatedTestResult.result.details.summary.optional.pass
        );
        expect(previousOptionalFailValue).toEqual(
            validatedTestResult.result.details.summary.optional.fail
        );
    });
});
