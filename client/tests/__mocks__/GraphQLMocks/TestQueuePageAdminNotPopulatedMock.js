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
