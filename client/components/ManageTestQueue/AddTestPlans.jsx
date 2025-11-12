import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import RadioBox from '@components/common/RadioBox';
import AddTestToQueueWithConfirmation from '@components/AddTestToQueueWithConfirmation';
import { dates } from 'shared';
import PropTypes from 'prop-types';
import { AtPropType } from '@components/common/proptypes';
import {
  useAddTestPlansData,
  useAddTestPlansFormState
} from './useAddTestPlansData';
import styles from './ManageTestQueue.module.css';
import commonStyles from '../common/styles.module.css';

const AddTestPlans = ({
  ats = [],
  isOpen = false,
  triggerUpdate = () => {}
}) => {
  const { allTestPlans, allTestPlanVersions } = useAddTestPlansData(isOpen);
  const {
    selectedTestPlanVersionId,
    setSelectedTestPlanVersionId,
    getMatchingTestPlanVersions
  } = useAddTestPlansFormState(allTestPlanVersions);

  const matchingTestPlanVersions = getMatchingTestPlanVersions(
    selectedTestPlanVersionId
  );

  const [selectedAtId, setSelectedAtId] = useState('');
  const [selectedBrowserId, setSelectedBrowserId] = useState('');
  const [selectedAtVersionExactOrMinimum, setSelectedAtVersionExactOrMinimum] =
    useState('Exact Version');
  const [selectedReportAtVersionId, setSelectedReportAtVersionId] =
    useState(null);
  const [
    showMinimumAtVersionErrorMessage,
    setShowMinimumAtVersionErrorMessage
  ] = useState(false);

  const onTestPlanVersionChange = e => {
    const { value } = e.target;
    setShowMinimumAtVersionErrorMessage(false);
    setSelectedAtVersionExactOrMinimum('Exact Version');
    setSelectedTestPlanVersionId(value);
  };

  const onAtChange = e => {
    const { value } = e.target;
    setShowMinimumAtVersionErrorMessage(false);
    setSelectedAtId(value);
    setSelectedReportAtVersionId(null);
  };

  const onReportAtVersionIdChange = e => {
    const { value } = e.target;
    setSelectedReportAtVersionId(value);
  };

  const onBrowserChange = e => {
    const { value } = e.target;
    setSelectedBrowserId(value);
  };

  const selectedTestPlanVersion = allTestPlanVersions.find(
    ({ id }) => id === selectedTestPlanVersionId
  );

  const exactOrMinimumAtVersion = ats
    .find(item => item.id === selectedAtId)
    ?.atVersions.find(item => item.id === selectedReportAtVersionId);

  return (
    <div className={styles.manageDisclosureContainer}>
      <span>
        Select a test plan, assistive technology and browser to add a new test
        plan report to the test queue.
      </span>
      <div className={styles.disclosureRowTestPlans}>
        <Form.Group className={commonStyles.formGroup}>
          <Form.Label className={styles.disclosureFormLabel}>
            Test Plan
          </Form.Label>
          <Form.Select
            onChange={e => {
              const { value } = e.target;
              setShowMinimumAtVersionErrorMessage(false);
              setSelectedAtVersionExactOrMinimum('Exact Version');
              setSelectedTestPlanVersionId(value);
            }}
          >
            {allTestPlans.map(item => (
              <option key={`${item.title}-${item.id}`} value={item.id}>
                {item.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className={commonStyles.formGroup}>
          <Form.Label className={styles.disclosureFormLabel}>
            Test Plan Version
          </Form.Label>
          <Form.Select
            value={selectedTestPlanVersionId ? selectedTestPlanVersionId : ''}
            onChange={onTestPlanVersionChange}
            disabled={!selectedTestPlanVersionId}
            aria-disabled={!selectedTestPlanVersionId}
          >
            {matchingTestPlanVersions.length ? (
              matchingTestPlanVersions.map(item => (
                <option
                  key={`${item.id}-${item.versionString}`}
                  value={item.id}
                >
                  {dates.convertDateToString(item.updatedAt, 'MMM D, YYYY')}{' '}
                  {item.gitMessage
                    ? `${item.gitMessage} (${item.gitSha?.substring(0, 7)})`
                    : item.versionString}
                </option>
              ))
            ) : (
              <option>Versions in R&D or Deprecated</option>
            )}
          </Form.Select>
        </Form.Group>
        <div>{/* blank grid cell */}</div>
        <Form.Group className={commonStyles.formGroup}>
          <Form.Label className={styles.disclosureFormLabel}>
            Assistive Technology
          </Form.Label>
          <Form.Select value={selectedAtId} onChange={onAtChange}>
            <option value={''} disabled>
              Select an Assistive Technology
            </option>
            {ats.map(item => (
              <option key={`${item.name}-${item.id}`} value={item.id}>
                {item.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className={commonStyles.formGroup}>
          <Form.Label className={styles.disclosureFormLabel}>
            Assistive Technology Version
          </Form.Label>
          <div className={styles.formGroupAtVersion}>
            <RadioBox
              name="atVersion"
              labels={['Exact Version', 'Minimum Version']}
              selectedLabel={selectedAtVersionExactOrMinimum}
              onSelect={exactOrMinimum => {
                if (
                  selectedTestPlanVersion?.phase === 'RECOMMENDED' &&
                  exactOrMinimum === 'Minimum Version'
                ) {
                  setShowMinimumAtVersionErrorMessage(true);
                  return;
                }

                setSelectedAtVersionExactOrMinimum(exactOrMinimum);
              }}
            />
            <Form.Select
              value={selectedReportAtVersionId ?? ''}
              onChange={onReportAtVersionIdChange}
              disabled={!selectedAtId}
            >
              <option value={''} disabled>
                Select AT Version
              </option>
              {ats
                .find(at => at.id === selectedAtId)
                ?.atVersions.map(item => (
                  <option key={`${item.name}-${item.id}`} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Form.Select>
            {showMinimumAtVersionErrorMessage &&
            selectedTestPlanVersion?.phase === 'RECOMMENDED' ? (
              <div role="alert">
                The selected test plan version is in the recommended phase and
                only exact versions can be chosen.
              </div>
            ) : null}
          </div>
        </Form.Group>
        <Form.Group className={commonStyles.formGroup}>
          <Form.Label className={styles.disclosureFormLabel}>
            Browser
          </Form.Label>
          <Form.Select
            value={selectedBrowserId}
            onChange={onBrowserChange}
            disabled={!selectedAtId}
          >
            <option value={''} disabled>
              Select a Browser
            </option>
            {ats
              .find(at => at.id === selectedAtId)
              ?.browsers.map(item => (
                <option key={`${item.name}-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
          </Form.Select>
        </Form.Group>
      </div>
      <AddTestToQueueWithConfirmation
        testPlanVersion={allTestPlanVersions.find(
          item => item.id === selectedTestPlanVersionId
        )}
        at={ats.find(item => item.id === selectedAtId)}
        exactAtVersion={
          selectedAtVersionExactOrMinimum === 'Exact Version'
            ? exactOrMinimumAtVersion
            : null
        }
        minimumAtVersion={
          selectedAtVersionExactOrMinimum === 'Minimum Version'
            ? exactOrMinimumAtVersion
            : null
        }
        browser={ats
          .find(at => at.id === selectedAtId)
          ?.browsers.find(browser => browser.id === selectedBrowserId)}
        triggerUpdate={triggerUpdate}
        disabled={
          !selectedTestPlanVersionId ||
          !selectedAtId ||
          !selectedReportAtVersionId ||
          !selectedBrowserId
        }
      />
    </div>
  );
};

AddTestPlans.propTypes = {
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  isOpen: PropTypes.bool,
  triggerUpdate: PropTypes.func
};

export default AddTestPlans;
