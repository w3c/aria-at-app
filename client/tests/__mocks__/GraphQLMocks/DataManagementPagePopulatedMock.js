export default (
  meQuery,
  dataManagementPageQuery,
  testPlanReportStatusDialogQuery
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
      query: dataManagementPageQuery
    },
    result: {
      data: {
        me: {
          id: '1',
          username: 'foo-bar',
          roles: ['ADMIN', 'TESTER']
        },
        ats: [
          {
            id: '1',
            key: 'jaws',
            name: 'JAWS',
            atVersions: [
              {
                id: '1',
                name: '2021.2111.13',
                releasedAt: '2021-11-01T04:00:00.000Z'
              }
            ],
            browsers: [
              {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
              },
              {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
              }
            ],
            candidateBrowsers: [{ id: '2' }],
            recommendedBrowsers: [{ id: '1' }, { id: '2' }]
          },
          {
            id: '2',
            key: 'nvda',
            name: 'NVDA',
            atVersions: [
              {
                id: '2',
                name: '2020.4',
                releasedAt: '2021-02-19T05:00:00.000Z'
              }
            ],
            browsers: [
              {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
              },
              {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
              }
            ],
            candidateBrowsers: [{ id: '2' }],
            recommendedBrowsers: [{ id: '1' }, { id: '2' }]
          },
          {
            id: '3',
            key: 'voiceover_macos',
            name: 'VoiceOver for macOS',
            atVersions: [
              {
                id: '3',
                name: '11.6 (20G165)',
                releasedAt: '2019-09-01T04:00:00.000Z'
              }
            ],
            browsers: [
              {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
              },
              {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
              },
              {
                id: '3',
                key: 'safari_macos',
                name: 'Safari'
              }
            ],
            candidateBrowsers: [{ id: '3' }],
            recommendedBrowsers: [{ id: '2' }, { id: '3' }]
          }
        ],
        testPlans: [
          {
            id: '1',
            directory: 'alert',
            title: 'Alert Example'
          }
        ],
        deprecatedTestPlanVersions: [],
        testPlanVersions: [
          {
            id: '1',
            title: 'Alert Example',
            phase: 'DRAFT',
            gitSha: '0928bcf530efcf4faa677285439701537674e014',
            gitMessage: 'Alert and Radiogroup/activedescendent updates (#865)',
            updatedAt: '2022-12-08T21:47:42.000Z',
            versionString: 'V22.12.08',
            draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
            candidatePhaseReachedAt: null,
            recommendedPhaseTargetDate: null,
            recommendedPhaseReachedAt: null,
            testPlan: {
              directory: 'alert'
            },
            testPlanReports: [
              {
                id: '7',
                metrics: {},
                markedFinalAt: null,
                isFinal: false,
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
                issues: [],
                draftTestPlanRuns: []
              }
            ],
            metadata: {}
          }
        ]
      }
    }
  },
  {
    request: {
      query: testPlanReportStatusDialogQuery,
      variables: { testPlanVersionId: '1' }
    },
    result: {
      data: {
        testPlanVersion: {
          id: '1',
          title: 'Alert Example',
          phase: 'DRAFT',
          gitSha: 'c665367f3742c2b607f7b3c2655782188b93f302',
          gitMessage:
            'Create updated tests for APG design pattern example: Alert (#685)',
          updatedAt: '2022-04-14T17:59:42.000Z',
          draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
          candidatePhaseReachedAt: null,
          recommendedPhaseTargetDate: null,
          recommendedPhaseReachedAt: null,
          testPlan: {
            directory: 'alert'
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
              testPlanReport: {
                id: '101',
                metrics: {},
                isFinal: false,
                markedFinalAt: null,
                issues: [],
                draftTestPlanRuns: []
              }
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
                key: 'chrome',
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
              testPlanReport: null
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
              testPlanReport: {
                id: '7',
                metrics: {},
                isFinal: false,
                markedFinalAt: null,
                issues: [],
                draftTestPlanRuns: []
              }
            }
          ]
        }
      }
    }
  }
];
