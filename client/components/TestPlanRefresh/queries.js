import { gql } from '@apollo/client';
import AT_VERSION_FIELDS from '@components/common/fragments/AtVersion';
import AT_FIELDS from '@components/common/fragments/At';

// Query to get all AT versions that support automation
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

// Query to get refreshable test plan reports for a specific AT version
export const GET_REFRESHABLE_REPORTS_QUERY = gql`
  query GetRefreshableReports($atVersionId: ID!) {
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
        testPlans {
          id
          title
        }
      }
    }
  }
`;

// Mutation to create collection jobs from a previous AT version
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
