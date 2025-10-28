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
  mutation LinkAtBugs($assertionId: ID!, $atBugIds: [ID]!, $commandId: String) {
    linkAtBugsToAssertion(
      assertionId: $assertionId
      atBugIds: $atBugIds
      commandId: $commandId
    ) {
      id
      atBugs {
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
  }
`;

export const UNLINK_AT_BUGS = gql`
  mutation UnlinkAtBugs(
    $assertionId: ID!
    $atBugIds: [ID]!
    $commandId: String
  ) {
    unlinkAtBugsFromAssertion(
      assertionId: $assertionId
      atBugIds: $atBugIds
      commandId: $commandId
    ) {
      id
      atBugs {
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
  }
`;

export const LINK_AT_BUGS_TO_NEGATIVE_SIDE_EFFECT = gql`
  mutation LinkAtBugsToNegativeSideEffect(
    $negativeSideEffectId: ID!
    $atBugIds: [ID]!
  ) {
    linkAtBugsToNegativeSideEffect(
      negativeSideEffectId: $negativeSideEffectId
      atBugIds: $atBugIds
    ) {
      id
      atBugs {
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
  }
`;

export const UNLINK_AT_BUGS_FROM_NEGATIVE_SIDE_EFFECT = gql`
  mutation UnlinkAtBugsFromNegativeSideEffect(
    $negativeSideEffectId: ID!
    $atBugIds: [ID]!
  ) {
    unlinkAtBugsFromNegativeSideEffect(
      negativeSideEffectId: $negativeSideEffectId
      atBugIds: $atBugIds
    ) {
      id
      atBugs {
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
  }
`;
