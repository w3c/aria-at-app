import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { LINK_AT_BUGS, UNLINK_AT_BUGS } from './queries';

export const useBugLinking = ({ assertion, onUpdate }) => {
  const [linkAtBugs, { loading: linkLoading, error: linkError }] =
    useMutation(LINK_AT_BUGS);
  const [unlinkAtBugs, { loading: unlinkLoading, error: unlinkError }] =
    useMutation(UNLINK_AT_BUGS);

  const handleLinkBug = useCallback(
    async bugId => {
      try {
        const result = await linkAtBugs({
          variables: { assertionId: assertion.assertionId, atBugIds: [bugId] }
        });
        // Notify parent of the update with the fresh data from server
        if (onUpdate && result.data?.linkAtBugsToAssertion) {
          onUpdate(result.data.linkAtBugsToAssertion.atBugs);
        }
        return true;
      } catch (e) {
        return false;
      }
    },
    [linkAtBugs, assertion, onUpdate]
  );

  const handleUnlinkBug = useCallback(
    async bugId => {
      try {
        const result = await unlinkAtBugs({
          variables: {
            assertionId: assertion.assertionId,
            atBugIds: [bugId]
          }
        });
        // Notify parent of the update with the fresh data from server
        if (onUpdate && result.data?.unlinkAtBugsFromAssertion) {
          onUpdate(result.data.unlinkAtBugsFromAssertion.atBugs);
        }
        return true;
      } catch (e) {
        return false;
      }
    },
    [unlinkAtBugs, assertion, onUpdate]
  );

  return {
    linkLoading,
    unlinkLoading,
    linkError,
    unlinkError,
    handleLinkBug,
    handleUnlinkBug
  };
};
