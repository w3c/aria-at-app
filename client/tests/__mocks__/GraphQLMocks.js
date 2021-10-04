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
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3'
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
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3'
                        },
                        draftTestPlanRuns: []
                    }
                ]
            }
        }
    }
];
