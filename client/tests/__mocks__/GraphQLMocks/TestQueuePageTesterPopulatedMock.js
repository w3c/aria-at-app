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
                id: '3',
                key: 'safari_macos',
                name: 'Safari'
              },
              {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
              },
              {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
              }
            ],
            candidateBrowsers: [
              {
                id: '2',
                name: 'Chrome'
              }
            ],
            recommendedBrowsers: [
              {
                id: '1',
                name: 'Firefox'
              },
              {
                id: '2',
                name: 'Chrome'
              }
            ]
          },
          {
            id: '2',
            key: 'nvda',
            name: 'NVDA',
            atVersions: [
              {
                id: '5',
                name: '2020.4',
                releasedAt: '2022-01-01T12:00:00.000Z'
              },
              {
                id: '4',
                name: '2020.3',
                releasedAt: '2022-01-01T12:00:00.000Z'
              },
              {
                id: '3',
                name: '2020.2',
                releasedAt: '2022-01-01T12:00:00.000Z'
              },
              {
                id: '2',
                name: '2020.1',
                releasedAt: '2022-01-01T12:00:00.000Z'
              },
              {
                id: '1',
                name: '2019.3',
                releasedAt: '2022-01-01T12:00:00.000Z'
              }
            ],
            browsers: [
              {
                id: '3',
                key: 'safari_macos',
                name: 'Safari'
              },
              {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
              },
              {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
              }
            ],
            candidateBrowsers: [
              {
                id: '2',
                name: 'Chrome'
              }
            ],
            recommendedBrowsers: [
              {
                id: '1',
                name: 'Firefox'
              },
              {
                id: '2',
                name: 'Chrome'
              }
            ]
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
                id: '3',
                key: 'safari_macos',
                name: 'Safari'
              },
              {
                id: '1',
                key: 'firefox',
                name: 'Firefox'
              },
              {
                id: '2',
                key: 'chrome',
                name: 'Chrome'
              }
            ],
            candidateBrowsers: [
              {
                id: '3',
                name: 'Safari'
              }
            ],
            recommendedBrowsers: [
              {
                id: '3',
                name: 'Safari'
              },
              {
                id: '2',
                name: 'Chrome'
              }
            ]
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
        testPlanVersions: [
          {
            id: '1',
            title: 'Alert Example',
            phase: 'DRAFT',
            gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
            gitMessage:
              'Create tests for APG design pattern example: Navigation Menu Button (#524)',
            testPlan: {
              directory: 'alert'
            },
            updatedAt: '2022-04-15T19:09:53.000Z'
          },
          {
            id: '2',
            title: 'Banner Landmark',
            phase: 'DRAFT',
            gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
            gitMessage:
              'Create tests for APG design pattern example: Navigation Menu Button (#524)',
            testPlan: {
              directory: 'banner'
            },
            updatedAt: '2022-04-15T19:09:53.000Z'
          },
          {
            id: '3',
            title: 'Breadcrumb Example',
            phase: 'DRAFT',
            gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
            gitMessage:
              'Create tests for APG design pattern example: Navigation Menu Button (#524)',
            testPlan: {
              directory: 'breadcrumb'
            },
            updatedAt: '2022-04-15T19:09:53.000Z'
          }
        ],
        testPlanReports: [
          {
            id: '10',
            status: 'DRAFT',
            conflictsLength: 0,
            runnableTestsLength: 17,
            markedFinalAt: null,
            at: {
              id: '2',
              key: 'nvda',
              name: 'NVDA'
            },
            minimumAtVersion: { id: '1', name: '2024.3321.1' },
            exactAtVersion: null,
            browser: {
              id: '1',
              key: 'firefox',
              name: 'Firefox'
            },
            testPlanVersion: {
              id: '65',
              title: 'Checkbox Example (Two State)',
              phase: 'DRAFT',
              gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
              gitMessage: 'The message for this SHA',
              testPlan: {
                directory: 'checkbox'
              },
              versionString: 'V21-11-30'
            },
            draftTestPlanRuns: [
              {
                id: '18',
                tester: {
                  id: '1',
                  username: 'foo-bar',
                  isBot: false
                },
                testResultsLength: 0,
                initiatedByAutomation: false
              },
              {
                id: '19',
                tester: {
                  id: '4',
                  username: 'bar-foo',
                  isBot: false
                },
                testResultsLength: 0,
                initiatedByAutomation: false
              }
            ]
          },
          {
            id: '11',
            status: 'DRAFT',
            conflictsLength: 0,
            runnableTestsLength: 17,
            markedFinalAt: null,
            at: {
              id: '2',
              key: 'jaws',
              name: 'JAWS'
            },
            minimumAtVersion: { id: '3', name: '14.5' },
            exactAtVersion: null,
            browser: {
              id: '1',
              key: 'firefox',
              name: 'Firefox'
            },
            testPlanVersion: {
              id: '65',
              title: 'Checkbox Example (Two State)',
              phase: 'DRAFT',
              gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
              gitMessage: 'The message for this SHA',
              testPlan: {
                directory: 'checkbox'
              },
              versionString: 'V21-11-30'
            },
            draftTestPlanRuns: [
              {
                id: '20',
                tester: {
                  id: '5',
                  username: 'boo-far',
                  isBot: false
                },
                testResultsLength: 0,
                initiatedByAutomation: false
              }
            ]
          },
          {
            id: '12',
            status: 'DRAFT',
            conflictsLength: 0,
            runnableTestsLength: 15,
            markedFinalAt: null,
            at: {
              id: '3',
              key: 'voiceover_macos',
              name: 'VoiceOver for macOS'
            },
            minimumAtVersion: null,
            exactAtVersion: { id: '2', name: '2024.2' },
            browser: {
              id: '1',
              key: 'firefox',
              name: 'Firefox'
            },
            testPlanVersion: {
              id: '74',
              title: 'Editor Menubar Example',
              phase: 'DRAFT',
              gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
              gitMessage: 'The message for this SHA',
              testPlan: {
                directory: 'menubar-editor'
              },
              versionString: 'V21-11-30'
            },
            draftTestPlanRuns: []
          }
        ],
        testPlans: []
      }
    }
  }
];
