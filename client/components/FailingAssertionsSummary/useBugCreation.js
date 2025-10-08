import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_AT_BUG } from './queries';

export const useBugCreation = ({ atId, availableBugs }) => {
  const [createAtBug, { loading: creating, error: createError }] =
    useMutation(CREATE_AT_BUG);

  // Check if a bug with the given URL already exists
  const checkDuplicateUrl = useCallback(
    url => {
      if (!url) return null;
      const normalized = url.trim().toLowerCase();
      return availableBugs.find(
        bug => bug.url && bug.url.trim().toLowerCase() === normalized
      );
    },
    [availableBugs]
  );

  // Check if a bug with the given bugId already exists
  const checkDuplicateBugId = useCallback(
    bugId => {
      if (!bugId) return null;
      return availableBugs.find(bug => bug.bugId === String(bugId));
    },
    [availableBugs]
  );

  const handleCreateBug = useCallback(
    async ({ title, bugId, url }) => {
      const res = await createAtBug({
        variables: { input: { title, bugId, url, atId: Number(atId) } }
      });
      const created = res?.data?.createAtBug;
      if (created?.id) {
        return created;
      }
    },
    [createAtBug, atId]
  );

  return {
    creating,
    createError,
    handleCreateBug,
    checkDuplicateUrl,
    checkDuplicateBugId
  };
};
