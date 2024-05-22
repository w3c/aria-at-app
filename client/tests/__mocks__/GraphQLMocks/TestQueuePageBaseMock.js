export default (testPlanReportAtBrowserQuery, existingTestPlanReportsQuery) => [
    {
        request: {
            query: testPlanReportAtBrowserQuery,
            variables: {
                testPlanReportId: '3'
            }
        },
        result: {
            data: {
                testPlanReport: {
                    id: '3',
                    at: {
                        id: '1',
                        key: 'jaws',
                        name: 'JAWS'
                    },
                    browser: {
                        id: '2',
                        key: 'chrome',
                        name: 'Chrome'
                    }
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportAtBrowserQuery,
            variables: {
                testPlanReportId: '2'
            }
        },
        result: {
            data: {
                testPlanReport: {
                    id: '2',
                    at: {
                        id: '2',
                        key: 'nvda',
                        name: 'NVDA'
                    },
                    browser: {
                        id: '1',
                        key: 'firefox',
                        name: 'Firefox'
                    }
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportAtBrowserQuery,
            variables: {
                testPlanReportId: '1'
            }
        },
        result: {
            data: {
                testPlanReport: {
                    id: '1',
                    at: {
                        id: '1',
                        key: 'jaws',
                        name: 'JAWS'
                    },
                    browser: {
                        id: '2',
                        key: 'chrome',
                        name: 'Chrome'
                    }
                }
            }
        }
    },
    {
        request: {
            query: existingTestPlanReportsQuery,
            variables: {
                testPlanVersionId: '1',
                directory: 'alert'
            }
        },
        result: {
            data: {
                existingTestPlanVersion: {
                    id: '1',
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
                                key: 'jaws'
                            },
                            browser: {
                                id: '2',
                                key: 'chrome'
                            }
                        }
                    ]
                },
                oldTestPlanVersions: []
            }
        }
    }
];
