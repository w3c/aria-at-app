import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import DisclosureComponent from '../common/DisclosureComponent';
import ManageAtVersions from '@components/ManageTestQueue/ManageAtVersions';
import AddTestPlans from '@components/ManageTestQueue/AddTestPlans';
import { AtPropType, TestPlanVersionPropType } from '../common/proptypes';
import ManageRequiredReportsDisclosure from '../common/ManageRequiredReportsDisclosure';
import styled from '@emotion/styled';

export const DisclosureContainer = styled.div`
  // Following directives are related to the ManageTestQueue component
  > span {
    display: block;
    margin-bottom: 1rem;
  }

  // Add Test Plan to Test Queue button
  > button {
    padding: 0.5rem 1rem;
    margin-top: 1rem;
  }

  .disclosure-row-manage-ats {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-gap: 1rem;

    .ats-container {
      grid-column: 1 / span 2;
    }

    .at-versions-container {
      display: flex;
      flex-direction: column;
      grid-column: 3 / span 3;
    }

    .disclosure-buttons-row {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;

      > button {
        margin: 0;
        padding: 0;
        color: #275caa;
        border: none;
        background-color: transparent;

        &:nth-of-type(2) {
          margin-left: auto;
        }

        // remove button
        &:nth-of-type(3) {
          margin-left: 1rem;
          color: #ce1b4c;
        }
      }
    }
  }

  .disclosure-row-test-plans {
  .disclosure-row-controls {
    display: grid;
    display: grid;
    row-gap: 0.5rem;
    grid-auto-flow: column;
    grid-template-columns: 2fr 2fr 1fr;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    column-gap: 2rem;
    grid-gap: 1rem;
    align-items: end;
    & > :nth-of-type(3) {
      display: block;
    }
    & > :nth-of-type(5) {
      grid-column: span 2;
    }
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      & > :nth-of-type(3) {
        display: none;
      }
      & > :nth-of-type(5) {
        grid-column: initial;
      }
    }
  }
  .form-group-at-version {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    row-gap: 0.75rem;
    select {
      width: inherit;
      @media (max-width: 767px) {
        flex-grow: 1;
      }
    }

  .disclosure-row-controls {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 1rem;
    align-items: end;
  }

  .disclosure-form-label {
    font-weight: bold;
    font-size: 1rem;
  }
`;

const ManageTestQueue = ({
  ats = [],
  testPlanVersions = [],
  triggerUpdate = () => {},
  browsers = []
}) => {
  const { loadingMessage } = useTriggerLoad();
  const [showManageATs, setShowManageATs] = useState(false);
  const [showAddTestPlans, setShowAddTestPlans] = useState(false);
  const [showManageReqReports, setShowManageReqReports] = useState(false);

  const onManageAtsClick = () => setShowManageATs(!showManageATs);
  const onAddTestPlansClick = () => setShowAddTestPlans(!showAddTestPlans);
  const onManageReqReportsClick = () =>
    setShowManageReqReports(!showManageReqReports);

  return (
    <LoadingStatus message={loadingMessage}>
      <DisclosureComponent
        componentId="manage-test-queue"
        title={[
          'Manage Assistive Technology Versions',
          'Add Test Plans to the Test Queue',
          'Manage Required Reports'
        ]}
        disclosureContainerView={[
          <ManageAtVersions
            key="ManageAtVersions"
            ats={ats}
            triggerUpdate={triggerUpdate}
          />,
          <AddTestPlans
            key="AddTestPlans"
            ats={ats}
            testPlanVersions={testPlanVersions}
            triggerUpdate={triggerUpdate}
          />,
          <ManageRequiredReportsDisclosure
            key="ManageRequiredReportsDisclosure"
            ats={ats}
            triggerUpdate={triggerUpdate}
            browsers={browsers}
          />
        ]}
        onClick={[
          onManageAtsClick,
          onAddTestPlansClick,
          onManageReqReportsClick
        ]}
        expanded={[showManageATs, showAddTestPlans, showManageReqReports]}
        stacked
      />
    </LoadingStatus>
  );
};

ManageTestQueue.propTypes = {
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  testPlanVersions: PropTypes.arrayOf(TestPlanVersionPropType),
  triggerUpdate: PropTypes.func,
  browsers: PropTypes.array,
  enableManageRequiredReports: PropTypes.bool
};

export default ManageTestQueue;
