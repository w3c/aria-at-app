import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * In the context of this hook, two negative values for test indices carry
 * special meaning:
 *
 * * -1: display the "Summary of Failing Assertions"
 * * -2: display the "Summary of Negative Side Effects"
 * * -3: display the "Summary of Untestable Assertions"
 */
const FAILING_ASSERTIONS_INDEX = -1;
const NEGATIVE_SIDE_EFFECTS = -2;
const UNTESTABLE_ASSERTIONS_INDEX = -3;

export const useUrlTestIndex = ({ minTestIndex = 0, maxTestIndex }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTestIndex, setCurrentTestIndex] = useState(minTestIndex);

  const getTestIndex = () => {
    if (location.hash === '#summary-failing-assertions') {
      return FAILING_ASSERTIONS_INDEX;
    }

    if (location.hash === '#summary-side-effects') {
      return NEGATIVE_SIDE_EFFECTS;
    }

    if (location.hash === '#summary-untestable-assertions') {
      return UNTESTABLE_ASSERTIONS_INDEX;
    }

    // Remove the '#' character
    const fragment = parseInt(location.hash.slice(1), 10) || 1;

    if (!maxTestIndex || maxTestIndex < 1) {
      // If the max test index is less than 1, return the min test index
      return minTestIndex;
    }
    // Subtract 1 to make it 0-indexed
    // and clamp to the max test index
    return Math.max(0, Math.min(fragment - 1, maxTestIndex - 1));
  };

  useEffect(() => {
    setCurrentTestIndex(getTestIndex());
  }, [location.hash, maxTestIndex]);

  const updateTestIndex = index => {
    // Special case for summary
    if (index === FAILING_ASSERTIONS_INDEX) {
      navigate(`${location.pathname}#summary-failing-assertions`, {
        replace: true
      });
      return;
    }
    if (index === NEGATIVE_SIDE_EFFECTS) {
      navigate(`${location.pathname}#summary-side-effects`, { replace: true });
      return;
    }
    if (index === UNTESTABLE_ASSERTIONS_INDEX) {
      navigate(`${location.pathname}#summary-untestable-assertions`, {
        replace: true
      });
      return;
    }

    // Add 1 to make it 1-indexed
    const newIndex = index + 1;
    navigate(`${location.pathname}#${newIndex}`, { replace: true });
  };

  return [currentTestIndex, updateTestIndex];
};
