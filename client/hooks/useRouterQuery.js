import { useLocation } from 'react-router-dom';

export default function useRouterQuery() {
    return new URLSearchParams(useLocation().search);
}
