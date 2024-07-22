import { gql } from '@apollo/client';

/**
 *
 * @param {'simple'|'all'} type
 * @returns {*}
 */
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
