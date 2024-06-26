export default testQueuePageQuery => [
  {
    request: {
      query: testQueuePageQuery
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
            isBot: false,
            ats: [],
            __typename: 'User'
          },
          {
            id: '4',
            username: 'bar-foo',
            roles: ['TESTER'],
            isBot: false,
            ats: [],
            __typename: 'User'
          },
          {
            id: '5',
            username: 'boo-far',
            roles: ['TESTER'],
            isBot: false,
            ats: [],
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
