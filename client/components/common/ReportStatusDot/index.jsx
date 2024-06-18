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

    &.tests-skipped,
    &.reports-not-started {
        background: #7c7c7c;
    }

    &.tests-running {
        border: 2px solid #1e8f37;
        background: #d2d5d9;
    }

    &.tests-error {
        background: #e3261f;
    }

    &.tests-queued,
    &.reports-in-progress {
        background: #3876e8;
    }

    &.tests-complete,
    &.reports-complete {
        background: #2ba51c;
    }

    &.tests-cancelled {
        background: #a231ff;
    }
    &.reports-missing {
        background: #ce1b4c;
    }
`;

export default ReportStatusDot;
