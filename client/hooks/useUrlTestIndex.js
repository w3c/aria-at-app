import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const useUrlTestIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const getTestIndex = () => {
    // Remove the '#' character
    const fragment = location.hash.slice(1);
    // Subtract 1 to make it 0-indexed
    return Math.max(parseInt(fragment || '1', 10) - 1, 0);
  };

  useEffect(() => {
    setCurrentTestIndex(getTestIndex());
  }, [location.hash]);

  const updateTestIndex = index => {
    // Add 1 to make it 1-indexed
    const newIndex = index + 1;
    navigate(`${location.pathname}#${newIndex}`, { replace: true });
  };

  return [currentTestIndex, updateTestIndex];
};
