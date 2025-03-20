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
    refreshableReports(atVersionId: $atVersionId) {
      currentVersion {
        id
        name
      }
      previousVersionGroups {
        previousVersion {
          id
          name
        }
        reports {
          id
          testPlanVersion {
            id
            title
            versionString
          }
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
  query GetUpdateEvents($type: UpdateEventType) {
    updateEvents(type: $type) {
      id
      timestamp
      description
      type
    }
  }
`;
