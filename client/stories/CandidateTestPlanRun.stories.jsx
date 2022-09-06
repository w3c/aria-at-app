import React from 'react';
import CandidateTestPlanRun from '../components/CandidateTestPlanRun';
import { CANDIDATE_REPORTS_QUERY } from '../components/CandidateTestPlanRun/queries';
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
                    query: CANDIDATE_REPORTS_QUERY
                },
                result: {
                    data: {
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
                                issues: [
                                    {
                                        type: 'changes-requested',
                                        testNumber: '1'
                                    },
                                    {
                                        type: 'feedback',
                                        testNumber: '1'
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
                                    gitSha:
                                        '1aa3b74d24d340362e9f511eae33788d55487d12',
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
                                        title:
                                            'Trigger an alert in reading mode',
                                        renderedUrl:
                                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html'
                                    },
                                    {
                                        id: 'MDllNeyIyIjoiMSJ9DY1NT',
                                        title:
                                            'Trigger an alert in interaction mode',
                                        renderedUrl:
                                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html'
                                    }
                                ],
                                finalizedTestResults: [
                                    {
                                        id: 'ODljZeyIxMiI6MTAzfQjVmNW',
                                        completedAt: '2022-08-22T20:41:53.702Z',
                                        test: {
                                            id: 'NjgwYeyIyIjoiMSJ9zYxZT',
                                            rowNumber: 1,
                                            title:
                                                'Trigger an alert in reading mode',
                                            renderedUrl:
                                                '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
                                            renderableContent: {
                                                info: {
                                                    task: 'trigger alert',
                                                    title:
                                                        'Trigger an alert in reading mode',
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
                                                        name:
                                                            'setFocusOnButton',
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
                                                                keystroke:
                                                                    'Space'
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: 'ENTER',
                                                        keystroke: 'Enter',
                                                        keypresses: [
                                                            {
                                                                id: 'ENTER',
                                                                keystroke:
                                                                    'Enter'
                                                            }
                                                        ]
                                                    }
                                                ],
                                                assertions: [
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Role 'alert' is conveyed"
                                                    },
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Text 'Hello' is conveyed"
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
                                                    'NDUwZeyIxMyI6Ik9EbGpaZXlJeE1pSTZNVEF6ZlFqVm1OVyJ9GZlZT',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'SPACE',
                                                            text: 'Space'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Space',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'NzJmZeyIxNCI6Ik5EVXdaZXlJeE15STZJazlFYkdwYVpYbEplRTFwU1RaTlZFRjZabEZxVm0xT1Z5SjlHWmxaVCJ9TYwZm',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'ZTIzNeyIxNCI6Ik5EVXdaZXlJeE15STZJazlFYkdwYVpYbEplRTFwU1RaTlZFRjZabEZxVm0xT1Z5SjlHWmxaVCJ9zE1YT',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                                    'ZGU2MeyIxMyI6Ik9EbGpaZXlJeE1pSTZNVEF6ZlFqVm1OVyJ9mJmNT',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'ENTER',
                                                            text: 'Enter'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Enter',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'MTk2YeyIxNCI6IlpHVTJNZXlJeE15STZJazlFYkdwYVpYbEplRTFwU1RaTlZFRjZabEZxVm0xT1Z5SjltSm1OVCJ9jZjMW',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'ODgxZeyIxNCI6IlpHVTJNZXlJeE15STZJazlFYkdwYVpYbEplRTFwU1RaTlZFRjZabEZxVm0xT1Z5SjltSm1OVCJ9TY5MT',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                        id: 'N2UxMeyIxMiI6MTAzfQGE0YT',
                                        completedAt: '2022-08-22T20:42:10.297Z',
                                        test: {
                                            id: 'MDllNeyIyIjoiMSJ9DY1NT',
                                            rowNumber: 2,
                                            title:
                                                'Trigger an alert in interaction mode',
                                            renderedUrl:
                                                '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                                            renderableContent: {
                                                info: {
                                                    task: 'trigger alert',
                                                    title:
                                                        'Trigger an alert in interaction mode',
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
                                                        name:
                                                            'setFocusOnButton',
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
                                                                keystroke:
                                                                    'Space'
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: 'ENTER',
                                                        keystroke: 'Enter',
                                                        keypresses: [
                                                            {
                                                                id: 'ENTER',
                                                                keystroke:
                                                                    'Enter'
                                                            }
                                                        ]
                                                    }
                                                ],
                                                assertions: [
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Role 'alert' is conveyed"
                                                    },
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Text 'Hello' is conveyed"
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
                                                    'N2VjYeyIxMyI6Ik4yVXhNZXlJeE1pSTZNVEF6ZlFHRTBZVCJ9zI4M2',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'SPACE',
                                                            text: 'Space'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Space',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'MmIwMeyIxNCI6Ik4yVmpZZXlJeE15STZJazR5VlhoTlpYbEplRTFwU1RaTlZFRjZabEZIUlRCWlZDSjl6STRNMiJ9WU1OD',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'NGI2NeyIxNCI6Ik4yVmpZZXlJeE15STZJazR5VlhoTlpYbEplRTFwU1RaTlZFRjZabEZIUlRCWlZDSjl6STRNMiJ9mExZT',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                                    'MDU5ZeyIxMyI6Ik4yVXhNZXlJeE1pSTZNVEF6ZlFHRTBZVCJ9DhhZj',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'ENTER',
                                                            text: 'Enter'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Enter',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'MDU3NeyIxNCI6Ik1EVTVaZXlJeE15STZJazR5VlhoTlpYbEplRTFwU1RaTlZFRjZabEZIUlRCWlZDSjlEaGhaaiJ9WVmZT',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'NzJkOeyIxNCI6Ik1EVTVaZXlJeE15STZJazR5VlhoTlpYbEplRTFwU1RaTlZFRjZabEZIUlRCWlZDSjlEaGhaaiJ9WYwND',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                                    id: '6',
                                                    name: '15.4.0'
                                                },
                                                completedAt:
                                                    '2022-08-22T20:41:53.702Z'
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
                                                    id: '6',
                                                    name: '15.4.0'
                                                },
                                                completedAt:
                                                    '2022-08-22T20:42:10.297Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '101',
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
                                    gitSha:
                                        '1aa3b74d24d340362e9f511eae33788d55487d12',
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
                                        title:
                                            'Trigger an alert in reading mode',
                                        renderedUrl:
                                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html'
                                    },
                                    {
                                        id: 'MDllNeyIyIjoiMSJ9DY1NT',
                                        title:
                                            'Trigger an alert in interaction mode',
                                        renderedUrl:
                                            '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html'
                                    }
                                ],
                                finalizedTestResults: [
                                    {
                                        id: 'YTgxYeyIxMiI6MTA0fQzU4ZG',
                                        completedAt: '2022-08-23T14:08:02.483Z',
                                        test: {
                                            id: 'NjgwYeyIyIjoiMSJ9zYxZT',
                                            rowNumber: 1,
                                            title:
                                                'Trigger an alert in reading mode',
                                            renderedUrl:
                                                '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
                                            renderableContent: {
                                                info: {
                                                    task: 'trigger alert',
                                                    title:
                                                        'Trigger an alert in reading mode',
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
                                                        name:
                                                            'setFocusOnButton',
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
                                                                keystroke:
                                                                    'Space'
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: 'ENTER',
                                                        keystroke: 'Enter',
                                                        keypresses: [
                                                            {
                                                                id: 'ENTER',
                                                                keystroke:
                                                                    'Enter'
                                                            }
                                                        ]
                                                    }
                                                ],
                                                assertions: [
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Role 'alert' is conveyed"
                                                    },
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Text 'Hello' is conveyed"
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
                                                    'MjllMeyIxMyI6IllUZ3hZZXlJeE1pSTZNVEEwZlF6VTRaRyJ9zFhYz',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'SPACE',
                                                            text: 'Space'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Space',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'ZDNjOeyIxNCI6Ik1qbGxNZXlJeE15STZJbGxVWjNoWlpYbEplRTFwU1RaTlZFRXdabEY2VlRSYVJ5Sjl6RmhZeiJ9WVjZm',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'NGNiOeyIxNCI6Ik1qbGxNZXlJeE15STZJbGxVWjNoWlpYbEplRTFwU1RaTlZFRXdabEY2VlRSYVJ5Sjl6RmhZeiJ9ThkOW',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                                    'MTA5NeyIxMyI6IllUZ3hZZXlJeE1pSTZNVEEwZlF6VTRaRyJ9GIyM2',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'ENTER',
                                                            text: 'Enter'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Enter',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'MGVhOeyIxNCI6Ik1UQTVOZXlJeE15STZJbGxVWjNoWlpYbEplRTFwU1RaTlZFRXdabEY2VlRSYVJ5SjlHSXlNMiJ9WQ5Zj',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'Y2FmNeyIxNCI6Ik1UQTVOZXlJeE15STZJbGxVWjNoWlpYbEplRTFwU1RaTlZFRXdabEY2VlRSYVJ5SjlHSXlNMiJ9mI0OD',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                        id: 'ZWY1OeyIxMiI6MTA0fQDc1MT',
                                        completedAt: '2022-08-25T16:11:27.358Z',
                                        test: {
                                            id: 'MDllNeyIyIjoiMSJ9DY1NT',
                                            rowNumber: 2,
                                            title:
                                                'Trigger an alert in interaction mode',
                                            renderedUrl:
                                                '/aria-at/1aa3b74d24d340362e9f511eae33788d55487d12/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
                                            renderableContent: {
                                                info: {
                                                    task: 'trigger alert',
                                                    title:
                                                        'Trigger an alert in interaction mode',
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
                                                        name:
                                                            'setFocusOnButton',
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
                                                                keystroke:
                                                                    'Space'
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: 'ENTER',
                                                        keystroke: 'Enter',
                                                        keypresses: [
                                                            {
                                                                id: 'ENTER',
                                                                keystroke:
                                                                    'Enter'
                                                            }
                                                        ]
                                                    }
                                                ],
                                                assertions: [
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Role 'alert' is conveyed"
                                                    },
                                                    {
                                                        priority: 1,
                                                        expectation:
                                                            "Text 'Hello' is conveyed"
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
                                                    'M2Y0YeyIxMyI6IlpXWTFPZXlJeE1pSTZNVEEwZlFEYzFNVCJ9zIyNm',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'SPACE',
                                                            text: 'Space'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Space - different',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'MzllZeyIxNCI6Ik0yWTBZZXlJeE15STZJbHBYV1RGUFpYbEplRTFwU1RaTlZFRXdabEZFWXpGTlZDSjl6SXlObSJ9WE2NG',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'OTQyMeyIxNCI6Ik0yWTBZZXlJeE15STZJbHBYV1RGUFpYbEplRTFwU1RaTlZFRXdabEZFWXpGTlZDSjl6SXlObSJ9GZkNj',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                optionalAssertionResults: [],
                                                unexpectedBehaviors: [
                                                    {
                                                        id: 'SLUGGISH',
                                                        text:
                                                            'Screen reader became extremely sluggish',
                                                        otherUnexpectedBehaviorText: null
                                                    },
                                                    {
                                                        id: 'AT_CRASHED',
                                                        text:
                                                            'Screen reader crashed',
                                                        otherUnexpectedBehaviorText: null
                                                    },
                                                    {
                                                        id: 'BROWSER_CRASHED',
                                                        text: 'Browser crashed',
                                                        otherUnexpectedBehaviorText: null
                                                    }
                                                ]
                                            },
                                            {
                                                id:
                                                    'MjQxZeyIxMyI6IlpXWTFPZXlJeE1pSTZNVEEwZlFEYzFNVCJ9DhjZT',
                                                scenario: {
                                                    commands: [
                                                        {
                                                            id: 'ENTER',
                                                            text: 'Enter'
                                                        }
                                                    ]
                                                },
                                                output:
                                                    'JAWS output after Enter',
                                                assertionResults: [
                                                    {
                                                        id:
                                                            'NjgyMeyIxNCI6Ik1qUXhaZXlJeE15STZJbHBYV1RGUFpYbEplRTFwU1RaTlZFRXdabEZFWXpGTlZDSjlEaGpaVCJ92E4Nz',
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        id:
                                                            'YTYwYeyIxNCI6Ik1qUXhaZXlJeE15STZJbHBYV1RGUFpYbEplRTFwU1RaTlZFRXdabEZFWXpGTlZDSjlEaGpaVCJ9jY3Mz',
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    }
                                                ],
                                                requiredAssertionResults: [
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Role 'alert' is conveyed"
                                                        },
                                                        passed: true,
                                                        failedReason: null
                                                    },
                                                    {
                                                        assertion: {
                                                            text:
                                                                "Text 'Hello' is conveyed"
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
                                                    name: '104.0.0'
                                                },
                                                completedAt:
                                                    '2022-08-23T14:08:02.483Z'
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
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2022-08-25T16:11:27.358Z'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ]
    }
};
