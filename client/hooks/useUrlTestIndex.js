import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * In the context of this hook, one negative value for test indices carries
 * special meaning:
 *
 * * -1: display the "Summary of Failures"
 */
const SUMMARY_OF_FAILURES_INDEX = -1;

/**
 * @typedef {Object} UseUrlTestIndexOptions
 * @property {number} [minTestIndex=0] - Minimum valid test index
 * @property {number} maxTestIndex - Maximum valid test index
 */

/**
 * @typedef {Array} UseUrlTestIndexReturn
 * @property {number} 0 - currentTestIndex - Current test index (0-indexed, or -1 for summary)
 * @property {Function} 1 - updateTestIndex - Function to update the test index (index) => void
 */

/**
 * Hook to manage test index based on URL hash. Reads the current test index from
 * the URL hash and provides a function to update it. Supports special value -1
 * for "Summary of Failures" view. Converts between 0-indexed (internal) and
 * 1-indexed (URL) representations.
 *
 * @param {UseUrlTestIndexOptions} options - Configuration options
 * @returns {UseUrlTestIndexReturn} Tuple containing currentTestIndex and updateTestIndex function
 */
export const useUrlTestIndex = ({ minTestIndex = 0, maxTestIndex }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTestIndex, setCurrentTestIndex] = useState(minTestIndex);

  const getTestIndex = () => {
    if (location.hash === '#summary-failures') {
      return SUMMARY_OF_FAILURES_INDEX;
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
    if (index === SUMMARY_OF_FAILURES_INDEX) {
      navigate(`${location.pathname}#summary-failures`, { replace: true });
      return;
    }

    // Add 1 to make it 1-indexed
    const newIndex = index + 1;
    navigate(`${location.pathname}#${newIndex}`, { replace: true });
  };

  return [currentTestIndex, updateTestIndex];
};
