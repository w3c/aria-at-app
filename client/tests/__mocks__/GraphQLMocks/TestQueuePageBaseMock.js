export default (
    testPlanReportAtBrowserQuery,
    initiatedByAutomationRunQuery
) => [
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
                        name: 'JAWS'
                    },
                    browser: {
                        id: '2',
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
                        name: 'NVDA'
                    },
                    browser: {
                        id: '1',
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
                        name: 'JAWS'
                    },
                    browser: {
                        id: '2',
                        name: 'Chrome'
                    }
                }
            }
        }
    },
    {
        request: {
            query: initiatedByAutomationRunQuery,
            variables: {
                testPlanVersionId: '1'
            }
        },
        result: {
            data: {
                testPlanVersion: {
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
                                id: '1'
                            },
                            browser: {
                                id: '2'
                            }
                        }
                    ]
                }
            }
        }
    }
];
