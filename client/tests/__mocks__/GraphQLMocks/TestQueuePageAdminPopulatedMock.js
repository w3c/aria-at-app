export default testQueuePageQuery => [
    {
        request: {
            query: testQueuePageQuery
        },
        result: {
            data: {
                me: {
                    id: '101',
                    username: 'alflennik',
                    roles: ['ADMIN', 'TESTER'],
                    isBot: false
                },
                ats: [
                    {
                        id: '1',
                        name: 'JAWS',
                        key: 'jaws',
                        atVersions: [
                            {
                                id: '1',
                                name: '2021.2111.13',
                                releasedAt: '2021-11-01T04:00:00.000Z'
                            }
                        ],
                        browsers: [
                            {
                                id: '3',
                                key: 'safari_macos',
                                name: 'Safari'
                            },
                            {
                                id: '1',
                                key: 'firefox',
                                name: 'Firefox'
                            },
                            {
                                id: '2',
                                key: 'chrome',
                                name: 'Chrome'
                            }
                        ],
                        candidateBrowsers: [
                            {
                                id: '2',
                                name: 'Chrome'
                            }
                        ],
                        recommendedBrowsers: [
                            {
                                id: '1',
                                name: 'Firefox'
                            },
                            {
                                id: '2',
                                name: 'Chrome'
                            }
                        ]
                    },
                    {
                        id: '2',
                        key: 'nvda',
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
                        ],
                        browsers: [
                            {
                                id: '3',
                                key: 'safari_macos',
                                name: 'Safari'
                            },
                            {
                                id: '1',
                                key: 'firefox',
                                name: 'Firefox'
                            },
                            {
                                id: '2',
                                key: 'chrome',
                                name: 'Chrome'
                            }
                        ],
                        candidateBrowsers: [
                            {
                                id: '2',
                                name: 'Chrome'
                            }
                        ],
                        recommendedBrowsers: [
                            {
                                id: '1',
                                name: 'Firefox'
                            },
                            {
                                id: '2',
                                name: 'Chrome'
                            }
                        ]
                    },
                    {
                        id: '3',
                        key: 'voiceover_macos',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '3',
                                name: '11.6 (20G165)',
                                releasedAt: '2019-09-01T04:00:00.000Z'
                            }
                        ],
                        browsers: [
                            {
                                id: '3',
                                key: 'safari_macos',
                                name: 'Safari'
                            },
                            {
                                id: '1',
                                key: 'firefox',
                                name: 'Firefox'
                            },
                            {
                                id: '2',
                                key: 'chrome',
                                name: 'Chrome'
                            }
                        ],
                        candidateBrowsers: [
                            {
                                id: '3',
                                name: 'Safari'
                            }
                        ],
                        recommendedBrowsers: [
                            {
                                id: '3',
                                name: 'Safari'
                            },
                            {
                                id: '2',
                                name: 'Chrome'
                            }
                        ]
                    }
                ],
                browsers: [
                    {
                        id: '2',
                        key: 'chrome',
                        name: 'Chrome'
                    },
                    {
                        id: '1',
                        key: 'firefox',
                        name: 'Firefox'
                    },
                    {
                        id: '3',
                        key: 'safari_macos',
                        name: 'Safari'
                    }
                ],
                users: [
                    {
                        id: '1',
                        username: 'esmeralda-baggins',
                        roles: ['TESTER', 'ADMIN'],
                        isBot: false,
                        ats: []
                    },
                    {
                        id: '2',
                        username: 'tom-proudfeet',
                        roles: ['TESTER'],
                        isBot: false,
                        ats: []
                    },
                    {
                        id: '101',
                        username: 'alflennik',
                        roles: ['TESTER', 'ADMIN'],
                        isBot: false,
                        ats: []
                    }
                ],
                testPlanVersions: [
                    {
                        id: '1',
                        title: 'Alert Example',
                        phase: 'DRAFT',
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
                        phase: 'DRAFT',
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
                        phase: 'DRAFT',
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
                        markedFinalAt: null,
                        at: { id: '1', name: 'JAWS', key: 'jaws' },
                        minimumAtVersion: { id: '1', name: '2024.3321.1' },
                        exactAtVersion: null,
                        browser: { id: '2', name: 'Chrome', key: 'chrome' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            versionString: 'V21.11.30'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '1',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins',
                                    isBot: false
                                },
                                testResultsLength: 0,
                                initiatedByAutomation: false
                            }
                        ]
                    },
                    {
                        id: '2',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        markedFinalAt: null,
                        at: {
                            id: '3',
                            name: 'VoiceOver for macOS',
                            key: 'voiceover_macos'
                        },
                        minimumAtVersion: { id: '3', name: '14.5' },
                        exactAtVersion: null,
                        browser: {
                            id: '3',
                            name: 'Safari',
                            key: 'safari_macos'
                        },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            versionString: 'V21.11.30'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '1',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins',
                                    isBot: false
                                },
                                testResultsLength: 0,
                                initiatedByAutomation: false
                            }
                        ]
                    },
                    {
                        id: '3',
                        status: 'DRAFT',
                        conflictsLength: 3,
                        runnableTestsLength: 17,
                        markedFinalAt: null,
                        at: { id: '2', name: 'NVDA', key: 'nvda' },
                        minimumAtVersion: null,
                        exactAtVersion: { id: '2', name: '2024.2' },
                        browser: { id: '1', name: 'Firefox', key: 'firefox' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            versionString: 'V21.11.30'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '3',
                                tester: {
                                    id: '2',
                                    username: 'tom-proudfeet',
                                    isBot: false
                                },
                                testResultsLength: 3,
                                initiatedByAutomation: false
                            },
                            {
                                id: '101',
                                tester: {
                                    id: '101',
                                    username: 'alflennik',
                                    isBot: false
                                },
                                testResultsLength: 1,
                                initiatedByAutomation: false
                            },
                            {
                                id: '2',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins',
                                    isBot: false
                                },
                                testResultsLength: 3,
                                initiatedByAutomation: false
                            }
                        ]
                    }
                ],
                testPlans: []
            }
        }
    }
];
