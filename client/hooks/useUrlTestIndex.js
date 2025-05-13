import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * In the context of this hook, two negative values for test indices carry
 * special meaning:
 *
 * * -1: display the "Summary of Failing Assertions"
 * * -2: display the "Summary of Negative Side Effects"
 */
export const useUrlTestIndex = ({ minTestIndex = 0, maxTestIndex }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTestIndex, setCurrentTestIndex] = useState(minTestIndex);

  const getTestIndex = () => {
    if (location.hash === '#summary-assertions') {
      return -1;
    }

    if (location.hash === '#summary-side-effects') {
      return -2;
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
    if (index === -1) {
      navigate(`${location.pathname}#summary-assertions`, { replace: true });
      return;
    }
    if (index === -2) {
      navigate(`${location.pathname}#summary-side-effects`, { replace: true });
      return;
    }

    // Add 1 to make it 1-indexed
    const newIndex = index + 1;
    navigate(`${location.pathname}#${newIndex}`, { replace: true });
  };

  return [currentTestIndex, updateTestIndex];
};
