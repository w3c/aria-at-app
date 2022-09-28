import React from 'react';
import CandidateTestPlanRun from '../components/CandidateTestPlanRun';
import {
    ADD_VIEWER_MUTATION,
    CANDIDATE_REPORTS_QUERY,
    PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION
} from '../components/CandidateTestPlanRun/queries';
import { ME_QUERY } from '../components/App/queries';
import { MemoryRouter, Route } from 'react-router-dom';

export default {
    component: CandidateTestPlanRun,
    title: 'CandidateTestPlanRun',
    decorators: [
        Story => (
            <MemoryRouter initialEntries={['/candidate-test-plan/1']}>
                <Route path="/candidate-test-plan/:testPlanVersionId">
                    <Story />
                </Route>
            </MemoryRouter>
        )
    ]
};

export const Default = args => <CandidateTestPlanRun {...args} />;

Default.args = {
    match: {
        url: '/candidate-test-plan/1',
        params: {
            testPlanVersionId: 1
        }
    }
};

let candidateReportsQueryCalled = false;
let switchCount = 0;

const viewers = [
    {
        username: 'warp2nowere'
    }
];

const candidateReportsDataFirstRun = {
    me: {
        id: '101',
        roles: ['VENDOR'],
        username: 'evmiguel',
        vendor: {
            at: 'JAWS',
            vendorCompany: 'vispero'
        }
    },
    testPlanReports: [
        {
            id: '102',
            candidateStatusReachedAt: '2022-09-28T20:03:52.711Z',
            recommendedStatusTargetDate: '2023-03-27T20:03:52.711Z',
            vendorReviewStatus: 'READY',
            issues: [],
            at: {
                id: '1',
                name: 'JAWS'
            },
            browser: {
                id: '3',
                name: 'Safari'
            },
            testPlanVersion: {
                id: '1',
                title: 'Alert Example',
                gitSha: '1aa3b74d24d340362e9f511eae33788d55487d12',
                testPlan: {
                    directory: 'alert'
                },
                metadata: {
                    exampleUrl:
                        'https://w3c.github.io/aria-practices/examples/alert/alert.html',
                    designPatternUrl:
                        'https://w3c.github.io/aria-practices/#alert'
                },
                testPageUrl:
                    '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/tests/alert/reference/2022-4-8_144013/alert.html'
            },
            runnableTests: [
                {
                    id: 'NjgwYeyIyIjoiMSJ9zYxZT',
                    title: 'Trigger an alert in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'trigger alert',
                            title: 'Trigger an alert in reading mode',
                            testId: 1,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                },
                                {
                                    refId: 'alert',
                                    value: 'https://w3c.github.io/aria/#alert'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description:
                                    "sets focus on the 'Trigger Alert' button"
                            },
                            referencePage:
                                'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'alert' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Text 'Hello' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                            ]
                        }
                    },
                    viewers: []
                },
                {
                    id: 'MDllNeyIyIjoiMSJ9DY1NT',
                    title: 'Trigger an alert in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'trigger alert',
                            title: 'Trigger an alert in interaction mode',
                            testId: 2,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                },
                                {
                                    refId: 'alert',
                                    value: 'https://w3c.github.io/aria/#alert'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description:
                                    "sets focus on the 'Trigger Alert' button"
                            },
                            referencePage:
                                'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'alert' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Text 'Hello' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                            ]
                        }
                    },
                    viewers: []
                }
            ],
            finalizedTestResults: [
                {
                    id: 'NzlkYeyIxMiI6MTAyfQzllNj',
                    completedAt: '2022-09-28T20:03:35.723Z',
                    test: {
                        id: 'NjgwYeyIyIjoiMSJ9zYxZT',
                        rowNumber: 1,
                        title: 'Trigger an alert in reading mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task: 'trigger alert',
                                title: 'Trigger an alert in reading mode',
                                testId: 1,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                    },
                                    {
                                        refId: 'alert',
                                        value:
                                            'https://w3c.github.io/aria/#alert'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'reading',
                                setupScript: {
                                    name: 'setFocusOnButton',
                                    source:
                                        "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusOnButton.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusOnButton.module.js',
                                    description:
                                        "sets focus on the 'Trigger Alert' button"
                                },
                                referencePage:
                                    'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                            },
                            commands: [
                                {
                                    id: 'SPACE',
                                    keystroke: 'Space',
                                    keypresses: [
                                        {
                                            id: 'SPACE',
                                            keystroke: 'Space'
                                        }
                                    ]
                                },
                                {
                                    id: 'ENTER',
                                    keystroke: 'Enter',
                                    keypresses: [
                                        {
                                            id: 'ENTER',
                                            keystroke: 'Enter'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'alert' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Text 'Hello' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                                mode:
                                    'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                                user: [
                                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'ZjM0MeyIxMyI6Ik56bGtZZXlJeE1pSTZNVEF5ZlF6bGxOaiJ9TcyZj',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SPACE',
                                        text: 'Space'
                                    }
                                ]
                            },
                            output: 'JAWS output after Space',
                            assertionResults: [
                                {
                                    id:
                                        'ZGYwOeyIxNCI6IlpqTTBNZXlJeE15STZJazU2Ykd0WlpYbEplRTFwU1RaTlZFRjVabEY2Ykd4T2FpSjlUY3laaiJ9TI4ZG',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'OGE5MeyIxNCI6IlpqTTBNZXlJeE15STZJazU2Ykd0WlpYbEplRTFwU1RaTlZFRjVabEY2Ykd4T2FpSjlUY3laaiJ9jQ3Yz',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'YjgzOeyIxMyI6Ik56bGtZZXlJeE1pSTZNVEF5ZlF6bGxOaiJ9DY2Mj',
                            scenario: {
                                commands: [
                                    {
                                        id: 'ENTER',
                                        text: 'Enter'
                                    }
                                ]
                            },
                            output: 'JAWS output after Enter',
                            assertionResults: [
                                {
                                    id:
                                        'YjQzNeyIxNCI6IllqZ3pPZXlJeE15STZJazU2Ykd0WlpYbEplRTFwU1RaTlZFRjVabEY2Ykd4T2FpSjlEWTJNaiJ9DJjNj',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'NzE1YeyIxNCI6IllqZ3pPZXlJeE15STZJazU2Ykd0WlpYbEplRTFwU1RaTlZFRjVabEY2Ykd4T2FpSjlEWTJNaiJ9jc4OG',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                },
                {
                    id: 'N2Q3NeyIxMiI6MTAyfQjkyNj',
                    completedAt: '2022-09-28T20:03:49.724Z',
                    test: {
                        id: 'MDllNeyIyIjoiMSJ9DY1NT',
                        rowNumber: 2,
                        title: 'Trigger an alert in interaction mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task: 'trigger alert',
                                title: 'Trigger an alert in interaction mode',
                                testId: 2,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                    },
                                    {
                                        refId: 'alert',
                                        value:
                                            'https://w3c.github.io/aria/#alert'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'interaction',
                                setupScript: {
                                    name: 'setFocusOnButton',
                                    source:
                                        "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusOnButton.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusOnButton.module.js',
                                    description:
                                        "sets focus on the 'Trigger Alert' button"
                                },
                                referencePage:
                                    'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                            },
                            commands: [
                                {
                                    id: 'SPACE',
                                    keystroke: 'Space',
                                    keypresses: [
                                        {
                                            id: 'SPACE',
                                            keystroke: 'Space'
                                        }
                                    ]
                                },
                                {
                                    id: 'ENTER',
                                    keystroke: 'Enter',
                                    keypresses: [
                                        {
                                            id: 'ENTER',
                                            keystroke: 'Enter'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'alert' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Text 'Hello' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                                mode:
                                    'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                                user: [
                                    "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'ZTc2MeyIxMyI6Ik4yUTNOZXlJeE1pSTZNVEF5ZlFqa3lOaiJ9zI2M2',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SPACE',
                                        text: 'Space'
                                    }
                                ]
                            },
                            output: 'JAWS output after Space',
                            assertionResults: [
                                {
                                    id:
                                        'OTIyZeyIxNCI6IlpUYzJNZXlJeE15STZJazR5VVROT1pYbEplRTFwU1RaTlZFRjVabEZxYTNsT2FpSjl6STJNMiJ9jAwMT',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'OTdkNeyIxNCI6IlpUYzJNZXlJeE15STZJazR5VVROT1pYbEplRTFwU1RaTlZFRjVabEZxYTNsT2FpSjl6STJNMiJ9GM0OT',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'MmI3NeyIxMyI6Ik4yUTNOZXlJeE1pSTZNVEF5ZlFqa3lOaiJ9GZhYz',
                            scenario: {
                                commands: [
                                    {
                                        id: 'ENTER',
                                        text: 'Enter'
                                    }
                                ]
                            },
                            output: 'JAWS output after Enter',
                            assertionResults: [
                                {
                                    id:
                                        'NDdjOeyIxNCI6Ik1tSTNOZXlJeE15STZJazR5VVROT1pYbEplRTFwU1RaTlZFRjVabEZxYTNsT2FpSjlHWmhZeiJ9Dc5YW',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZTk5YeyIxNCI6Ik1tSTNOZXlJeE15STZJazR5VVROT1pYbEplRTFwU1RaTlZFRjVabEZxYTNsT2FpSjlHWmhZeiJ9jdhYm',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                }
            ],
            draftTestPlanRuns: [
                {
                    tester: {
                        username: 'evmiguel'
                    },
                    testPlanReport: {
                        id: '102',
                        status: 'IN_REVIEW'
                    },
                    testResults: [
                        {
                            test: {
                                id: 'NjgwYeyIyIjoiMSJ9zYxZT'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '5',
                                name: '1'
                            },
                            completedAt: '2022-09-28T20:03:35.723Z'
                        },
                        {
                            test: {
                                id: 'MDllNeyIyIjoiMSJ9DY1NT'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '5',
                                name: '1'
                            },
                            completedAt: '2022-09-28T20:03:49.724Z'
                        }
                    ]
                }
            ]
        },
        {
            id: '101',
            candidateStatusReachedAt: '2022-09-28T20:03:00.358Z',
            recommendedStatusTargetDate: '2023-03-27T20:03:00.358Z',
            vendorReviewStatus: 'READY',
            issues: [],
            at: {
                id: '1',
                name: 'JAWS'
            },
            browser: {
                id: '2',
                name: 'Chrome'
            },
            testPlanVersion: {
                id: '1',
                title: 'Alert Example',
                gitSha: '1aa3b74d24d340362e9f511eae33788d55487d12',
                testPlan: {
                    directory: 'alert'
                },
                metadata: {
                    exampleUrl:
                        'https://w3c.github.io/aria-practices/examples/alert/alert.html',
                    designPatternUrl:
                        'https://w3c.github.io/aria-practices/#alert'
                },
                testPageUrl:
                    '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/tests/alert/reference/2022-4-8_144013/alert.html'
            },
            runnableTests: [
                {
                    id: 'NjgwYeyIyIjoiMSJ9zYxZT',
                    title: 'Trigger an alert in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'trigger alert',
                            title: 'Trigger an alert in reading mode',
                            testId: 1,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                },
                                {
                                    refId: 'alert',
                                    value: 'https://w3c.github.io/aria/#alert'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description:
                                    "sets focus on the 'Trigger Alert' button"
                            },
                            referencePage:
                                'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'alert' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Text 'Hello' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                            ]
                        }
                    },
                    viewers: []
                },
                {
                    id: 'MDllNeyIyIjoiMSJ9DY1NT',
                    title: 'Trigger an alert in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'trigger alert',
                            title: 'Trigger an alert in interaction mode',
                            testId: 2,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                },
                                {
                                    refId: 'alert',
                                    value: 'https://w3c.github.io/aria/#alert'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description:
                                    "sets focus on the 'Trigger Alert' button"
                            },
                            referencePage:
                                'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'alert' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Text 'Hello' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                            ]
                        }
                    },
                    viewers: []
                }
            ],
            finalizedTestResults: [
                {
                    id: 'NzUwYeyIxMiI6MTAxfQWRhM2',
                    completedAt: '2022-09-28T20:02:40.915Z',
                    test: {
                        id: 'NjgwYeyIyIjoiMSJ9zYxZT',
                        rowNumber: 1,
                        title: 'Trigger an alert in reading mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task: 'trigger alert',
                                title: 'Trigger an alert in reading mode',
                                testId: 1,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                    },
                                    {
                                        refId: 'alert',
                                        value:
                                            'https://w3c.github.io/aria/#alert'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'reading',
                                setupScript: {
                                    name: 'setFocusOnButton',
                                    source:
                                        "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusOnButton.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusOnButton.module.js',
                                    description:
                                        "sets focus on the 'Trigger Alert' button"
                                },
                                referencePage:
                                    'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                            },
                            commands: [
                                {
                                    id: 'SPACE',
                                    keystroke: 'Space',
                                    keypresses: [
                                        {
                                            id: 'SPACE',
                                            keystroke: 'Space'
                                        }
                                    ]
                                },
                                {
                                    id: 'ENTER',
                                    keystroke: 'Enter',
                                    keypresses: [
                                        {
                                            id: 'ENTER',
                                            keystroke: 'Enter'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'alert' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Text 'Hello' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                                mode:
                                    'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                                user: [
                                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'Y2NiYeyIxMyI6Ik56VXdZZXlJeE1pSTZNVEF4ZlFXUmhNMiJ9zhjZm',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SPACE',
                                        text: 'Space'
                                    }
                                ]
                            },
                            output: 'JAWS output after Space',
                            assertionResults: [
                                {
                                    id:
                                        'ZDhkYeyIxNCI6IlkyTmlZZXlJeE15STZJazU2VlhkWlpYbEplRTFwU1RaTlZFRjRabEZYVW1oTk1pSjl6aGpabSJ9jcwYm',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'Yjc0YeyIxNCI6IlkyTmlZZXlJeE15STZJazU2VlhkWlpYbEplRTFwU1RaTlZFRjRabEZYVW1oTk1pSjl6aGpabSJ9jhlN2',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'MjdlZeyIxMyI6Ik56VXdZZXlJeE1pSTZNVEF4ZlFXUmhNMiJ9DA1NT',
                            scenario: {
                                commands: [
                                    {
                                        id: 'ENTER',
                                        text: 'Enter'
                                    }
                                ]
                            },
                            output: 'JAWS output after Enter',
                            assertionResults: [
                                {
                                    id:
                                        'M2I2MeyIxNCI6Ik1qZGxaZXlJeE15STZJazU2VlhkWlpYbEplRTFwU1RaTlZFRjRabEZYVW1oTk1pSjlEQTFOVCJ9WI2Zj',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'NDVlYeyIxNCI6Ik1qZGxaZXlJeE15STZJazU2VlhkWlpYbEplRTFwU1RaTlZFRjRabEZYVW1oTk1pSjlEQTFOVCJ92ZkZW',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                },
                {
                    id: 'ZWYwMeyIxMiI6MTAxfQjg4Y2',
                    completedAt: '2022-09-28T20:02:56.920Z',
                    test: {
                        id: 'MDllNeyIyIjoiMSJ9DY1NT',
                        rowNumber: 2,
                        title: 'Trigger an alert in interaction mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task: 'trigger alert',
                                title: 'Trigger an alert in interaction mode',
                                testId: 2,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                                    },
                                    {
                                        refId: 'alert',
                                        value:
                                            'https://w3c.github.io/aria/#alert'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'interaction',
                                setupScript: {
                                    name: 'setFocusOnButton',
                                    source:
                                        "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusOnButton.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusOnButton.module.js',
                                    description:
                                        "sets focus on the 'Trigger Alert' button"
                                },
                                referencePage:
                                    'reference/2022-4-8_144013/alert.setFocusOnButton.html'
                            },
                            commands: [
                                {
                                    id: 'SPACE',
                                    keystroke: 'Space',
                                    keypresses: [
                                        {
                                            id: 'SPACE',
                                            keystroke: 'Space'
                                        }
                                    ]
                                },
                                {
                                    id: 'ENTER',
                                    keystroke: 'Enter',
                                    keypresses: [
                                        {
                                            id: 'ENTER',
                                            keystroke: 'Enter'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'alert' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Text 'Hello' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                                mode:
                                    'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                                user: [
                                    "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'YjM4ZeyIxMyI6IlpXWXdNZXlJeE1pSTZNVEF4ZlFqZzRZMiJ9DU5NG',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SPACE',
                                        text: 'Space'
                                    }
                                ]
                            },
                            output: 'JAWS output after Space',
                            assertionResults: [
                                {
                                    id:
                                        'MjdlZeyIxNCI6IllqTTRaZXlJeE15STZJbHBYV1hkTlpYbEplRTFwU1RaTlZFRjRabEZxWnpSWk1pSjlEVTVORyJ9TVhND',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'OWVlOeyIxNCI6IllqTTRaZXlJeE15STZJbHBYV1hkTlpYbEplRTFwU1RaTlZFRjRabEZxWnpSWk1pSjlEVTVORyJ9WI5Yj',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'OWVmZeyIxMyI6IlpXWXdNZXlJeE1pSTZNVEF4ZlFqZzRZMiJ9GI0ZD',
                            scenario: {
                                commands: [
                                    {
                                        id: 'ENTER',
                                        text: 'Enter'
                                    }
                                ]
                            },
                            output: 'JAWS output after Enter',
                            assertionResults: [
                                {
                                    id:
                                        'ODRiZeyIxNCI6Ik9XVm1aZXlJeE15STZJbHBYV1hkTlpYbEplRTFwU1RaTlZFRjRabEZxWnpSWk1pSjlHSTBaRCJ9jc3MT',
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZDBmMeyIxNCI6Ik9XVm1aZXlJeE15STZJbHBYV1hkTlpYbEplRTFwU1RaTlZFRjRabEZxWnpSWk1pSjlHSTBaRCJ9GQ4OT',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                }
            ],
            draftTestPlanRuns: [
                {
                    tester: {
                        username: 'evmiguel'
                    },
                    testPlanReport: {
                        id: '101',
                        status: 'IN_REVIEW'
                    },
                    testResults: [
                        {
                            test: {
                                id: 'NjgwYeyIyIjoiMSJ9zYxZT'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '4',
                                name: '105.0.0'
                            },
                            completedAt: '2022-09-28T20:02:40.915Z'
                        },
                        {
                            test: {
                                id: 'MDllNeyIyIjoiMSJ9DY1NT'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '4',
                                name: '105.0.0'
                            },
                            completedAt: '2022-09-28T20:02:56.920Z'
                        }
                    ]
                }
            ]
        },
        {
            id: '1',
            candidateStatusReachedAt: '2022-09-28T18:35:04.527Z',
            recommendedStatusTargetDate: '2023-03-27T18:35:04.527Z',
            vendorReviewStatus: 'IN_PROGRESS',
            issues: [],
            at: {
                id: '1',
                name: 'JAWS'
            },
            browser: {
                id: '2',
                name: 'Chrome'
            },
            testPlanVersion: {
                id: '31',
                title: 'Toggle Button',
                gitSha: '1aa3b74d24d340362e9f511eae33788d55487d12',
                testPlan: {
                    directory: 'toggle-button'
                },
                metadata: {
                    exampleUrl:
                        'https://w3c.github.io/aria-practices/examples/button/button.html',
                    designPatternUrl:
                        'https://w3c.github.io/aria-practices/#button'
                },
                testPageUrl:
                    '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/tests/toggle-button/reference/2022-4-8_135651/button.html'
            },
            runnableTests: [
                {
                    id: 'MTExZeyIyIjoiMzEifQWZhZG',
                    title:
                        'Navigate forwards to a not pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-01-navigate-forwards-to-not-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'navigate forwards to not pressed toggle button',
                            title:
                                'Navigate forwards to a not pressed toggle button in reading mode',
                            testId: 1,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusBeforeButton',
                                source:
                                    "// sets focus on a link before the button\ntestPageDocument.querySelector('#beforelink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusBeforeButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusBeforeButton.module.js',
                                description:
                                    'sets focus on a link before the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusBeforeButton.html'
                        },
                        commands: [
                            {
                                id: 'DOWN',
                                keystroke: 'Down Arrow',
                                keypresses: [
                                    {
                                        id: 'DOWN',
                                        keystroke: 'Down Arrow'
                                    }
                                ]
                            },
                            {
                                id: 'B',
                                keystroke: 'B',
                                keypresses: [
                                    {
                                        id: 'B',
                                        keystroke: 'B'
                                    }
                                ]
                            },
                            {
                                id: 'F',
                                keystroke: 'F',
                                keypresses: [
                                    {
                                        id: 'F',
                                        keystroke: 'F'
                                    }
                                ]
                            },
                            {
                                id: 'TAB',
                                keystroke: 'Tab',
                                keypresses: [
                                    {
                                        id: 'TAB',
                                        keystroke: 'Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'not pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Navigate forwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Navigate forwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'MzJkZeyIyIjoiMzEifQTAzMm',
                    title:
                        'Navigate backwards to a not pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-02-navigate-backwards-to-not-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'navigate backwards to not pressed toggle button',
                            title:
                                'Navigate backwards to a not pressed toggle button in reading mode',
                            testId: 2,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusAfterButton',
                                source:
                                    "// sets focus on a link after the button\ntestPageDocument.querySelector('#afterlink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusAfterButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusAfterButton.module.js',
                                description:
                                    'sets focus on a link after the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusAfterButton.html'
                        },
                        commands: [
                            {
                                id: 'UP',
                                keystroke: 'Up Arrow',
                                keypresses: [
                                    {
                                        id: 'UP',
                                        keystroke: 'Up Arrow'
                                    }
                                ]
                            },
                            {
                                id: 'SHIFT_B',
                                keystroke: 'Shift+B',
                                keypresses: [
                                    {
                                        id: 'SHIFT_B',
                                        keystroke: 'Shift+B'
                                    }
                                ]
                            },
                            {
                                id: 'SHIFT_F',
                                keystroke: 'Shift+F',
                                keypresses: [
                                    {
                                        id: 'SHIFT_F',
                                        keystroke: 'Shift+F'
                                    }
                                ]
                            },
                            {
                                id: 'SHIFT_TAB',
                                keystroke: 'Shift+Tab',
                                keypresses: [
                                    {
                                        id: 'SHIFT_TAB',
                                        keystroke: 'Shift+Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'not pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Navigate backwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Navigate backwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'NDBjMeyIyIjoiMzEifQjc1NT',
                    title:
                        'Navigate forwards to a not pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-03-navigate-forwards-to-not-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'navigate forwards to not pressed toggle button',
                            title:
                                'Navigate forwards to a not pressed toggle button in interaction mode',
                            testId: 3,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusBeforeButton',
                                source:
                                    "// sets focus on a link before the button\ntestPageDocument.querySelector('#beforelink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusBeforeButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusBeforeButton.module.js',
                                description:
                                    'sets focus on a link before the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusBeforeButton.html'
                        },
                        commands: [
                            {
                                id: 'TAB',
                                keystroke: 'Tab',
                                keypresses: [
                                    {
                                        id: 'TAB',
                                        keystroke: 'Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'not pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Navigate forwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Navigate forwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'MjE2MeyIyIjoiMzEifQ2M0NW',
                    title:
                        'Navigate backwards to a not pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-04-navigate-backwards-to-not-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'navigate backwards to not pressed toggle button',
                            title:
                                'Navigate backwards to a not pressed toggle button in interaction mode',
                            testId: 4,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusAfterButton',
                                source:
                                    "// sets focus on a link after the button\ntestPageDocument.querySelector('#afterlink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusAfterButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusAfterButton.module.js',
                                description:
                                    'sets focus on a link after the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusAfterButton.html'
                        },
                        commands: [
                            {
                                id: 'SHIFT_TAB',
                                keystroke: 'Shift+Tab',
                                keypresses: [
                                    {
                                        id: 'SHIFT_TAB',
                                        keystroke: 'Shift+Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'not pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Navigate backwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Navigate backwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'MmZmNeyIyIjoiMzEifQ2IxOG',
                    title:
                        'Navigate forwards to a pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-07-navigate-forwards-to-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'navigate forwards to pressed toggle button',
                            title:
                                'Navigate forwards to a pressed toggle button in reading mode',
                            testId: 7,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name:
                                    'setFocusBeforeButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on a link before the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#beforelink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusBeforeButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusBeforeButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on a link before the button, and sets the state of the button to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusBeforeButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'DOWN',
                                keystroke: 'Down Arrow',
                                keypresses: [
                                    {
                                        id: 'DOWN',
                                        keystroke: 'Down Arrow'
                                    }
                                ]
                            },
                            {
                                id: 'B',
                                keystroke: 'B',
                                keypresses: [
                                    {
                                        id: 'B',
                                        keystroke: 'B'
                                    }
                                ]
                            },
                            {
                                id: 'F',
                                keystroke: 'F',
                                keypresses: [
                                    {
                                        id: 'F',
                                        keystroke: 'F'
                                    }
                                ]
                            },
                            {
                                id: 'TAB',
                                keystroke: 'Tab',
                                keypresses: [
                                    {
                                        id: 'TAB',
                                        keystroke: 'Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Navigate forwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Navigate forwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'MWZiZeyIyIjoiMzEifQjhhYz',
                    title:
                        'Navigate backwards to a pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-08-navigate-backwards-to-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'navigate backwards to pressed toggle button',
                            title:
                                'Navigate backwards to a pressed toggle button in reading mode',
                            testId: 8,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusAfterButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on a link after the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#afterlink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusAfterButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusAfterButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on a link after the button, and sets the state of the button to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusAfterButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'UP',
                                keystroke: 'Up Arrow',
                                keypresses: [
                                    {
                                        id: 'UP',
                                        keystroke: 'Up Arrow'
                                    }
                                ]
                            },
                            {
                                id: 'SHIFT_B',
                                keystroke: 'Shift+B',
                                keypresses: [
                                    {
                                        id: 'SHIFT_B',
                                        keystroke: 'Shift+B'
                                    }
                                ]
                            },
                            {
                                id: 'SHIFT_F',
                                keystroke: 'Shift+F',
                                keypresses: [
                                    {
                                        id: 'SHIFT_F',
                                        keystroke: 'Shift+F'
                                    }
                                ]
                            },
                            {
                                id: 'SHIFT_TAB',
                                keystroke: 'Shift+Tab',
                                keypresses: [
                                    {
                                        id: 'SHIFT_TAB',
                                        keystroke: 'Shift+Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Navigate backwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Navigate backwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'NmI4NeyIyIjoiMzEifQDU2OD',
                    title:
                        'Navigate forwards to a pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-09-navigate-forwards-to-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'navigate forwards to pressed toggle button',
                            title:
                                'Navigate forwards to a pressed toggle button in interaction mode',
                            testId: 9,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name:
                                    'setFocusBeforeButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on a link before the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#beforelink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusBeforeButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusBeforeButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on a link before the button, and sets the state of the button to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusBeforeButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'TAB',
                                keystroke: 'Tab',
                                keypresses: [
                                    {
                                        id: 'TAB',
                                        keystroke: 'Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Navigate forwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Navigate forwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'YmExNeyIyIjoiMzEifQWE5Nj',
                    title:
                        'Navigate backwards to a pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-10-navigate-backwards-to-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'navigate backwards to pressed toggle button',
                            title:
                                'Navigate backwards to a pressed toggle button in interaction mode',
                            testId: 10,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusAfterButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on a link after the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#afterlink').focus();\n",
                                jsonpPath:
                                    'scripts/setFocusAfterButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusAfterButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on a link after the button, and sets the state of the button to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusAfterButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'SHIFT_TAB',
                                keystroke: 'Shift+Tab',
                                keypresses: [
                                    {
                                        id: 'SHIFT_TAB',
                                        keystroke: 'Shift+Tab'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Navigate backwards from here' link, navigate to the 'Mute' button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Navigate backwards from here' link, navigate to the 'Mute' button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'YzA3NeyIyIjoiMzEifQGZhYT',
                    title:
                        'Read information about a not pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-13-read-information-about-not-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'read information about not pressed toggle button',
                            title:
                                'Read information about a not pressed toggle button in reading mode',
                            testId: 13,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the button\ntestPageDocument.querySelector('#toggle').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description: 'sets focus on the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'INS_TAB',
                                keystroke: 'Insert+Tab',
                                keypresses: [
                                    {
                                        id: 'INS_TAB',
                                        keystroke: 'Insert+Tab'
                                    }
                                ]
                            },
                            {
                                id: 'INS_UP',
                                keystroke: 'Insert+Up',
                                keypresses: [
                                    {
                                        id: 'INS_UP',
                                        keystroke: 'Insert+Up'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'not pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Mute' button, read information about the button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Mute' button, read information about the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'YmYxOeyIyIjoiMzEifQDAxY2',
                    title:
                        'Read information about a not pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-14-read-information-about-not-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'read information about not pressed toggle button',
                            title:
                                'Read information about a not pressed toggle button in interaction mode',
                            testId: 14,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the button\ntestPageDocument.querySelector('#toggle').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description: 'sets focus on the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'INS_TAB',
                                keystroke: 'Insert+Tab',
                                keypresses: [
                                    {
                                        id: 'INS_TAB',
                                        keystroke: 'Insert+Tab'
                                    }
                                ]
                            },
                            {
                                id: 'INS_UP',
                                keystroke: 'Insert+Up',
                                keypresses: [
                                    {
                                        id: 'INS_UP',
                                        keystroke: 'Insert+Up'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'not pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Mute' button, read information about the button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Mute' button, read information about the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'YzIwOeyIyIjoiMzEifQGE2Yz',
                    title:
                        'Read information about a pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-16-read-information-about-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'read information about pressed toggle button',
                            title:
                                'Read information about a pressed toggle button in reading mode',
                            testId: 16,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusOnButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on the button, and sets its state to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\nbutton.focus();\n",
                                jsonpPath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on the button, and sets its state to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'INS_TAB',
                                keystroke: 'Insert+Tab',
                                keypresses: [
                                    {
                                        id: 'INS_TAB',
                                        keystroke: 'Insert+Tab'
                                    }
                                ]
                            },
                            {
                                id: 'INS_UP',
                                keystroke: 'Insert+Up',
                                keypresses: [
                                    {
                                        id: 'INS_UP',
                                        keystroke: 'Insert+Up'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Mute' button, read information about the button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Mute' button, read information about the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'YWMwNeyIyIjoiMzEifQDQ5MG',
                    title:
                        'Read information about a pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-17-read-information-about-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task:
                                'read information about pressed toggle button',
                            title:
                                'Read information about a pressed toggle button in interaction mode',
                            testId: 17,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusOnButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on the button, and sets its state to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\nbutton.focus();\n",
                                jsonpPath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on the button, and sets its state to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'INS_TAB',
                                keystroke: 'Insert+Tab',
                                keypresses: [
                                    {
                                        id: 'INS_TAB',
                                        keystroke: 'Insert+Tab'
                                    }
                                ]
                            },
                            {
                                id: 'INS_UP',
                                keystroke: 'Insert+Up',
                                keypresses: [
                                    {
                                        id: 'INS_UP',
                                        keystroke: 'Insert+Up'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation: "Role 'button' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "Name 'Mute' is conveyed"
                            },
                            {
                                priority: 1,
                                expectation: "State 'pressed' is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Mute' button, read information about the button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Mute' button, read information about the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'MjQyMeyIyIjoiMzEifQWExMm',
                    title:
                        'Operate a not pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-19-operate-not-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'operate not pressed toggle button',
                            title:
                                'Operate a not pressed toggle button in reading mode',
                            testId: 19,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the button\ntestPageDocument.querySelector('#toggle').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description: 'sets focus on the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation:
                                    "Change in state, to 'pressed', is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Mute' button, activate the button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Mute' button, activate the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'NDFiYeyIyIjoiMzEifQzg4MD',
                    title:
                        'Operate a not pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-20-operate-not-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'operate not pressed toggle button',
                            title:
                                'Operate a not pressed toggle button in interaction mode',
                            testId: 20,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusOnButton',
                                source:
                                    "// sets focus on the button\ntestPageDocument.querySelector('#toggle').focus();\n",
                                jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButton.module.js',
                                description: 'sets focus on the button'
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButton.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation:
                                    "Change in state, to 'pressed', is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Mute' button, activate the button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Mute' button, activate the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'M2RmNeyIyIjoiMzEifQzQ0MG',
                    title: 'Operate a pressed toggle button in reading mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-22-operate-pressed-toggle-button-reading-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'operate pressed toggle button',
                            title:
                                'Operate a pressed toggle button in reading mode',
                            testId: 22,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'reading',
                            setupScript: {
                                name: 'setFocusOnButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on the button, and sets its state to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\nbutton.focus();\n",
                                jsonpPath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on the button, and sets its state to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation:
                                    "Change in state, to 'not pressed', is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With the reading cursor on the 'Mute' button, activate the button.",
                            mode:
                                'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                            user: [
                                "With the reading cursor on the 'Mute' button, activate the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                },
                {
                    id: 'ODhlYeyIyIjoiMzEifQmVmMT',
                    title:
                        'Operate a pressed toggle button in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-23-operate-pressed-toggle-button-interaction-jaws.collected.html',
                    renderableContent: {
                        info: {
                            task: 'operate pressed toggle button',
                            title:
                                'Operate a pressed toggle button in interaction mode',
                            testId: 23,
                            references: [
                                {
                                    refId: 'example',
                                    value:
                                        'https://w3c.github.io/aria-practices/examples/button/button.html'
                                },
                                {
                                    refId: 'button',
                                    value: 'https://w3c.github.io/aria/#button'
                                },
                                {
                                    refId: 'aria-pressed',
                                    value:
                                        'https://w3c.github.io/aria/#aria-pressed'
                                }
                            ]
                        },
                        target: {
                            at: {
                                key: 'jaws',
                                raw: 'JAWS',
                                name: 'JAWS'
                            },
                            mode: 'interaction',
                            setupScript: {
                                name: 'setFocusOnButtonAndSetStateToPressed',
                                source:
                                    "// sets focus on the button, and sets its state to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\nbutton.focus();\n",
                                jsonpPath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.jsonp.js',
                                modulePath:
                                    'scripts/setFocusOnButtonAndSetStateToPressed.module.js',
                                description:
                                    "sets focus on the button, and sets its state to 'pressed'"
                            },
                            referencePage:
                                'reference/2022-4-8_135651/button.setFocusOnButtonAndSetStateToPressed.html'
                        },
                        commands: [
                            {
                                id: 'SPACE',
                                keystroke: 'Space',
                                keypresses: [
                                    {
                                        id: 'SPACE',
                                        keystroke: 'Space'
                                    }
                                ]
                            },
                            {
                                id: 'ENTER',
                                keystroke: 'Enter',
                                keypresses: [
                                    {
                                        id: 'ENTER',
                                        keystroke: 'Enter'
                                    }
                                ]
                            }
                        ],
                        assertions: [
                            {
                                priority: 1,
                                expectation:
                                    "Change in state, to 'not pressed', is conveyed"
                            }
                        ],
                        instructions: {
                            raw:
                                "With focus on the 'Mute' button, activate the button.",
                            mode:
                                'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                            user: [
                                "With focus on the 'Mute' button, activate the button."
                            ]
                        }
                    },
                    viewers: [
                        {
                            username: 'evmiguel'
                        }
                    ]
                }
            ],
            finalizedTestResults: [
                {
                    id: 'ZTQ5ZeyIxMiI6MX0DUyOD',
                    completedAt: '2022-09-28T18:34:18.944Z',
                    test: {
                        id: 'MTExZeyIyIjoiMzEifQWZhZG',
                        rowNumber: 1,
                        title:
                            'Navigate forwards to a not pressed toggle button in reading mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-01-navigate-forwards-to-not-pressed-toggle-button-reading-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task:
                                    'navigate forwards to not pressed toggle button',
                                title:
                                    'Navigate forwards to a not pressed toggle button in reading mode',
                                testId: 1,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/button/button.html'
                                    },
                                    {
                                        refId: 'button',
                                        value:
                                            'https://w3c.github.io/aria/#button'
                                    },
                                    {
                                        refId: 'aria-pressed',
                                        value:
                                            'https://w3c.github.io/aria/#aria-pressed'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'reading',
                                setupScript: {
                                    name: 'setFocusBeforeButton',
                                    source:
                                        "// sets focus on a link before the button\ntestPageDocument.querySelector('#beforelink').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusBeforeButton.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusBeforeButton.module.js',
                                    description:
                                        'sets focus on a link before the button'
                                },
                                referencePage:
                                    'reference/2022-4-8_135651/button.setFocusBeforeButton.html'
                            },
                            commands: [
                                {
                                    id: 'DOWN',
                                    keystroke: 'Down Arrow',
                                    keypresses: [
                                        {
                                            id: 'DOWN',
                                            keystroke: 'Down Arrow'
                                        }
                                    ]
                                },
                                {
                                    id: 'B',
                                    keystroke: 'B',
                                    keypresses: [
                                        {
                                            id: 'B',
                                            keystroke: 'B'
                                        }
                                    ]
                                },
                                {
                                    id: 'F',
                                    keystroke: 'F',
                                    keypresses: [
                                        {
                                            id: 'F',
                                            keystroke: 'F'
                                        }
                                    ]
                                },
                                {
                                    id: 'TAB',
                                    keystroke: 'Tab',
                                    keypresses: [
                                        {
                                            id: 'TAB',
                                            keystroke: 'Tab'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'button' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Name 'Mute' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation:
                                        "State 'not pressed' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With the reading cursor on the 'Navigate forwards from here' link, navigate to the 'Mute' button.",
                                mode:
                                    'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                                user: [
                                    "With the reading cursor on the 'Navigate forwards from here' link, navigate to the 'Mute' button."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'MzdiNeyIxMyI6IlpUUTVaZXlJeE1pSTZNWDBEVXlPRCJ9GI5OW',
                            scenario: {
                                commands: [
                                    {
                                        id: 'DOWN',
                                        text: 'Down Arrow'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'NGRkYeyIxNCI6Ik16ZGlOZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOUdJNU9XIn0TUxYT',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'OWQ2MeyIxNCI6Ik16ZGlOZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOUdJNU9XIn0mQwZm',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZDliZeyIxNCI6Ik16ZGlOZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOUdJNU9XIn0mQ4Yj',
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'OGY3ZeyIxMyI6IlpUUTVaZXlJeE1pSTZNWDBEVXlPRCJ9DNlMm',
                            scenario: {
                                commands: [
                                    {
                                        id: 'B',
                                        text: 'B'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'OTA0ZeyIxNCI6Ik9HWTNaZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOURObE1tIn0jA2M2',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ODEyMeyIxNCI6Ik9HWTNaZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOURObE1tIn0ThmNG',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'MzM4MeyIxNCI6Ik9HWTNaZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOURObE1tIn0jUyNG',
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'MjRmMeyIxMyI6IlpUUTVaZXlJeE1pSTZNWDBEVXlPRCJ9GViNG',
                            scenario: {
                                commands: [
                                    {
                                        id: 'F',
                                        text: 'F'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'OTE4ZeyIxNCI6Ik1qUm1NZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOUdWaU5HIn0DhhNG',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'MDA3NeyIxNCI6Ik1qUm1NZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOUdWaU5HIn0TdhMm',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'NDY4OeyIxNCI6Ik1qUm1NZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOUdWaU5HIn0GEzZT',
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'ZDBmMeyIxMyI6IlpUUTVaZXlJeE1pSTZNWDBEVXlPRCJ9zNhN2',
                            scenario: {
                                commands: [
                                    {
                                        id: 'TAB',
                                        text: 'Tab'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'ODk5NeyIxNCI6IlpEQm1NZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOXpOaE4yIn02MwMT',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'MjkxOeyIxNCI6IlpEQm1NZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOXpOaE4yIn0GI2MD',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ODA1NeyIxNCI6IlpEQm1NZXlJeE15STZJbHBVVVRWYVpYbEplRTFwU1RaTldEQkVWWGxQUkNKOXpOaE4yIn0DZjYT',
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                },
                {
                    id: 'MTU1NeyIxMiI6MX0zU1Nj',
                    completedAt: '2022-09-28T18:34:19.281Z',
                    test: {
                        id: 'MWZiZeyIyIjoiMzEifQjhhYz',
                        rowNumber: 8,
                        title:
                            'Navigate backwards to a pressed toggle button in reading mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-08-navigate-backwards-to-pressed-toggle-button-reading-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task:
                                    'navigate backwards to pressed toggle button',
                                title:
                                    'Navigate backwards to a pressed toggle button in reading mode',
                                testId: 8,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/button/button.html'
                                    },
                                    {
                                        refId: 'button',
                                        value:
                                            'https://w3c.github.io/aria/#button'
                                    },
                                    {
                                        refId: 'aria-pressed',
                                        value:
                                            'https://w3c.github.io/aria/#aria-pressed'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'reading',
                                setupScript: {
                                    name:
                                        'setFocusAfterButtonAndSetStateToPressed',
                                    source:
                                        "// sets focus on a link after the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#afterlink').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusAfterButtonAndSetStateToPressed.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusAfterButtonAndSetStateToPressed.module.js',
                                    description:
                                        "sets focus on a link after the button, and sets the state of the button to 'pressed'"
                                },
                                referencePage:
                                    'reference/2022-4-8_135651/button.setFocusAfterButtonAndSetStateToPressed.html'
                            },
                            commands: [
                                {
                                    id: 'UP',
                                    keystroke: 'Up Arrow',
                                    keypresses: [
                                        {
                                            id: 'UP',
                                            keystroke: 'Up Arrow'
                                        }
                                    ]
                                },
                                {
                                    id: 'SHIFT_B',
                                    keystroke: 'Shift+B',
                                    keypresses: [
                                        {
                                            id: 'SHIFT_B',
                                            keystroke: 'Shift+B'
                                        }
                                    ]
                                },
                                {
                                    id: 'SHIFT_F',
                                    keystroke: 'Shift+F',
                                    keypresses: [
                                        {
                                            id: 'SHIFT_F',
                                            keystroke: 'Shift+F'
                                        }
                                    ]
                                },
                                {
                                    id: 'SHIFT_TAB',
                                    keystroke: 'Shift+Tab',
                                    keypresses: [
                                        {
                                            id: 'SHIFT_TAB',
                                            keystroke: 'Shift+Tab'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'button' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Name 'Mute' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "State 'pressed' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With the reading cursor on the 'Navigate backwards from here' link, navigate to the 'Mute' button.",
                                mode:
                                    'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                                user: [
                                    "With the reading cursor on the 'Navigate backwards from here' link, navigate to the 'Mute' button."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'ZDczNeyIxMyI6Ik1UVTFOZXlJeE1pSTZNWDB6VTFOaiJ9DJlND',
                            scenario: {
                                commands: [
                                    {
                                        id: 'UP',
                                        text: 'Up Arrow'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'Yzk2NeyIxNCI6IlpEY3pOZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOURKbE5EIn0WUxNj',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'INCORRECT_OUTPUT'
                                },
                                {
                                    id:
                                        'MmJmZeyIxNCI6IlpEY3pOZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOURKbE5EIn0TFlZG',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'OWJlOeyIxNCI6IlpEY3pOZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOURKbE5EIn0GZhZG',
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'INCORRECT_OUTPUT'
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'ZmM2ZeyIxMyI6Ik1UVTFOZXlJeE1pSTZNWDB6VTFOaiJ9WE0OT',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SHIFT_B',
                                        text: 'Shift+B'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'MzQwNeyIxNCI6IlptTTJaZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOVdFME9UIn0zM1Mz',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'MTU0OeyIxNCI6IlptTTJaZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOVdFME9UIn0WM4MW',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZDgwYeyIxNCI6IlptTTJaZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOVdFME9UIn0mVlMT',
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'OTBlYeyIxMyI6Ik1UVTFOZXlJeE1pSTZNWDB6VTFOaiJ92JlNT',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SHIFT_F',
                                        text: 'Shift+F'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'N2UzOeyIxNCI6Ik9UQmxZZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOTJKbE5UIn0Tc3OT',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'OTc2NeyIxNCI6Ik9UQmxZZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOTJKbE5UIn0WRlNj',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZTczMeyIxNCI6Ik9UQmxZZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOTJKbE5UIn0WEwOG',
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'Zjg1OeyIxMyI6Ik1UVTFOZXlJeE1pSTZNWDB6VTFOaiJ9DI5MG',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SHIFT_TAB',
                                        text: 'Shift+Tab'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'NGJkOeyIxNCI6IlpqZzFPZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOURJNU1HIn0GZkNz',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'YzliMeyIxNCI6IlpqZzFPZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOURJNU1HIn0Tg5Mj',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZmFmOeyIxNCI6IlpqZzFPZXlJeE15STZJazFVVlRGT1pYbEplRTFwU1RaTldEQjZWVEZPYWlKOURJNU1HIn0TkzOT',
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                },
                {
                    id: 'Y2U4YeyIxMiI6MX02NlOT',
                    completedAt: '2022-09-28T18:34:19.389Z',
                    test: {
                        id: 'NmI4NeyIyIjoiMzEifQDU2OD',
                        rowNumber: 9,
                        title:
                            'Navigate forwards to a pressed toggle button in interaction mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-09-navigate-forwards-to-pressed-toggle-button-interaction-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task:
                                    'navigate forwards to pressed toggle button',
                                title:
                                    'Navigate forwards to a pressed toggle button in interaction mode',
                                testId: 9,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/button/button.html'
                                    },
                                    {
                                        refId: 'button',
                                        value:
                                            'https://w3c.github.io/aria/#button'
                                    },
                                    {
                                        refId: 'aria-pressed',
                                        value:
                                            'https://w3c.github.io/aria/#aria-pressed'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'interaction',
                                setupScript: {
                                    name:
                                        'setFocusBeforeButtonAndSetStateToPressed',
                                    source:
                                        "// sets focus on a link before the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#beforelink').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusBeforeButtonAndSetStateToPressed.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusBeforeButtonAndSetStateToPressed.module.js',
                                    description:
                                        "sets focus on a link before the button, and sets the state of the button to 'pressed'"
                                },
                                referencePage:
                                    'reference/2022-4-8_135651/button.setFocusBeforeButtonAndSetStateToPressed.html'
                            },
                            commands: [
                                {
                                    id: 'TAB',
                                    keystroke: 'Tab',
                                    keypresses: [
                                        {
                                            id: 'TAB',
                                            keystroke: 'Tab'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'button' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Name 'Mute' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "State 'pressed' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With focus on the 'Navigate forwards from here' link, navigate to the 'Mute' button.",
                                mode:
                                    'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                                user: [
                                    "With focus on the 'Navigate forwards from here' link, navigate to the 'Mute' button."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'YjFiOeyIxMyI6IlkyVTRZZXlJeE1pSTZNWDAyTmxPVCJ9GM4ND',
                            scenario: {
                                commands: [
                                    {
                                        id: 'TAB',
                                        text: 'Tab'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'ODg0ZeyIxNCI6IllqRmlPZXlJeE15STZJbGt5VlRSWlpYbEplRTFwU1RaTldEQXlUbXhQVkNKOUdNNE5EIn0GZiMD',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                },
                                {
                                    id:
                                        'YjliZeyIxNCI6IllqRmlPZXlJeE15STZJbGt5VlRSWlpYbEplRTFwU1RaTldEQXlUbXhQVkNKOUdNNE5EIn0DgwZj',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'Nzk4NeyIxNCI6IllqRmlPZXlJeE15STZJbGt5VlRSWlpYbEplRTFwU1RaTldEQXlUbXhQVkNKOUdNNE5EIn0DMxN2',
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                },
                {
                    id: 'ZmU0OeyIxMiI6MX0TY2MT',
                    completedAt: '2022-09-28T18:34:19.515Z',
                    test: {
                        id: 'YmExNeyIyIjoiMzEifQWE5Nj',
                        rowNumber: 10,
                        title:
                            'Navigate backwards to a pressed toggle button in interaction mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-10-navigate-backwards-to-pressed-toggle-button-interaction-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task:
                                    'navigate backwards to pressed toggle button',
                                title:
                                    'Navigate backwards to a pressed toggle button in interaction mode',
                                testId: 10,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/button/button.html'
                                    },
                                    {
                                        refId: 'button',
                                        value:
                                            'https://w3c.github.io/aria/#button'
                                    },
                                    {
                                        refId: 'aria-pressed',
                                        value:
                                            'https://w3c.github.io/aria/#aria-pressed'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'interaction',
                                setupScript: {
                                    name:
                                        'setFocusAfterButtonAndSetStateToPressed',
                                    source:
                                        "// sets focus on a link after the button, and sets the state of the button to 'pressed'\nlet button = testPageDocument.querySelector('#toggle');\nbutton.setAttribute('aria-pressed', 'true');\nbutton.querySelector('use').setAttribute('xlink:href', '#icon-sound');\ntestPageDocument.querySelector('#afterlink').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusAfterButtonAndSetStateToPressed.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusAfterButtonAndSetStateToPressed.module.js',
                                    description:
                                        "sets focus on a link after the button, and sets the state of the button to 'pressed'"
                                },
                                referencePage:
                                    'reference/2022-4-8_135651/button.setFocusAfterButtonAndSetStateToPressed.html'
                            },
                            commands: [
                                {
                                    id: 'SHIFT_TAB',
                                    keystroke: 'Shift+Tab',
                                    keypresses: [
                                        {
                                            id: 'SHIFT_TAB',
                                            keystroke: 'Shift+Tab'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'button' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Name 'Mute' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "State 'pressed' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With focus on the 'Navigate backwards from here' link, navigate to the 'Mute' button.",
                                mode:
                                    'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                                user: [
                                    "With focus on the 'Navigate backwards from here' link, navigate to the 'Mute' button."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'NjMyMeyIxMyI6IlptVTBPZXlJeE1pSTZNWDBUWTJNVCJ9zZkOT',
                            scenario: {
                                commands: [
                                    {
                                        id: 'SHIFT_TAB',
                                        text: 'Shift+Tab'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'NGE3NeyIxNCI6Ik5qTXlNZXlJeE15STZJbHB0VlRCUFpYbEplRTFwU1RaTldEQlVXVEpOVkNKOXpaa09UIn0mZkNj',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'MDY0OeyIxNCI6Ik5qTXlNZXlJeE15STZJbHB0VlRCUFpYbEplRTFwU1RaTldEQlVXVEpOVkNKOXpaa09UIn0WM5OT',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZmNlOeyIxNCI6Ik5qTXlNZXlJeE15STZJbHB0VlRCUFpYbEplRTFwU1RaTldEQlVXVEpOVkNKOXpaa09UIn0TZjZm',
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: [
                                {
                                    id: 'OTHER',
                                    text: 'Other',
                                    otherUnexpectedBehaviorText:
                                        'Seeded other unexpected behavior'
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'NmI0YeyIxMiI6MX0zQxZG',
                    completedAt: '2022-09-28T18:34:19.633Z',
                    test: {
                        id: 'YzA3NeyIyIjoiMzEifQGZhYT',
                        rowNumber: 13,
                        title:
                            'Read information about a not pressed toggle button in reading mode',
                        renderedUrl:
                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/toggle-button/test-13-read-information-about-not-pressed-toggle-button-reading-jaws.collected.html',
                        renderableContent: {
                            info: {
                                task:
                                    'read information about not pressed toggle button',
                                title:
                                    'Read information about a not pressed toggle button in reading mode',
                                testId: 13,
                                references: [
                                    {
                                        refId: 'example',
                                        value:
                                            'https://w3c.github.io/aria-practices/examples/button/button.html'
                                    },
                                    {
                                        refId: 'button',
                                        value:
                                            'https://w3c.github.io/aria/#button'
                                    },
                                    {
                                        refId: 'aria-pressed',
                                        value:
                                            'https://w3c.github.io/aria/#aria-pressed'
                                    }
                                ]
                            },
                            target: {
                                at: {
                                    key: 'jaws',
                                    raw: 'JAWS',
                                    name: 'JAWS'
                                },
                                mode: 'reading',
                                setupScript: {
                                    name: 'setFocusOnButton',
                                    source:
                                        "// sets focus on the button\ntestPageDocument.querySelector('#toggle').focus();\n",
                                    jsonpPath:
                                        'scripts/setFocusOnButton.jsonp.js',
                                    modulePath:
                                        'scripts/setFocusOnButton.module.js',
                                    description: 'sets focus on the button'
                                },
                                referencePage:
                                    'reference/2022-4-8_135651/button.setFocusOnButton.html'
                            },
                            commands: [
                                {
                                    id: 'INS_TAB',
                                    keystroke: 'Insert+Tab',
                                    keypresses: [
                                        {
                                            id: 'INS_TAB',
                                            keystroke: 'Insert+Tab'
                                        }
                                    ]
                                },
                                {
                                    id: 'INS_UP',
                                    keystroke: 'Insert+Up',
                                    keypresses: [
                                        {
                                            id: 'INS_UP',
                                            keystroke: 'Insert+Up'
                                        }
                                    ]
                                }
                            ],
                            assertions: [
                                {
                                    priority: 1,
                                    expectation: "Role 'button' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation: "Name 'Mute' is conveyed"
                                },
                                {
                                    priority: 1,
                                    expectation:
                                        "State 'not pressed' is conveyed"
                                }
                            ],
                            instructions: {
                                raw:
                                    "With the reading cursor on the 'Mute' button, read information about the button.",
                                mode:
                                    'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                                user: [
                                    "With the reading cursor on the 'Mute' button, read information about the button."
                                ]
                            }
                        }
                    },
                    scenarioResults: [
                        {
                            id:
                                'MTI4NeyIxMyI6Ik5tSTBZZXlJeE1pSTZNWDB6UXhaRyJ9WUwOT',
                            scenario: {
                                commands: [
                                    {
                                        id: 'INS_TAB',
                                        text: 'Insert+Tab'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'NDQ5YeyIxNCI6Ik1USTROZXlJeE15STZJazV0U1RCWlpYbEplRTFwU1RaTldEQjZVWGhhUnlKOVdVd09UIn0jQwYW',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'M2YwMeyIxNCI6Ik1USTROZXlJeE15STZJazV0U1RCWlpYbEplRTFwU1RaTldEQjZVWGhhUnlKOVdVd09UIn0TNmNj',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'ZWE2YeyIxNCI6Ik1USTROZXlJeE15STZJazV0U1RCWlpYbEplRTFwU1RaTldEQjZVWGhhUnlKOVdVd09UIn02E5NT',
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        },
                        {
                            id:
                                'YmYxZeyIxMyI6Ik5tSTBZZXlJeE1pSTZNWDB6UXhaRyJ9DQ5Mj',
                            scenario: {
                                commands: [
                                    {
                                        id: 'INS_UP',
                                        text: 'Insert+Up'
                                    }
                                ]
                            },
                            output: 'automatically seeded sample output',
                            assertionResults: [
                                {
                                    id:
                                        'MTMwNeyIxNCI6IlltWXhaZXlJeE15STZJazV0U1RCWlpYbEplRTFwU1RaTldEQjZVWGhhUnlKOURRNU1qIn0DczND',
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'NjBmNeyIxNCI6IlltWXhaZXlJeE15STZJazV0U1RCWlpYbEplRTFwU1RaTldEQjZVWGhhUnlKOURRNU1qIn0TdiNG',
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    id:
                                        'NDAxZeyIxNCI6IlltWXhaZXlJeE15STZJazV0U1RCWlpYbEplRTFwU1RaTldEQjZVWGhhUnlKOURRNU1qIn0DM0OT',
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'button' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "Name 'Mute' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                },
                                {
                                    assertion: {
                                        text: "State 'not pressed' is conveyed"
                                    },
                                    passed: true,
                                    failedReason: null
                                }
                            ],
                            optionalAssertionResults: [],
                            unexpectedBehaviors: []
                        }
                    ]
                }
            ],
            draftTestPlanRuns: [
                {
                    tester: {
                        username: 'esmeralda-baggins'
                    },
                    testPlanReport: {
                        id: '1',
                        status: 'IN_REVIEW'
                    },
                    testResults: [
                        {
                            test: {
                                id: 'MTExZeyIyIjoiMzEifQWZhZG'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: '2022-09-28T18:34:18.944Z'
                        },
                        {
                            test: {
                                id: 'MzJkZeyIyIjoiMzEifQTAzMm'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: null
                        },
                        {
                            test: {
                                id: 'NDBjMeyIyIjoiMzEifQjc1NT'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: null
                        },
                        {
                            test: {
                                id: 'MjE2MeyIyIjoiMzEifQ2M0NW'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: null
                        },
                        {
                            test: {
                                id: 'MWZiZeyIyIjoiMzEifQjhhYz'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: '2022-09-28T18:34:19.281Z'
                        },
                        {
                            test: {
                                id: 'NmI4NeyIyIjoiMzEifQDU2OD'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: '2022-09-28T18:34:19.389Z'
                        },
                        {
                            test: {
                                id: 'YmExNeyIyIjoiMzEifQWE5Nj'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: '2022-09-28T18:34:19.515Z'
                        },
                        {
                            test: {
                                id: 'YzA3NeyIyIjoiMzEifQGZhYT'
                            },
                            atVersion: {
                                id: '1',
                                name: '2021.2111.13'
                            },
                            browserVersion: {
                                id: '2',
                                name: '99.0.4844.84'
                            },
                            completedAt: '2022-09-28T18:34:19.633Z'
                        }
                    ]
                }
            ]
        }
    ]
};

let candidateReportsDataNewRun = Object.assign(
    {},
    candidateReportsDataFirstRun
);

Default.parameters = {
    apolloClient: {
        // do not put MockedProvider here, you can, but its preferred to do it in preview.js
        mocks: [
            {
                request: {
                    query: ME_QUERY
                },
                result: {
                    data: {
                        me: {
                            id: '1',
                            username: 'evmiguel',
                            roles: ['VENDOR'],
                            vendor: {
                                at: 'JAWS',
                                vendorCompany: 'vispero'
                            }
                        }
                    }
                }
            },
            {
                request: {
                    query: ADD_VIEWER_MUTATION,
                    variables: {
                        testPlanVersionId: '1',
                        testId: 'NjgwYeyIyIjoiMSJ9zYxZT'
                    }
                },
                newData: () => {
                    switchCount++;
                    candidateReportsDataNewRun.testPlanReports[0].runnableTests[0].viewers = [
                        ...candidateReportsDataNewRun.testPlanReports[0]
                            .runnableTests[0].viewers,
                        { username: 'evmiguel' }
                    ];
                    candidateReportsDataNewRun.testPlanReports[1].runnableTests[0].viewers = [
                        ...candidateReportsDataNewRun.testPlanReports[1]
                            .runnableTests[0].viewers,
                        { username: 'evmiguel' }
                    ];
                    return {
                        data: { addViewer: { username: 'evmiguel' } }
                    };
                }
            },
            {
                request: {
                    query: ADD_VIEWER_MUTATION,
                    variables: {
                        testPlanVersionId: '1',
                        testId: 'MDllNeyIyIjoiMSJ9DY1NT'
                    }
                },
                newData: () => {
                    if (switchCount > 1) {
                        candidateReportsDataNewRun.testPlanReports[0].runnableTests[1].viewers = [
                            ...candidateReportsDataNewRun.testPlanReports[0]
                                .runnableTests[1].viewers,
                            { username: 'evmiguel' }
                        ];
                        candidateReportsDataNewRun.testPlanReports[1].runnableTests[1].viewers = [
                            ...candidateReportsDataNewRun.testPlanReports[1]
                                .runnableTests[1].viewers,
                            { username: 'evmiguel' }
                        ];
                    }
                    switchCount++;
                    return {
                        data: { addViewer: { username: 'evmiguel' } }
                    };
                }
            },
            {
                request: {
                    query: PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION,
                    variables: {
                        testReportId: '102'
                    }
                },
                newData: () => {
                    candidateReportsDataNewRun.testPlanReports[0].vendorReviewStatus =
                        'IN_PROGRESS';
                    return {
                        data: {
                            testPlanReport: {
                                promoteVendorReviewStatus: {
                                    testPlanReport: {
                                        vendorReviewStatus: 'IN_PROGRESS'
                                    }
                                }
                            }
                        }
                    };
                }
            },
            {
                request: {
                    query: PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION,
                    variables: {
                        testReportId: '101'
                    }
                },
                newData: () => {
                    candidateReportsDataNewRun.testPlanReports[1].vendorReviewStatus =
                        'IN_PROGRESS';
                    return {
                        data: {
                            testPlanReport: {
                                promoteVendorReviewStatus: {
                                    testPlanReport: {
                                        vendorReviewStatus: 'IN_PROGRESS'
                                    }
                                }
                            }
                        }
                    };
                }
            },
            {
                request: {
                    query: CANDIDATE_REPORTS_QUERY
                },
                newData: () => {
                    if (candidateReportsQueryCalled) {
                        return { data: candidateReportsDataNewRun };
                    } else {
                        candidateReportsQueryCalled = true;
                        return { data: candidateReportsDataFirstRun };
                    }
                }
            }
        ]
    }
};
