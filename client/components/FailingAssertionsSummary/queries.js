import { gql } from '@apollo/client';

export const AT_BUGS_QUERY = gql`
  query AtBugs($atId: ID) {
    atBugs(atId: $atId) {
      id
      title
      bugId
      url
      at {
        id
        name
      }
    }
  }
`;

export const CREATE_AT_BUG = gql`
  mutation CreateAtBug($input: AtBugInput!) {
    createAtBug(input: $input) {
      id
      title
      bugId
      url
      at {
        id
        name
      }
    }
  }
`;

export const LINK_AT_BUGS = gql`
  mutation LinkAtBugs($assertionId: ID!, $atBugIds: [ID]!) {
    linkAtBugsToAssertion(assertionId: $assertionId, atBugIds: $atBugIds) {
      id
      atBugs {
        id
        title
        bugId
        url
      }
    }
  }
`;

export const UNLINK_AT_BUGS = gql`
  mutation UnlinkAtBugs($assertionId: ID!, $atBugIds: [ID]!) {
    unlinkAtBugsFromAssertion(assertionId: $assertionId, atBugIds: $atBugIds) {
      id
      atBugs {
        id
        title
        bugId
        url
      }
    }
  }
`;
