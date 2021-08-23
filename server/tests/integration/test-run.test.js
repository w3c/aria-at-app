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
                            testFilePath
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
                            testFilePath: expect.any(String),
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

    it('updates test plan run state data', async () => {
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
                            state
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
                                state: {
                                    errors: [],
                                    info: {
                                        description:
                                        "Navigate to an unchecked checkbox in interaction mode",
                                        task: "navigate to unchecked checkbox",
                                        mode: "interaction",
                                        modeInstructions:
                                        "If NVDA did not make the focus mode sound when the test page loaded, press Insert+Space to turn focus mode on.",
                                        userInstructions: [
                                            "Navigate to the first checkbox. Note: it should be in the unchecked state."
                                        ],
                                        setupScriptDescription: ""
                                    },
                                    config: {
                                        at: {
                                            name: "NVDA",
                                            key: "nvda"
                                        },
                                        displaySubmitButton: true,
                                        renderResultsAfterSubmit: true
                                    },
                                    currentUserAction: "showResults",
                                    openTest: {
                                        enabled: true
                                    },
                                    commands: [
                                        {
                                            description: "Tab / Shift+Tab",
                                            atOutput: {
                                                highlightRequired: false,
                                                value: "Okay Output"
                                            },
                                            assertions: [
                                                {
                                                    description: "Role \\"checkbox\\" is conveyed",
                                                    highlightRequired: false,
                                                    priority: 1,
                                                    result: "pass"
                                                },
                                                {
                                                    description: "Name \\"Lettuce\\" is conveyed",
                                                    highlightRequired: false,
                                                    priority: 1,
                                                    result: "pass"
                                                },
                                                {
                                                    description:
                                                    "State of the checkbox (not checked) is conveyed",
                                                    highlightRequired: false,
                                                    priority: 1,
                                                    result: "pass"
                                                }
                                            ],
                                            additionalAssertions: [],
                                            unexpected: {
                                                highlightRequired: false,
                                                hasUnexpected: "doesNotHaveUnexpected",
                                                tabbedBehavior: -1,
                                                behaviors: [
                                                    {
                                                        description:
                                                        "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech",
                                                        checked: false,
                                                        more: null
                                                    },
                                                    {
                                                        description:
                                                        "Reading cursor position changed in an unexpected manner",
                                                        checked: false,
                                                        more: null
                                                    },
                                                    {
                                                        description:
                                                        "Screen reader became extremely sluggish",
                                                        checked: false,
                                                        more: null
                                                    },
                                                    {
                                                        description: "Screen reader crashed",
                                                        checked: false,
                                                        more: null
                                                    },
                                                    {
                                                        description: "Browser crashed",
                                                        checked: false,
                                                        more: null
                                                    },
                                                    {
                                                        description: "Other",
                                                        checked: false,
                                                        more: {
                                                            highlightRequired: false,
                                                            value: ""
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
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
                                    state
                                }
                            }
                        }
                    }
                }
            `);
            const testResult = result.testPlanRun.updateTestResult.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            expect(previousTestResult).toBeTruthy();
            expect(previousTestResult.state).not.toBeTruthy();

            expect(testResult).toBeTruthy();
            expect(testResult.state).toEqual(
                expect.objectContaining({
                    errors: expect.any(Array),
                    info: expect.any(Object),
                    config: expect.any(Object),
                    currentUserAction: expect.any(String),
                    openTest: expect.any(Object),
                    commands: expect.any(Array)
                })
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
                            result
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
                                    results: {
                                        header: "Navigate to an unchecked checkbox in interaction mode",
                                        status: {
                                            header: ["Test result: ", "PASS"]
                                        },
                                        table: {
                                            headers: {
                                                description: "Command",
                                                support: "Support",
                                                details: "Details"
                                            },
                                            commands: [
                                                {
                                                    description: "Tab / Shift+Tab",
                                                    support: "FULL",
                                                    details: {
                                                        output: [
                                                            "output:",
                                                            {
                                                                whitespace: "lineBreak"
                                                            },
                                                            " ",
                                                            "Okay Output"
                                                        ],
                                                        passingAssertions: {
                                                            description: "Passing Assertions:",
                                                            items: [
                                                                "Role \\"checkbox\\" is conveyed",
                                                                "Name \\"Lettuce\\" is conveyed",
                                                                "State of the checkbox (not checked) is conveyed"
                                                            ]
                                                        },
                                                        failingAssertions: {
                                                            description: "Failing Assertions:",
                                                            items: ["No failing assertions."]
                                                        },
                                                        unexpectedBehaviors: {
                                                            description: "Unexpected Behavior",
                                                            items: ["No unexpect behaviors."]
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    resultsJSON: {
                                        test: "Navigate to an unchecked checkbox in interaction mode",
                                        details: {
                                            name: "Navigate to an unchecked checkbox in interaction mode",
                                            task: "navigate to unchecked checkbox",
                                            specific_user_instruction:
                                            "Navigate to the first checkbox. Note: it should be in the unchecked state.",
                                            summary: {
                                                required: {
                                                    pass: 3,
                                                    fail: 0
                                                },
                                                optional: {
                                                    pass: 0,
                                                    fail: 0
                                                },
                                                unexpectedCount: 0
                                            },
                                            commands: [
                                                {
                                                    command: "Tab / Shift+Tab",
                                                    output: "Okay Output",
                                                    support: "FULL",
                                                    assertions: [
                                                        {
                                                            assertion: "Role \\"checkbox\\" is conveyed",
                                                            priority: "1",
                                                            pass: "Good Output"
                                                        },
                                                        {
                                                            assertion: "Name \\"Lettuce\\" is conveyed",
                                                            priority: "1",
                                                            pass: "Good Output"
                                                        },
                                                        {
                                                            assertion:
                                                            "State of the checkbox (not checked) is conveyed",
                                                            priority: "1",
                                                            pass: "Good Output"
                                                        }
                                                    ],
                                                    unexpected_behaviors: []
                                                }
                                            ]
                                        },
                                        status: "PASS"
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
                                    result
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
