export const mockedTestPlanVersion = {
    id: '7',
    title: 'Select Only Combobox Example',
    phase: 'DRAFT',
    gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
    gitMessage: 'Generate html source script to support aria-at-app (#646)',
    updatedAt: '2022-03-17T18:34:51.000Z',
    draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
    candidatePhaseReachedAt: null,
    recommendedPhaseTargetDate: null,
    recommendedPhaseReachedAt: null,
    testPlan: {
        directory: 'combobox-select-only'
    },
    testPlanReportStatuses: [
        {
            isRequired: true,
            at: {
                id: '1',
                key: 'jaws',
                name: 'JAWS'
            },
            browser: {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
            },
            minimumAtVersion: {
                id: '1',
                name: '2021.2111.13'
            },
            exactAtVersion: null,
            testPlanReport: null
        },
        {
            isRequired: false,
            at: {
                id: '1',
                key: 'jaws',
                name: 'JAWS'
            },
            browser: {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
            },
            minimumAtVersion: {
                id: '1',
                name: '2021.2111.13'
            },
            exactAtVersion: null,
            testPlanReport: null
        },
        {
            isRequired: true,
            at: {
                id: '2',
                key: 'nvda',
                name: 'NVDA'
            },
            browser: {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
            },
            minimumAtVersion: {
                id: '2',
                name: '2020.4'
            },
            exactAtVersion: null,
            testPlanReport: null
        },
        {
            isRequired: false,
            at: {
                id: '2',
                key: 'nvda',
                name: 'NVDA'
            },
            browser: {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
            },
            minimumAtVersion: {
                id: '2',
                name: '2020.4'
            },
            exactAtVersion: null,
            testPlanReport: {
                id: '2',
                metrics: {
                    testsCount: 21,
                    mayFormatted: false,
                    supportLevel: 'FAILING',
                    commandsCount: 24,
                    mustFormatted: '118 of 122 passed',
                    conflictsCount: 3,
                    supportPercent: 97,
                    shouldFormatted: '34 of 36 passed',
                    testsFailedCount: 6,
                    testsPassedCount: 15,
                    mayAssertionsCount: 0,
                    mustAssertionsCount: 122,
                    assertionsFailedCount: 6,
                    assertionsPassedCount: 152,
                    shouldAssertionsCount: 36,
                    unexpectedBehaviorCount: 3,
                    mayAssertionsFailedCount: 0,
                    mayAssertionsPassedCount: 0,
                    mustAssertionsFailedCount: 4,
                    mustAssertionsPassedCount: 118,
                    shouldAssertionsFailedCount: 2,
                    shouldAssertionsPassedCount: 34,
                    unexpectedBehaviorsFormatted: '3 found',
                    severeImpactFailedAssertionCount: 1,
                    severeImpactPassedAssertionCount: 23,
                    moderateImpactFailedAssertionCount: 2,
                    moderateImpactPassedAssertionCount: 22
                },
                isFinal: false,
                markedFinalAt: null,
                issues: [
                    {
                        link: 'https://github.com/bocoup/aria-at/issues/128#issue-2157878584',
                        isOpen: true,
                        feedbackType: 'FEEDBACK'
                    }
                ],
                draftTestPlanRuns: [
                    {
                        tester: {
                            username: 'tom-proudfeet'
                        },
                        testPlanReport: {
                            id: '2'
                        },
                        testResults: [
                            {
                                test: {
                                    id: 'Nzg5NeyIyIjoiNyJ9zNjZj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.949Z'
                            },
                            {
                                test: {
                                    id: 'MmY0YeyIyIjoiNyJ9jRkZD'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.070Z'
                            },
                            {
                                test: {
                                    id: 'ZjUwNeyIyIjoiNyJ9mE2ZT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.180Z'
                            },
                            {
                                test: {
                                    id: 'MDNiMeyIyIjoiNyJ9Dk1MT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.292Z'
                            },
                            {
                                test: {
                                    id: 'MjRmNeyIyIjoiNyJ92MyMT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.406Z'
                            },
                            {
                                test: {
                                    id: 'ZmVlMeyIyIjoiNyJ9mUyYj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: null
                            },
                            {
                                test: {
                                    id: 'YWFiNeyIyIjoiNyJ9zE2Zj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.640Z'
                            },
                            {
                                test: {
                                    id: 'YjZkYeyIyIjoiNyJ9WIxZm'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.761Z'
                            },
                            {
                                test: {
                                    id: 'ZmIzMeyIyIjoiNyJ9TQ1NW'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:39.888Z'
                            },
                            {
                                test: {
                                    id: 'MmZkNeyIyIjoiNyJ9zIwN2'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.006Z'
                            },
                            {
                                test: {
                                    id: 'ZmQwOeyIyIjoiNyJ9DEzYz'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.122Z'
                            },
                            {
                                test: {
                                    id: 'MGViNeyIyIjoiNyJ9GQ3MT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.234Z'
                            },
                            {
                                test: {
                                    id: 'YTg5MeyIyIjoiNyJ9WEzOT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.355Z'
                            },
                            {
                                test: {
                                    id: 'NTRjMeyIyIjoiNyJ9zQ0OD'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.467Z'
                            },
                            {
                                test: {
                                    id: 'MjRlZeyIyIjoiNyJ9DcyY2'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.588Z'
                            },
                            {
                                test: {
                                    id: 'YWQzNeyIyIjoiNyJ9mE2Nm'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.712Z'
                            },
                            {
                                test: {
                                    id: 'OTYxOeyIyIjoiNyJ9TdmYj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.826Z'
                            },
                            {
                                test: {
                                    id: 'MjgzNeyIyIjoiNyJ9TZjNz'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:40.948Z'
                            },
                            {
                                test: {
                                    id: 'NWNiZeyIyIjoiNyJ9jI2MD'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:41.075Z'
                            }
                        ]
                    },
                    {
                        tester: {
                            username: 'esmeralda-baggins'
                        },
                        testPlanReport: {
                            id: '2'
                        },
                        testResults: [
                            {
                                test: {
                                    id: 'Nzg5NeyIyIjoiNyJ9zNjZj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:36.666Z'
                            },
                            {
                                test: {
                                    id: 'MmY0YeyIyIjoiNyJ9jRkZD'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:36.793Z'
                            },
                            {
                                test: {
                                    id: 'ZjUwNeyIyIjoiNyJ9mE2ZT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:36.914Z'
                            },
                            {
                                test: {
                                    id: 'MDNiMeyIyIjoiNyJ9Dk1MT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.031Z'
                            },
                            {
                                test: {
                                    id: 'MjRmNeyIyIjoiNyJ92MyMT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.150Z'
                            },
                            {
                                test: {
                                    id: 'ZmVlMeyIyIjoiNyJ9mUyYj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: null
                            },
                            {
                                test: {
                                    id: 'YWFiNeyIyIjoiNyJ9zE2Zj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.384Z'
                            },
                            {
                                test: {
                                    id: 'YjZkYeyIyIjoiNyJ9WIxZm'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.512Z'
                            },
                            {
                                test: {
                                    id: 'ZmIzMeyIyIjoiNyJ9TQ1NW'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.638Z'
                            },
                            {
                                test: {
                                    id: 'MmZkNeyIyIjoiNyJ9zIwN2'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.760Z'
                            },
                            {
                                test: {
                                    id: 'ZmQwOeyIyIjoiNyJ9DEzYz'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:37.883Z'
                            },
                            {
                                test: {
                                    id: 'MGViNeyIyIjoiNyJ9GQ3MT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.014Z'
                            },
                            {
                                test: {
                                    id: 'YTg5MeyIyIjoiNyJ9WEzOT'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.145Z'
                            },
                            {
                                test: {
                                    id: 'NTRjMeyIyIjoiNyJ9zQ0OD'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.268Z'
                            },
                            {
                                test: {
                                    id: 'MjRlZeyIyIjoiNyJ9DcyY2'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.382Z'
                            },
                            {
                                test: {
                                    id: 'YWQzNeyIyIjoiNyJ9mE2Nm'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.481Z'
                            },
                            {
                                test: {
                                    id: 'OTYxOeyIyIjoiNyJ9TdmYj'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.596Z'
                            },
                            {
                                test: {
                                    id: 'MjgzNeyIyIjoiNyJ9TZjNz'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.701Z'
                            },
                            {
                                test: {
                                    id: 'NWNiZeyIyIjoiNyJ9jI2MD'
                                },
                                atVersion: {
                                    id: '2',
                                    name: '2020.4'
                                },
                                browserVersion: {
                                    id: '1',
                                    name: '99.0.1'
                                },
                                completedAt: '2024-04-25T16:44:38.811Z'
                            }
                        ]
                    }
                ]
            }
        },
        {
            isRequired: true,
            at: {
                id: '3',
                key: 'voiceover_macos',
                name: 'VoiceOver for macOS'
            },
            browser: {
                id: '3',
                key: 'safari_macos',
                name: 'Safari'
            },
            minimumAtVersion: {
                id: '3',
                name: '11.6 (20G165)'
            },
            exactAtVersion: null,
            testPlanReport: null
        },
        {
            isRequired: false,
            at: {
                id: '3',
                key: 'voiceover_macos',
                name: 'VoiceOver for macOS'
            },
            browser: {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
            },
            minimumAtVersion: {
                id: '3',
                name: '11.6 (20G165)'
            },
            exactAtVersion: null,
            testPlanReport: null
        },
        {
            isRequired: false,
            at: {
                id: '3',
                key: 'voiceover_macos',
                name: 'VoiceOver for macOS'
            },
            browser: {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
            },
            minimumAtVersion: {
                id: '3',
                name: '11.6 (20G165)'
            },
            exactAtVersion: null,
            testPlanReport: null
        }
    ]
};

export default (
    meQuery,
    testPlanReportStatusDialogQuery,
    existingTestPlanReportsQuery
) => [
    {
        request: {
            query: meQuery
        },
        result: {
            data: {
                me: {
                    id: '1',
                    username: 'foo-bar',
                    roles: ['ADMIN', 'TESTER']
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportStatusDialogQuery,
            variables: { testPlanVersionId: '7' }
        },
        result: {
            data: {
                testPlanVersion: mockedTestPlanVersion
            }
        }
    },
    {
        request: {
            query: existingTestPlanReportsQuery,
            variables: {
                testPlanVersionId: '7',
                directory: 'combobox-select-only'
            }
        },
        result: {
            data: {
                existingTestPlanVersion: {
                    id: '7',
                    testPlanReports: [
                        {
                            id: '1',
                            markedFinalAt: '2021-01-01T00:00:00.000Z',
                            isFinal: true,
                            draftTestPlanRuns: {
                                initiatedByAutomation: true
                            },
                            at: {
                                id: '1',
                                key: 'jaws',
                                name: 'JAWS'
                            },
                            browser: {
                                id: '2',
                                key: 'firefox',
                                name: 'Firefox'
                            }
                        }
                    ]
                },
                oldTestPlanVersions: []
            }
        }
    }
];
