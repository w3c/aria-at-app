import { gql } from '@apollo/client';

const ISSUE_FIELDS = (type = 'simple') => {
  switch (type) {
    case 'simple':
      return gql`
        fragment IssueFieldsSimple on Issue {
          __typename
          link
          isOpen
          feedbackType
        }
      `;
    case 'all':
      return gql`
        fragment IssueFieldsAll on Issue {
          __typename
          link
          isOpen
          feedbackType
          isCandidateReview
          author
          title
          createdAt
          closedAt
        }
      `;
  }
};

export default ISSUE_FIELDS;
