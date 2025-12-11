export default (testQueuePageQuery, meQuery) => [
  {
    request: {
      query: meQuery
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
        }
      }
    }
  },
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
        testPlans: [
          {
            __typename: 'TestPlan',
            id: '1',
            directory: 'alert',
            title: 'Alert Example',
            testPlanVersions: [
              {
                __typename: 'TestPlanVersion',
                id: '1',
                title: 'Alert Example',
                phase: 'RECOMMENDED',
                versionString: 'V22.05.04',
                updatedAt: '2022-05-04T00:00:00Z',
                draftPhaseReachedAt: null,
                candidatePhaseReachedAt: null,
                recommendedPhaseReachedAt: '2022-05-04T00:00:00Z',
                recommendedPhaseTargetDate: null,
                deprecatedAt: null,
                testPlanReports: []
              }
            ]
          }
        ],
        testPlanVersions: [],
        testPlanReports: []
      }
    }
  }
];
