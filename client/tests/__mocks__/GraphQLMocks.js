import { TEST_QUEUE_PAGE_QUERY } from '../../components/TestQueue/queries';

export const TEST_QUEUE_PAGE_NOT_POPULATED_MOCK = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
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

export const TEST_QUEUE_PAGE_POPULATED_MOCK = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
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
                            testCount: 26,
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
                            testCount: 40,
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
                            testCount: 26,
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
                            testCount: 26,
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
                            testCount: 24,
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
                            testCount: 40,
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
                            testCount: 26,
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
                            testCount: 24,
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
                            testCount: 40,
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
                            testCount: 24,
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
