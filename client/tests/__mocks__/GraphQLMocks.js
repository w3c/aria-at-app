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
                        atVersions: ['2021.2103.174']
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            '2020.4',
                            '2020.3',
                            '2020.2',
                            '2020.1',
                            '2019.3'
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: ['11.5.2']
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
                        conflicts: [],
                        runnableTests: [
                            { id: 'NjgwYeyIyIjoiMSJ9zYxZT' },
                            { id: 'MDllNeyIyIjoiMSJ9DY1NT' },
                            { id: 'MWVkZeyIyIjoiMSJ9GI5Nm' },
                            { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                            { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                            { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                            { id: 'ZDNhNeyIyIjoiMSJ9mE0ND' },
                            { id: 'ODFkYeyIyIjoiMSJ9WE2ZD' },
                            { id: 'NGUwYeyIyIjoiMSJ9Tk3Nz' },
                            { id: 'YjdjYeyIyIjoiMSJ9mU5NW' },
                            { id: 'YzYwNeyIyIjoiMSJ9zIwZj' },
                            { id: 'M2U3OeyIyIjoiMSJ9DAxOT' },
                            { id: 'ZjFjZeyIyIjoiMSJ9Tg5Mj' },
                            { id: 'ZmU1ZeyIyIjoiMSJ9GFhMz' },
                            { id: 'OTE5NeyIyIjoiMSJ9jRiZm' },
                            { id: 'MjU2ZeyIyIjoiMSJ9jQ2YW' },
                            { id: 'NzhkZeyIyIjoiMSJ9jg4Ym' }
                        ],
                        testPlanTarget: {
                            id: '1',
                            title: 'JAWS 2021.2103.174 with Chrome 91.0.4472',
                            at: { id: '1', name: 'JAWS' },
                            browser: { id: '2', name: 'Chrome' },
                            atVersion: '2021.2103.174',
                            browserVersion: '91.0.4472'
                        },
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
                                testResults: [
                                    {
                                        id: 'M2M4MeyIxMiI6MX0ThmYT',
                                        test: { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'NTQ1MeyIxMiI6MX0DI1MT',
                                        test: { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZmZlNeyIxMiI6MX0jlmMT',
                                        test: { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZjM3OeyIxMiI6MX0GQ0Zj',
                                        test: { id: 'ZDNhNeyIyIjoiMSJ9mE0ND' },
                                        completedAt: null
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: '1',
                        status: 'DRAFT',
                        conflicts: [],
                        runnableTests: [
                            { id: 'NjgwYeyIyIjoiMSJ9zYxZT' },
                            { id: 'MDllNeyIyIjoiMSJ9DY1NT' },
                            { id: 'MWVkZeyIyIjoiMSJ9GI5Nm' },
                            { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                            { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                            { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                            { id: 'ZDNhNeyIyIjoiMSJ9mE0ND' },
                            { id: 'ODFkYeyIyIjoiMSJ9WE2ZD' },
                            { id: 'NGUwYeyIyIjoiMSJ9Tk3Nz' },
                            { id: 'YjdjYeyIyIjoiMSJ9mU5NW' },
                            { id: 'YzYwNeyIyIjoiMSJ9zIwZj' },
                            { id: 'M2U3OeyIyIjoiMSJ9DAxOT' },
                            { id: 'ZjFjZeyIyIjoiMSJ9Tg5Mj' },
                            { id: 'ZmU1ZeyIyIjoiMSJ9GFhMz' },
                            { id: 'OTE5NeyIyIjoiMSJ9jRiZm' },
                            { id: 'MjU2ZeyIyIjoiMSJ9jQ2YW' },
                            { id: 'NzhkZeyIyIjoiMSJ9jg4Ym' }
                        ],
                        testPlanTarget: {
                            id: '1',
                            title:
                                'VoiceOver for macOS 11.5.2 with Safari 14.1.2',
                            at: { id: '3', name: 'VoiceOver for macOS' },
                            browser: { id: '3', name: 'Safari' },
                            atVersion: '11.5.2',
                            browserVersion: '14.1.2'
                        },
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
                                testResults: [
                                    {
                                        id: 'M2M4MeyIxMiI6MX0ThmYT',
                                        test: { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'NTQ1MeyIxMiI6MX0DI1MT',
                                        test: { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZmZlNeyIxMiI6MX0jlmMT',
                                        test: { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZjM3OeyIxMiI6MX0GQ0Zj',
                                        test: { id: 'ZDNhNeyIyIjoiMSJ9mE0ND' },
                                        completedAt: null
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: '2',
                        status: 'DRAFT',
                        conflicts: [
                            {
                                source: {
                                    locationOfData: {
                                        assertionId:
                                            'MWJjNeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zNiZW'
                                    }
                                },
                                conflictingResults: [
                                    {
                                        locationOfData: {
                                            assertionResultId:
                                                'YTNjMeyIxNCI6Ik4yTmpPZXlJeE15STZJazVIVFhwUFpYbEplRTFwU1RaTk16QlhSbWxhYWlKOUdSbU1XIn0WY5Y2'
                                        }
                                    },
                                    {
                                        locationOfData: {
                                            assertionResultId:
                                                'YzUyZeyIxNCI6Ik5ERTRZZXlJeE15STZJazlYV1RGUFpYbEplRTFwU1RaTmJqQkhWbXhhUkNKOVdObVpEIn0GU0MT'
                                        }
                                    }
                                ]
                            },
                            {
                                source: {
                                    locationOfData: {
                                        scenarioId:
                                            'NzVjYeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9TNiMG'
                                    }
                                },
                                conflictingResults: [
                                    {
                                        locationOfData: {
                                            scenarioResultId:
                                                'ZTcwZeyIxMyI6Ik1XVTFNZXlJeE1pSTZNMzBEUmtaVCJ9DdiOD'
                                        }
                                    },
                                    {
                                        locationOfData: {
                                            scenarioResultId:
                                                'MjlkMeyIxMyI6Ik5XSmpNZXlJeE1pSTZNbjBURXlNVCJ92M5ZW'
                                        }
                                    }
                                ]
                            },
                            {
                                source: {
                                    locationOfData: {
                                        scenarioId:
                                            'NjM1MeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9mU4YW'
                                    }
                                },
                                conflictingResults: [
                                    {
                                        locationOfData: {
                                            scenarioResultId:
                                                'ZTRkYeyIxMyI6IlpqRXhOZXlJeE1pSTZNMzBUUmlOMiJ9jM1Yz'
                                        }
                                    },
                                    {
                                        locationOfData: {
                                            scenarioResultId:
                                                'YjQzNeyIxMyI6IllUZzRZZXlJeE1pSTZNbjBXSmlOMiJ9mYwZD'
                                        }
                                    }
                                ]
                            }
                        ],
                        runnableTests: [
                            { id: 'NjgwYeyIyIjoiMSJ9zYxZT' },
                            { id: 'MDllNeyIyIjoiMSJ9DY1NT' },
                            { id: 'MWVkZeyIyIjoiMSJ9GI5Nm' },
                            { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                            { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                            { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                            { id: 'ZDNhNeyIyIjoiMSJ9mE0ND' },
                            { id: 'ODFkYeyIyIjoiMSJ9WE2ZD' },
                            { id: 'NGUwYeyIyIjoiMSJ9Tk3Nz' },
                            { id: 'YjdjYeyIyIjoiMSJ9mU5NW' },
                            { id: 'YzYwNeyIyIjoiMSJ9zIwZj' },
                            { id: 'M2U3OeyIyIjoiMSJ9DAxOT' },
                            { id: 'ZjFjZeyIyIjoiMSJ9Tg5Mj' },
                            { id: 'ZmU1ZeyIyIjoiMSJ9GFhMz' },
                            { id: 'OTE5NeyIyIjoiMSJ9jRiZm' },
                            { id: 'MjU2ZeyIyIjoiMSJ9jQ2YW' },
                            { id: 'NzhkZeyIyIjoiMSJ9jg4Ym' }
                        ],
                        testPlanTarget: {
                            id: '2',
                            title: 'NVDA 2020.4 with Firefox 88.0.1',
                            at: { id: '2', name: 'NVDA' },
                            browser: { id: '1', name: 'Firefox' },
                            atVersion: '2020.4',
                            browserVersion: '88.0.1'
                        },
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
                                testResults: [
                                    {
                                        id: 'NGMzOeyIxMiI6M30WFiZj',
                                        test: { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                                        completedAt: '2021-09-21T14:10:56.262Z'
                                    },
                                    {
                                        id: 'MWU1MeyIxMiI6M30DRkZT',
                                        test: { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                                        completedAt: '2021-09-21T14:10:56.262Z'
                                    },
                                    {
                                        id: 'ZjExNeyIxMiI6M30TRiN2',
                                        test: { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                                        completedAt: '2021-09-21T14:10:56.262Z'
                                    },
                                    {
                                        id: 'ZGM2NeyIxMiI6M30DVkZT',
                                        test: { id: 'NjgwYeyIyIjoiMSJ9zYxZT' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'Y2JkZeyIxMiI6M30jFiZm',
                                        test: { id: 'MDllNeyIyIjoiMSJ9DY1NT' },
                                        completedAt: null
                                    }
                                ]
                            },
                            {
                                id: '101',
                                tester: { id: '101', username: 'alflennik' },
                                testResults: [
                                    {
                                        id: 'NzUwYeyIxMiI6MTAxfQWRhM2',
                                        test: { id: 'NjgwYeyIyIjoiMSJ9zYxZT' },
                                        completedAt: '2021-10-05T17:51:42.794Z'
                                    },
                                    {
                                        id: 'MTBlYeyIxMiI6MTAxfQzE0ZD',
                                        test: { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'YmUzYeyIxMiI6MTAxfQWNiMD',
                                        test: { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'Y2U1MeyIxMiI6MTAxfQWRhOT',
                                        test: { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'ZWYwMeyIxMiI6MTAxfQjg4Y2',
                                        test: { id: 'MDllNeyIyIjoiMSJ9DY1NT' },
                                        completedAt: null
                                    },
                                    {
                                        id: 'MGQ4OeyIxMiI6MTAxfQDIwZj',
                                        test: { id: 'MWVkZeyIyIjoiMSJ9GI5Nm' },
                                        completedAt: null
                                    }
                                ]
                            },
                            {
                                id: '2',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResults: [
                                    {
                                        id: 'OWY1OeyIxMiI6Mn0GVlZD',
                                        test: { id: 'ZDBiOeyIyIjoiMSJ9WZiYT' },
                                        completedAt: '2021-09-21T14:10:56.262Z'
                                    },
                                    {
                                        id: 'NWJjMeyIxMiI6Mn0TEyMT',
                                        test: { id: 'MGZkYeyIyIjoiMSJ9TgxZD' },
                                        completedAt: '2021-09-21T14:10:56.262Z'
                                    },
                                    {
                                        id: 'YTg4YeyIxMiI6Mn0WJiN2',
                                        test: { id: 'Mjk0MeyIyIjoiMSJ9jQyOG' },
                                        completedAt: '2021-09-21T14:10:56.262Z'
                                    },
                                    {
                                        id: 'MWQ3MeyIxMiI6Mn0TExYj',
                                        test: { id: 'NjgwYeyIyIjoiMSJ9zYxZT' },
                                        completedAt: null
                                    }
                                ]
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
                        atVersions: ['2021.2103.174']
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            '2020.4',
                            '2020.3',
                            '2020.2',
                            '2020.1',
                            '2019.3'
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: ['11.5.2']
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
