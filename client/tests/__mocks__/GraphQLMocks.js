import { TEST_QUEUE_PAGE_QUERY } from '../../components/TestQueue/queries';

export const TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_ADMIN = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '1',
                    username: 'foo-bar',
                    roles: ['ADMIN', 'TESTER'],
                    __typename: 'User'
                },
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER']
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER']
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER']
                    }
                ],
                testPlanReports: []
            }
        }
    }
];

export const TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_TESTER = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '4',
                    username: 'bar-foo',
                    roles: ['TESTER'],
                    __typename: 'User'
                },
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER'],
                        __typename: 'User'
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER'],
                        __typename: 'User'
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER'],
                        __typename: 'User'
                    }
                ],
                testPlanReports: []
            }
        }
    }
];

export const TEST_QUEUE_PAGE_POPULATED_MOCK_ADMIN = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '1',
                    username: 'foo-bar',
                    roles: ['ADMIN', 'TESTER'],
                    __typename: 'User'
                },
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER'],
                        __typename: 'User'
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER'],
                        __typename: 'User'
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER'],
                        __typename: 'User'
                    }
                ],
                testPlanReports: [
                    {
                        id: '1',
                        status: 'IN_REVIEW',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '1',
                            title: 'NVDA 2020.4 with Chrome 91.0.4472',
                            at: {
                                id: '2',
                                name: 'NVDA',
                                __typename: 'At'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome',
                                __typename: 'Browser'
                            },
                            atVersion: '2020.4',
                            browserVersion: '91.0.4472',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'checkbox',
                            testCount: 17,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '35',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar',
                                    __typename: 'User'
                                },
                                testResultCount: 0,
                                testResults: [
                                    {
                                        index: 1,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 2,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 4,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 5,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 7,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 8,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 10,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 11,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 13,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 14,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 16,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 17,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 19,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 21,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 22,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 24,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 25,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    }
                                ],
                                __typename: 'TestPlanRun'
                            },
                            {
                                id: '34',
                                tester: {
                                    id: '4',
                                    username: 'bar-foo',
                                    __typename: 'User'
                                },
                                testResultCount: 0,
                                testResults: [
                                    {
                                        index: 1,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 2,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 4,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 5,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 7,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 8,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 10,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 11,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 13,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 14,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 16,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 17,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 19,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 21,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 22,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 24,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 25,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    }
                                ],
                                __typename: 'TestPlanRun'
                            }
                        ],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '6',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '2',
                            title: 'JAWS 222.43 with Firefox 445.4',
                            at: {
                                id: '1',
                                name: 'JAWS',
                                __typename: 'At'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox',
                                __typename: 'Browser'
                            },
                            atVersion: '222.43',
                            browserVersion: '445.4',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '6',
                            title: 'Editor Menubar Example',
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'menubar-editor',
                            testCount: 25,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '3',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '2',
                            title: 'JAWS 222.43 with Firefox 445.4',
                            at: {
                                id: '1',
                                name: 'JAWS',
                                __typename: 'At'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox',
                                __typename: 'Browser'
                            },
                            atVersion: '222.43',
                            browserVersion: '445.4',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'checkbox',
                            testCount: 17,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '4',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '3',
                            title: 'NVDA 353 with Chrome 3434',
                            at: {
                                id: '2',
                                name: 'NVDA',
                                __typename: 'At'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome',
                                __typename: 'Browser'
                            },
                            atVersion: '353',
                            browserVersion: '3434',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'checkbox',
                            testCount: 17,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '33',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar',
                                    __typename: 'User'
                                },
                                testResultCount: 2,
                                testResults: [
                                    {
                                        index: 1,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 2,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 4,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 5,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 7,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 8,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 10,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 11,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 13,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 14,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 16,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 17,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 19,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 21,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 22,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 24,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 25,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    }
                                ],
                                __typename: 'TestPlanRun'
                            }
                        ],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '5',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '4',
                            title: 'JAWS 59053 with Chrome 3434',
                            at: {
                                id: '1',
                                name: 'JAWS',
                                __typename: 'At'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome',
                                __typename: 'Browser'
                            },
                            atVersion: '59053',
                            browserVersion: '3434',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '2',
                            title: null,
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'checkbox-tri-state',
                            testCount: 16,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '42',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar',
                                    __typename: 'User'
                                },
                                testResultCount: 0,
                                testResults: [
                                    {
                                        index: 1,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 2,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 3,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 4,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 7,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 8,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 10,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 11,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 13,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 14,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 16,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 17,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 19,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 20,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 21,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 22,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    }
                                ],
                                __typename: 'TestPlanRun'
                            },
                            {
                                id: '43',
                                tester: {
                                    id: '5',
                                    username: 'boo-far',
                                    __typename: 'User'
                                },
                                testResultCount: 0,
                                testResults: [
                                    {
                                        index: 1,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 2,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 3,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 4,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 7,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 8,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 10,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 11,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 13,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 14,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 16,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 17,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 19,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 20,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 21,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 22,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    }
                                ],
                                __typename: 'TestPlanRun'
                            }
                        ],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '8',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '5',
                            title: 'NVDA 2020.4 with Firefox 445.4',
                            at: {
                                id: '2',
                                name: 'NVDA',
                                __typename: 'At'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox',
                                __typename: 'Browser'
                            },
                            atVersion: '2020.4',
                            browserVersion: '445.4',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '6',
                            title: 'Editor Menubar Example',
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'menubar-editor',
                            testCount: 25,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '41',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar',
                                    __typename: 'User'
                                },
                                testResultCount: 0,
                                testResults: [
                                    {
                                        index: 1,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 2,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 3,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 4,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 6,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 7,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 9,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 11,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 13,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 15,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 17,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 19,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 21,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 23,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 24,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 26,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 27,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 29,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 30,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 32,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 33,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 35,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 36,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 38,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    },
                                    {
                                        index: 39,
                                        isComplete: false,
                                        isSkipped: false,
                                        __typename: 'TestResult'
                                    }
                                ],
                                __typename: 'TestPlanRun'
                            }
                        ],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '7',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '5',
                            title: 'NVDA 2020.4 with Firefox 445.4',
                            at: {
                                id: '2',
                                name: 'NVDA',
                                __typename: 'At'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox',
                                __typename: 'Browser'
                            },
                            atVersion: '2020.4',
                            browserVersion: '445.4',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '5',
                            title: null,
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'menu-button-actions-active-descendant',
                            testCount: 15,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '9',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '6',
                            title:
                                'VoiceOver for macOS macOS 10.14 with Safari 14.1',
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS',
                                __typename: 'At'
                            },
                            browser: {
                                id: '3',
                                name: 'Safari',
                                __typename: 'Browser'
                            },
                            atVersion: 'macOS 10.14',
                            browserVersion: '14.1',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '2',
                            title: null,
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'checkbox-tri-state',
                            testCount: 8,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '10',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '7',
                            title:
                                'VoiceOver for macOS 10.14 with Firefox 50.43',
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS',
                                __typename: 'At'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox',
                                __typename: 'Browser'
                            },
                            atVersion: '10.14',
                            browserVersion: '50.43',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '6',
                            title: 'Editor Menubar Example',
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'menubar-editor',
                            testCount: 15,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [],
                        __typename: 'TestPlanReport'
                    },
                    {
                        id: '11',
                        status: 'DRAFT',
                        conflictCount: 0,
                        testPlanTarget: {
                            id: '8',
                            title: 'JAWS Ok with Chrome 1000',
                            at: {
                                id: '1',
                                name: 'JAWS',
                                __typename: 'At'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome',
                                __typename: 'Browser'
                            },
                            atVersion: 'Ok',
                            browserVersion: '1000',
                            __typename: 'TestPlanTarget'
                        },
                        testPlanVersion: {
                            id: '2',
                            title: null,
                            gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                            gitMessage:
                                'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                            directory: 'checkbox-tri-state',
                            testCount: 16,
                            __typename: 'TestPlanVersion'
                        },
                        draftTestPlanRuns: [],
                        __typename: 'TestPlanReport'
                    }
                ]
            }
        }
    }
];

export const TEST_QUEUE_PAGE_POPULATED_MOCK_TESTER = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '4',
                    username: 'bar-foo',
                    roles: ['TESTER'],
                    __typename: 'User'
                },
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER']
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER']
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER']
                    }
                ],
                testPlanReports: [
                    {
                        id: '10',
                        status: 'DRAFT',
                        conflicts: [],
                        runnableTests: [
                            {
                                id: 'MmY4YeyIyIjoiNjUifQ2YxMz'
                            },
                            {
                                id: 'ZjM3NeyIyIjoiNjUifQzgxN2'
                            },
                            {
                                id: 'NjdlNeyIyIjoiNjUifQjA4ND'
                            },
                            {
                                id: 'Mzc2NeyIyIjoiNjUifQjAwNT'
                            },
                            {
                                id: 'NWNiNeyIyIjoiNjUifQDFlMz'
                            },
                            {
                                id: 'YWVhZeyIyIjoiNjUifQDNjOD'
                            },
                            {
                                id: 'ZmZmZeyIyIjoiNjUifQjI5OT'
                            },
                            {
                                id: 'ZTdmYeyIyIjoiNjUifQjEwMm'
                            },
                            {
                                id: 'ZjhlYeyIyIjoiNjUifQzRmYz'
                            },
                            {
                                id: 'YjQ1OeyIyIjoiNjUifQDUyZT'
                            },
                            {
                                id: 'NDNhZeyIyIjoiNjUifQmJmZm'
                            },
                            {
                                id: 'ZWE3OeyIyIjoiNjUifQTQyMG'
                            },
                            {
                                id: 'ZTE0YeyIyIjoiNjUifQjU1N2'
                            },
                            {
                                id: 'M2NjYeyIyIjoiNjUifQjRhZD'
                            },
                            {
                                id: 'Mjk3ZeyIyIjoiNjUifQTQyMD'
                            },
                            {
                                id: 'MDMzZeyIyIjoiNjUifQjY0M2'
                            },
                            {
                                id: 'YjNkMeyIyIjoiNjUifQGQwMG'
                            }
                        ],
                        testPlanTarget: {
                            id: '2',
                            title: 'NVDA 1 with Firefox 1',
                            at: {
                                id: '2',
                                name: 'NVDA'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            atVersion: '1',
                            browserVersion: '1'
                        },
                        testPlanVersion: {
                            id: '65',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            testPlan: {
                                directory: 'checkbox'
                            }
                        },
                        draftTestPlanRuns: [
                            {
                                id: '18',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar'
                                },
                                testResults: [
                                    {
                                        id: 'ZjhhMeyIxMiI6MTh9DFhND',
                                        test: {
                                            id: 'MmY4YeyIyIjoiNjUifQ2YxMz'
                                        },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZmFiZeyIxMiI6MTh9TBhMW',
                                        test: {
                                            id: 'ZjM3NeyIyIjoiNjUifQzgxN2'
                                        },
                                        completedAt: null
                                    },
                                    {
                                        id: 'M2ViOeyIxMiI6MTh9WQ0ND',
                                        test: {
                                            id: 'NjdlNeyIyIjoiNjUifQjA4ND'
                                        },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZDVhMeyIxMiI6MTh9zVkND',
                                        test: {
                                            id: 'Mzc2NeyIyIjoiNjUifQjAwNT'
                                        },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZTUzNeyIxMiI6MTh9zYwND',
                                        test: {
                                            id: 'NWNiNeyIyIjoiNjUifQDFlMz'
                                        },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZDNiYeyIxMiI6MTh9zYwNT',
                                        test: {
                                            id: 'YWVhZeyIyIjoiNjUifQDNjOD'
                                        },
                                        completedAt: null
                                    }
                                ]
                            },
                            {
                                id: '19',
                                tester: {
                                    id: '4',
                                    username: 'bar-foo'
                                },
                                testResults: []
                            }
                        ]
                    },
                    {
                        id: '11',
                        status: 'DRAFT',
                        conflicts: [],
                        runnableTests: [
                            {
                                id: 'MmY4YeyIyIjoiNjUifQ2YxMz'
                            },
                            {
                                id: 'ZjM3NeyIyIjoiNjUifQzgxN2'
                            },
                            {
                                id: 'NjdlNeyIyIjoiNjUifQjA4ND'
                            },
                            {
                                id: 'Mzc2NeyIyIjoiNjUifQjAwNT'
                            },
                            {
                                id: 'NWNiNeyIyIjoiNjUifQDFlMz'
                            },
                            {
                                id: 'YWVhZeyIyIjoiNjUifQDNjOD'
                            },
                            {
                                id: 'ZmZmZeyIyIjoiNjUifQjI5OT'
                            },
                            {
                                id: 'ZTdmYeyIyIjoiNjUifQjEwMm'
                            },
                            {
                                id: 'ZjhlYeyIyIjoiNjUifQzRmYz'
                            },
                            {
                                id: 'YjQ1OeyIyIjoiNjUifQDUyZT'
                            },
                            {
                                id: 'NDNhZeyIyIjoiNjUifQmJmZm'
                            },
                            {
                                id: 'ZWE3OeyIyIjoiNjUifQTQyMG'
                            },
                            {
                                id: 'ZTE0YeyIyIjoiNjUifQjU1N2'
                            },
                            {
                                id: 'M2NjYeyIyIjoiNjUifQjRhZD'
                            },
                            {
                                id: 'Mjk3ZeyIyIjoiNjUifQTQyMD'
                            },
                            {
                                id: 'MDMzZeyIyIjoiNjUifQjY0M2'
                            },
                            {
                                id: 'YjNkMeyIyIjoiNjUifQGQwMG'
                            }
                        ],
                        testPlanTarget: {
                            id: '2',
                            title: 'JAWS 1 with Firefox 1',
                            at: {
                                id: '2',
                                name: 'JAWS'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            atVersion: '1',
                            browserVersion: '1'
                        },
                        testPlanVersion: {
                            id: '65',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            testPlan: {
                                directory: 'checkbox'
                            }
                        },
                        draftTestPlanRuns: [
                            {
                                id: '20',
                                tester: {
                                    id: '5',
                                    username: 'boo-far'
                                },
                                testResults: []
                            }
                        ]
                    },
                    {
                        id: '12',
                        status: 'DRAFT',
                        conflicts: [],
                        runnableTests: [
                            {
                                id: 'MTk2NeyIyIjoiNzQifQTgyMT'
                            },
                            {
                                id: 'MzIwMeyIyIjoiNzQifQTA5ZW'
                            },
                            {
                                id: 'MmI0NeyIyIjoiNzQifQWYyZj'
                            },
                            {
                                id: 'YWJmMeyIyIjoiNzQifQWI1Nz'
                            },
                            {
                                id: 'ODNhYeyIyIjoiNzQifQmIyNG'
                            },
                            {
                                id: 'Nzg1ZeyIyIjoiNzQifQTI4YT'
                            },
                            {
                                id: 'ZDEzZeyIyIjoiNzQifQDhhMT'
                            },
                            {
                                id: 'NzRlNeyIyIjoiNzQifQGFmNj'
                            },
                            {
                                id: 'YWFiNeyIyIjoiNzQifQDU1ZT'
                            },
                            {
                                id: 'YzBiYeyIyIjoiNzQifQWE3MT'
                            },
                            {
                                id: 'Yzk2NeyIyIjoiNzQifQzdmZj'
                            },
                            {
                                id: 'Y2E5MeyIyIjoiNzQifQDRmZW'
                            },
                            {
                                id: 'YzE0NeyIyIjoiNzQifQDdhMz'
                            },
                            {
                                id: 'NGQ2NeyIyIjoiNzQifQjZkZm'
                            },
                            {
                                id: 'NjM1MeyIyIjoiNzQifQ2U3YT'
                            }
                        ],
                        testPlanTarget: {
                            id: '4',
                            title: 'VoiceOver for macOS 1 with Firefox 3',
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            atVersion: '1',
                            browserVersion: '3'
                        },
                        testPlanVersion: {
                            id: '74',
                            title: 'Editor Menubar Example',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            testPlan: {
                                directory: 'menubar-editor'
                            }
                        },
                        draftTestPlanRuns: []
                    }
                ]
            }
        }
    }
];
