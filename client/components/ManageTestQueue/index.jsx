import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import DisclosureComponent from '../common/DisclosureComponent';
import ManageAtVersions from '@components/ManageTestQueue/ManageAtVersions';
import AddTestPlans from '@components/ManageTestQueue/AddTestPlans';
import { AtPropType } from '../common/proptypes';

const ManageTestQueue = ({ ats = [], triggerUpdate = () => {} }) => {
  const { loadingMessage } = useTriggerLoad();

  const [showManageATs, setShowManageATs] = useState(false);
  const [showAddTestPlans, setShowAddTestPlans] = useState(false);

  const onManageAtsClick = () => setShowManageATs(!showManageATs);
  const onAddTestPlansClick = () => setShowAddTestPlans(!showAddTestPlans);

  return (
    <LoadingStatus message={loadingMessage}>
      <DisclosureComponent
        componentId="manageTestQueue"
        title={[
          'Manage Assistive Technology Versions',
          'Add Test Plans to the Test Queue'
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
            isOpen={showAddTestPlans}
            triggerUpdate={triggerUpdate}
          />
        ]}
        onClick={[onManageAtsClick, onAddTestPlansClick]}
        expanded={[showManageATs, showAddTestPlans]}
      />
    </LoadingStatus>
  );
};

ManageTestQueue.propTypes = {
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  triggerUpdate: PropTypes.func
};

export default ManageTestQueue;
