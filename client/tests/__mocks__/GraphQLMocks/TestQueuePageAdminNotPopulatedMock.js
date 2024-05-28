export default testQueuePageQuery => [
    {
        request: {
            query: testQueuePageQuery
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
                        roles: ['ADMIN', 'TESTER'],
                        isBot: false,
                        ats: []
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER'],
                        isBot: false,
                        ats: []
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER'],
                        isBot: false,
                        ats: []
                    }
                ],
                testPlanVersions: [],
                testPlanReports: [],
                testPlans: []
            }
        }
    }
];
