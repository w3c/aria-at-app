import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import RadioBox from '@components/common/RadioBox';
import AddTestToQueueWithConfirmation from '@components/AddTestToQueueWithConfirmation';
import { dates } from 'shared';
import PropTypes from 'prop-types';
import {
  AtPropType,
  TestPlanVersionPropType
} from '@components/common/proptypes';
import styles from './ManageTestQueue.module.css';
import commonStyles from '../common/styles.module.css';

const AddTestPlans = ({
  ats = [],
  testPlanVersions = [],
  triggerUpdate = () => {}
}) => {
  const [allTestPlans, setAllTestPlans] = useState([]);
  const [allTestPlanVersions, setAllTestPlanVersions] = useState([]);

  const [selectedTestPlanVersionId, setSelectedTestPlanVersionId] =
    useState('');
  const [matchingTestPlanVersions, setMatchingTestPlanVersions] = useState([]);

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

  useEffect(() => {
    // Prevent allTestPlanVersions and filteredTestPlanVersions from being unnecessarily overwritten
    if (allTestPlanVersions.length) return;

    const _allTestPlanVersions = testPlanVersions
      .map(version => ({ ...version }))
      .flat();

    // Get valid test plans by removing duplicate entries from different
    // test plan versions of the same test plan being imported multiple times
    const _allTestPlans = _allTestPlanVersions
      .filter(
        (v, i, a) =>
          a.findIndex(
            t =>
              t.title === v.title &&
              t.testPlan.directory === v.testPlan.directory
          ) === i
      )
      .map(({ id, title, testPlan }) => ({
        id,
        title,
        directory: testPlan.directory
      }))
      // sort by the testPlanVersion titles
      .sort((a, b) => (a.title < b.title ? -1 : 1));

    // mark the first testPlanVersion as selected
    if (_allTestPlans.length) {
      const plan = _allTestPlans[0];
      updateMatchingTestPlanVersions(plan.id, _allTestPlanVersions);
    }

    setAllTestPlans(_allTestPlans);
    setAllTestPlanVersions(_allTestPlanVersions);
  }, [testPlanVersions]);

  const updateMatchingTestPlanVersions = (value, allTestPlanVersions) => {
    // update test plan versions based on selected test plan
    const retrievedTestPlanVersion = allTestPlanVersions.find(
      item => item.id === value
    );

    // find the versions that apply and pre-set these
    const matchingTestPlanVersions = allTestPlanVersions
      .filter(
        item =>
          item.title === retrievedTestPlanVersion.title &&
          item.testPlan.directory ===
            retrievedTestPlanVersion.testPlan.directory &&
          item.phase !== 'DEPRECATED' &&
          item.phase !== 'RD'
      )
      .sort((a, b) => (new Date(a.updatedAt) > new Date(b.updatedAt) ? -1 : 1));
    setMatchingTestPlanVersions(matchingTestPlanVersions);

    if (matchingTestPlanVersions.length)
      setSelectedTestPlanVersionId(matchingTestPlanVersions[0].id);
    else setSelectedTestPlanVersionId(null);
  };

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
              updateMatchingTestPlanVersions(value, allTestPlanVersions);
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
                <option key={`${item.gitSha}-${item.id}`} value={item.id}>
                  {dates.convertDateToString(item.updatedAt, 'MMM D, YYYY')}{' '}
                  {item.gitMessage} ({item.gitSha.substring(0, 7)})
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
  testPlanVersions: PropTypes.arrayOf(TestPlanVersionPropType).isRequired,
  triggerUpdate: PropTypes.func
};

export default AddTestPlans;
