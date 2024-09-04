export default testQueuePageQuery => [
  {
    request: {
      query: testQueuePageQuery
    },
    result: {
      data: {
        me: {
          __typename: 'User',
          id: '1',
          username: 'foo-bar',
          roles: ['ADMIN', 'TESTER'],
          company: {
            id: '1',
            name: 'Company',
            ats: []
          }
        },
        users: [
          {
            __typename: 'User',
            id: '1',
            username: 'foo-bar',
            roles: ['ADMIN', 'TESTER'],
            isBot: false,
            ats: [],
            company: {
              id: '1',
              name: 'Company',
              ats: []
            }
          },
          {
            __typename: 'User',
            id: '4',
            username: 'bar-foo',
            roles: ['TESTER'],
            isBot: false,
            ats: [],
            company: {
              id: '1',
              name: 'Company',
              ats: []
            }
          },
          {
            __typename: 'User',
            id: '5',
            username: 'boo-far',
            roles: ['TESTER'],
            isBot: false,
            ats: [],
            company: {
              id: '1',
              name: 'Company',
              ats: []
            }
          }
        ],
        ats: [],
        testPlans: [],
        testPlanVersions: [],
        testPlanReports: []
      }
    }
  }
];
