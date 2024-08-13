import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const useUrlTestIndex = maxTestIndex => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const getTestIndex = () => {
    // Remove the '#' character
    const fragment = parseInt(location.hash.slice(1), 10) || 1;

    if (!maxTestIndex || maxTestIndex < 1) {
      // If the max test index is less than 1, return 0
      return 0;
    }
    // Subtract 1 to make it 0-indexed
    // and clamp to the max test index
    return Math.max(0, Math.min(fragment - 1, maxTestIndex - 1));
  };

  useEffect(() => {
    setCurrentTestIndex(getTestIndex());
  }, [location.hash, maxTestIndex]);

  const updateTestIndex = index => {
    // Add 1 to make it 1-indexed
    const newIndex = index + 1;
    navigate(`${location.pathname}#${newIndex}`, { replace: true });
  };

  return [currentTestIndex, updateTestIndex];
};
