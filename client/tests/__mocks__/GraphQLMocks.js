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
                ats: [],
                browsers: [],
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
                testPlanVersions: [],
                testPlanReports: [],
                testPlans: []
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
                ats: [],
                browsers: [],
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
                testPlanVersions: [],
                testPlanReports: [],
                testPlans: []
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
                    id: '101',
                    username: 'alflennik',
                    roles: ['ADMIN', 'TESTER']
                },
                ats: [
                    {
                        id: '1',
                        name: 'JAWS',
                        atVersions: [
                            {
                                id: '6',
                                name: '2021.2103.174',
                                releasedAt: '2022-08-02T14:36:02.659Z'
                            }
                        ]
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            {
                                id: '5',
                                name: '2020.4',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '4',
                                name: '2020.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '3',
                                name: '2020.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '2',
                                name: '2020.1',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '1',
                                name: '2019.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '7',
                                name: '11.5.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
                    }
                ],
                browsers: [
                    {
                        id: '2',
                        name: 'Chrome'
                    },
                    {
                        id: '1',
                        name: 'Firefox'
                    },
                    {
                        id: '3',
                        name: 'Safari'
                    }
                ],
                users: [
                    {
                        id: '1',
                        username: 'esmeralda-baggins',
                        roles: ['TESTER', 'ADMIN']
                    },
                    { id: '2', username: 'tom-proudfeet', roles: ['TESTER'] },
                    {
                        id: '101',
                        username: 'alflennik',
                        roles: ['TESTER', 'ADMIN']
                    }
                ],
                testPlanVersions: [
                    {
                        id: '1',
                        title: 'Alert Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'alert'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'banner'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    }
                ],
                testPlanReports: [
                    {
                        id: '1',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        at: { id: '1', name: 'JAWS' },
                        browser: { id: '2', name: 'Chrome' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '1',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '2',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        at: { id: '3', name: 'VoiceOver for macOS' },
                        browser: { id: '3', name: 'Safari' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '1',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '3',
                        status: 'DRAFT',
                        conflictsLength: 3,
                        runnableTestsLength: 17,
                        at: { id: '2', name: 'NVDA' },
                        browser: { id: '1', name: 'Firefox' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '3',
                                tester: { id: '2', username: 'tom-proudfeet' },
                                testResultsLength: 3
                            },
                            {
                                id: '101',
                                tester: { id: '101', username: 'alflennik' },
                                testResultsLength: 1
                            },
                            {
                                id: '2',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResultsLength: 3
                            }
                        ]
                    }
                ],
                testPlans: []
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
                ats: [
                    {
                        id: '1',
                        name: 'JAWS',
                        atVersions: [
                            {
                                id: '6',
                                name: '2021.2103.174',
                                releasedAt: '2022-08-02T14:36:02.659Z'
                            }
                        ]
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            {
                                id: '5',
                                name: '2020.4',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '4',
                                name: '2020.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '3',
                                name: '2020.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '2',
                                name: '2020.1',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '1',
                                name: '2019.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '7',
                                name: '11.5.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
                    }
                ],
                browsers: [
                    {
                        id: '2',
                        name: 'Chrome'
                    },
                    {
                        id: '1',
                        name: 'Firefox'
                    },
                    {
                        id: '3',
                        name: 'Safari'
                    }
                ],
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
                testPlanVersions: [
                    {
                        id: '1',
                        title: 'Alert Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'alert'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'banner'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    }
                ],
                testPlanReports: [
                    {
                        id: '10',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        at: {
                            id: '2',
                            name: 'NVDA'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '65',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            gitMessage: 'The message for this SHA',
                            testPlan: {
                                directory: 'checkbox'
                            },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '18',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar'
                                },
                                testResultsLength: 0
                            },
                            {
                                id: '19',
                                tester: {
                                    id: '4',
                                    username: 'bar-foo'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '11',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        at: {
                            id: '2',
                            name: 'JAWS'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '65',
                            title: 'Checkbox Example (Two State)',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            gitMessage: 'The message for this SHA',
                            testPlan: {
                                directory: 'checkbox'
                            },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '20',
                                tester: {
                                    id: '5',
                                    username: 'boo-far'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '12',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 15,
                        at: {
                            id: '3',
                            name: 'VoiceOver for macOS'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '74',
                            title: 'Editor Menubar Example',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            gitMessage: 'The message for this SHA',
                            testPlan: {
                                directory: 'menubar-editor'
                            },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: []
                    }
                ],
                testPlans: []
            }
        }
    }
];
