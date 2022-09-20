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
            candidateStatusReachedAt: '2022-07-07T00:00:00.000Z',
            recommendedStatusTargetDate: '2023-03-13T00:00:00.000Z',
            vendorReviewStatus: 'READY',
            issues: [
                {
                    feedbackType: 'feedback',
                    testNumberFilteredByAt: 2
                },
                {
                    feedbackType: 'changes-requested',
                    testNumberFilteredByAt: 2
                }
            ],
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
                    viewers
                },
                {
                    id: 'MDllNeyIyIjoiMSJ9DY1NT',
                    title: 'Trigger an alert in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                    viewers
                }
            ],
            finalizedTestResults: [
                {
                    id: 'NzUwYeyIxMiI6MTAxfQWRhM2',
                    completedAt: '2022-09-12T16:06:23.674Z',
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
                    completedAt: '2022-09-12T16:06:38.523Z',
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
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                },
                                {
                                    id:
                                        'OWVlOeyIxNCI6IllqTTRaZXlJeE15STZJbHBYV1hkTlpYbEplRTFwU1RaTlZFRjRabEZxWnpSWk1pSjlEVTVORyJ9WI5Yj',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
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
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                },
                                {
                                    id:
                                        'ZDBmMeyIxNCI6Ik9XVm1aZXlJeE15STZJbHBYV1hkTlpYbEplRTFwU1RaTlZFRjRabEZxWnpSWk1pSjlHSTBaRCJ9GQ4OT',
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                }
                            ],
                            requiredAssertionResults: [
                                {
                                    assertion: {
                                        text: "Role 'alert' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
                                },
                                {
                                    assertion: {
                                        text: "Text 'Hello' is conveyed"
                                    },
                                    passed: false,
                                    failedReason: 'NO_OUTPUT'
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
                        status: 'FINALIZED'
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
                                name: '1'
                            },
                            completedAt: '2022-09-12T16:06:23.674Z'
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
                                name: '1'
                            },
                            completedAt: '2022-09-12T16:06:38.523Z'
                        }
                    ]
                }
            ]
        },
        {
            id: '101',
            candidateStatusReachedAt: '2022-07-07T00:00:00.000Z',
            recommendedStatusTargetDate: '2023-03-13T00:00:00.000Z',
            vendorReviewStatus: 'READY',
            issues: [
                {
                    feedbackType: 'feedback',
                    testNumberFilteredByAt: 2
                },
                {
                    feedbackType: 'changes-requested',
                    testNumberFilteredByAt: 2
                }
            ],
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
                    viewers
                },
                {
                    id: 'MDllNeyIyIjoiMSJ9DY1NT',
                    title: 'Trigger an alert in interaction mode',
                    renderedUrl:
                        '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                    viewers
                }
            ],
            finalizedTestResults: [
                {
                    id: 'NzlkYeyIxMiI6MTAyfQzllNj',
                    completedAt: '2022-09-12T16:07:07.524Z',
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
                            output: 'JAWS output after Space\n\n',
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
                            output: 'JAWS output after Enter\n\n',
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
                    completedAt: '2022-09-12T16:07:28.340Z',
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
                            output: 'JAWS output after Space\n\n',
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
                            output: 'JAWS output after Enter\n\n',
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
                        id: '101',
                        status: 'FINALIZED'
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
                                name: '105.0.0'
                            },
                            completedAt: '2022-09-12T16:07:07.524Z'
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
                                name: '105.0.0'
                            },
                            completedAt: '2022-09-12T16:07:28.340Z'
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
