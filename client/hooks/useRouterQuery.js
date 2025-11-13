import { useLocation } from 'react-router-dom';

/**
 * Hook to access URL query parameters from React Router location.
 *
 * @returns {URLSearchParams} URLSearchParams object containing the query parameters
 */
export default function useRouterQuery() {
  return new URLSearchParams(useLocation().search);
}
