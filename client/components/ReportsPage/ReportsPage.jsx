import { useQuery } from '@apollo/client';
import { REPORTS_PAGE_QUERY } from './queries';

const ReportsPage = () => {
    const { data } = useQuery(REPORTS_PAGE_QUERY);
    if (!data) return null;

    return JSON.stringify(data, null, 2);
};

export default ReportsPage;
