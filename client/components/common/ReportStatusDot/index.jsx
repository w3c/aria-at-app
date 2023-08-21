import styled from '@emotion/styled';

const ReportStatusDot = styled.span`
    display: inline-block;
    height: 10px;
    width: 10px;
    padding: 0;
    margin-right: 8px;
    border-radius: 50%;

    &.issues {
        background: #f2ba00;
    }

    &.reports-not-started {
        background: #7c7c7c;
    }

    &.reports-in-progress {
        background: #3876e8;
    }

    &.reports-complete {
        background: #2ba51c;
    }

    &.reports-missing {
        background: #ce1b4c;
    }
`;

export default ReportStatusDot;
