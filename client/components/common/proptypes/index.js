import PropTypes from 'prop-types';

export const AtPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
});

export const AtVersionPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  releasedAt: PropTypes.string,
  supportedByAutomation: PropTypes.bool
});

export const AssertionResultPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  passed: PropTypes.bool.isRequired,
  assertion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    phrase: PropTypes.string,
    priority: PropTypes.string
  }).isRequired
});

export const BrowserPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
});

export const BrowserVersionPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
});

export const CollectionJobPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  status: PropTypes.oneOf([
    'QUEUED',
    'RUNNING',
    'CANCELLED',
    'COMPLETED',
    'ERROR'
  ]),
  externalLogsUrl: PropTypes.string,
  testStatus: PropTypes.arrayOf(
    PropTypes.shape({
      test: PropTypes.shape({
        id: PropTypes.string.isRequired
      }).isRequired,
      status: PropTypes.string.isRequired
    })
  )
});

export const IssuePropType = PropTypes.shape({
  __typename: PropTypes.string,
  link: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  feedbackType: PropTypes.string,
  isCandidateReview: PropTypes.bool,
  title: PropTypes.string,
  author: PropTypes.string,
  testNumberFilteredByAt: PropTypes.number,
  createdAt: PropTypes.string,
  closedAt: PropTypes.string
});

export const MePropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
});

export const ScenarioResultPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  output: PropTypes.string,
  scenario: PropTypes.shape({
    commands: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        atOperatingMode: PropTypes.string
      })
    ).isRequired
  }).isRequired,
  assertionResults: PropTypes.arrayOf(AssertionResultPropType),
  mustAssertionResults: PropTypes.arrayOf(AssertionResultPropType),
  shouldAssertionResults: PropTypes.arrayOf(AssertionResultPropType),
  mayAssertionResults: PropTypes.arrayOf(AssertionResultPropType),
  unexpectedBehaviors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      impact: PropTypes.string,
      details: PropTypes.string
    })
  )
});

export const TestPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  rowNumber: PropTypes.number,
  renderedUrl: PropTypes.string,
  testFormatVersion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ats: PropTypes.arrayOf(AtPropType),
  scenarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      at: AtPropType,
      commands: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired,
          atOperatingMode: PropTypes.string
        })
      )
    })
  ),
  assertions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      phrase: PropTypes.string,
      priority: PropTypes.string
    })
  )
});

export const TestPlanPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  directory: PropTypes.string
});

export const TestPlanReportPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  metrics: PropTypes.object,
  isFinal: PropTypes.bool,
  createdAt: PropTypes.string,
  markedFinalAt: PropTypes.string,
  conflictsLength: PropTypes.number,
  runnableTestsLength: PropTypes.number
});

export const TestPlanReportConflictPropType = PropTypes.shape({
  __typename: PropTypes.string,
  source: PropTypes.shape({
    test: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      rowNumber: PropTypes.number
    }).isRequired,
    scenario: PropTypes.shape({
      id: PropTypes.string.isRequired,
      commands: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired,
          atOperatingMode: PropTypes.string
        })
      )
    }).isRequired,
    assertion: PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      phrase: PropTypes.string,
      priority: PropTypes.string
    }).isRequired
  }).isRequired,
  conflictingResults: PropTypes.arrayOf(
    PropTypes.shape({
      testPlanRun: PropTypes.shape({
        id: PropTypes.string.isRequired,
        tester: PropTypes.shape({
          username: PropTypes.string.isRequired
        }).isRequired
      }).isRequired,
      scenarioResult: PropTypes.shape({
        output: PropTypes.string,
        unexpectedBehaviors: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            impact: PropTypes.string,
            details: PropTypes.string
          })
        )
      }),
      assertionResult: PropTypes.shape({
        passed: PropTypes.bool.isRequired
      }).isRequired
    })
  ).isRequired
});

export const TestPlanReportStatusPropType = PropTypes.shape({
  __typename: PropTypes.string,
  isRequired: PropTypes.bool,
  at: AtPropType,
  browser: BrowserPropType,
  minimumAtVersion: AtVersionPropType,
  exactAtVersion: AtVersionPropType,
  testPlanReport: PropTypes.shape({
    id: PropTypes.string.isRequired,
    metrics: PropTypes.object,
    isFinal: PropTypes.bool,
    markedFinalAt: PropTypes.string,
    issues: PropTypes.arrayOf(IssuePropType),
    draftTestPlanRuns: PropTypes.arrayOf(
      PropTypes.shape({
        tester: PropTypes.shape({
          username: PropTypes.string.isRequired
        }).isRequired,
        testPlanReport: PropTypes.shape({
          id: PropTypes.string.isRequired
        }).isRequired,
        testResults: PropTypes.arrayOf(
          PropTypes.shape({
            test: PropTypes.shape({
              id: PropTypes.string.isRequired
            }).isRequired,
            atVersion: AtVersionPropType,
            browserVersion: BrowserVersionPropType,
            completedAt: PropTypes.string
          })
        )
      })
    )
  }).isRequired
});

export const TestPlanRunPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string,
  initiatedByAutomation: PropTypes.bool,
  tester: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string.isRequired,
    isBot: PropTypes.bool
  }).isRequired
});

export const TestPlanVersionPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  phase: PropTypes.string,
  gitSha: PropTypes.string,
  gitMessage: PropTypes.string,
  versionString: PropTypes.string,
  updatedAt: PropTypes.string,
  draftPhaseReachedAt: PropTypes.string,
  candidatePhaseReachedAt: PropTypes.string,
  recommendedPhaseReachedAt: PropTypes.string,
  recommendedPhaseTargetDate: PropTypes.string,
  deprecatedAt: PropTypes.string,
  testPageUrl: PropTypes.string,
  metadata: PropTypes.object,
  testPlan: PropTypes.shape({
    directory: PropTypes.string
  }).isRequired
});

export const TestResultPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string,
  startedAt: PropTypes.string,
  completedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
});

export const UserPropType = PropTypes.shape({
  __typename: PropTypes.string,
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  isBot: PropTypes.bool
});

export const ModalActionPropType = PropTypes.shape({
  label: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
  component: PropTypes.elementType,
  props: PropTypes.object
});

export const ActionButtonPropType = PropTypes.shape({
  label: PropTypes.string,
  action: PropTypes.func
});

export const AtOutputPropType = PropTypes.shape({
  description: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        required: PropTypes.bool.isRequired,
        highlightRequired: PropTypes.bool.isRequired,
        description: PropTypes.string.isRequired
      })
    ])
  ).isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired,
  focus: PropTypes.bool.isRequired
});
