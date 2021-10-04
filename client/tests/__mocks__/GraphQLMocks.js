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
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '18',
                                tester: {
                                    id: '1',
                                    username: 'howard-e'
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
                            }
                        ]
                    }
                ]
            }
        }
    }
];
