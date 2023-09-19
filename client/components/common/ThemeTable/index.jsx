import { Table } from 'react-bootstrap';
import styled from '@emotion/styled';

export const ThemeTableHeaderH2 = styled.h2`
    background-color: var(--bs-table-bg) !important;
    font-size: 1.5rem;
    font-weight: 600;
    border: solid 1px #d2d5d9;
    border-bottom: none;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0 0 0;
`;

export const ThemeTableHeaderH3 = styled.h3`
    background-color: var(--bs-table-bg) !important;
    font-size: 1.25rem;
    font-weight: 600;
    border: solid 1px #d2d5d9;
    border-bottom: none;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0 0 0;
`;

export const ThemeTable = styled(Table)`
    margin-bottom: 0;

    td,
    th {
        padding-left: 1rem;
        min-width: 165px;
    }
`;

export const ThemeTableUnavailable = styled.div`
    border: solid 1px #d2d5d9;
    padding: 0.5rem 1rem;
`;
