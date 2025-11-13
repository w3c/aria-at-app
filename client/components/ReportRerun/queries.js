import { gql } from '@apollo/client';

export const GET_AUTOMATION_SUPPORTED_AT_VERSIONS = gql`
  query GetAutomationSupportedAtVersions {
    ats {
      id
      name
      atVersions {
        id
        name
        releasedAt
        supportedByAutomation
      }
    }
  }
`;

export const GET_RERUNNABLE_REPORTS_QUERY = gql`
  query GetRerunnableReports($atVersionId: ID!) {
    rerunnableReports(atVersionId: $atVersionId) {
      currentVersion {
        id
        name
      }
      previousVersionGroups {
        previousVersion {
          id
          name
          releasedAt
        }
        reports {
          id
          testPlanVersion {
            id
            title
            versionString
          }
          markedFinalAt
          browser {
            id
            name
          }
          at {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_RERUNNABLE_REPORTS_COUNT_QUERY = gql`
  query GetRerunnableReportsCount($atVersionId: ID!) {
    rerunnableReports(atVersionId: $atVersionId) {
      previousVersionGroups {
        reports {
          id
        }
      }
    }
  }
`;

export const CREATE_COLLECTION_JOBS_MUTATION = gql`
  mutation CreateCollectionJobs($atVersionId: ID!) {
    createCollectionJobsFromPreviousAtVersion(atVersionId: $atVersionId) {
      collectionJobs {
        id
        status
      }
      message
    }
  }
`;

export const GET_UPDATE_EVENTS = gql`
  query GetUpdateEvents($types: [String]) {
    updateEvents(types: $types) {
      id
      timestamp
      description
      type
    }
  }
`;
