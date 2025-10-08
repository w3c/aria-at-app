import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useNegativeSideEffects } from '../../hooks/useNegativeSideEffects';
import { TestPlanReportPropType } from '../common/proptypes';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import NegativeSideEffectLinkAtBugModal from './NegativeSideEffectBugLinking';
import ReportAtBugModal from '../FailingAssertionsSummary/ReportAtBugModal';

const NegativeSideEffectsSummaryTable = ({
  testPlanReport,
  atName, // eslint-disable-line no-unused-vars
  getLinkUrl = assertion => `#result-${assertion.testId}`,
  LinkComponent = Link,
  testPlanVersion
}) => {
  const negativeSideEffects = useNegativeSideEffects(testPlanReport);
  const { data: meData } = useQuery(ME_QUERY);
  const auth = evaluateAuth(meData?.me ? meData.me : {});
  const { isAdmin, isVendor } = auth;

  const canEdit = isAdmin || isVendor;

  const [selectedNegativeSideEffect, setSelectedNegativeSideEffect] =
    useState(null);
  const [reportNegativeSideEffect, setReportNegativeSideEffect] =
    useState(null);
  const [negativeSideEffectUpdates, setNegativeSideEffectUpdates] = useState(
    {}
  );
  const linkBugButtonRef = useRef();
  const { metrics } = testPlanReport;

  // Merge server data with local updates
  const displayNegativeSideEffects = useMemo(() => {
    return negativeSideEffects.map(negativeSideEffect => {
      const update = negativeSideEffectUpdates[negativeSideEffect.encodedId];
      return update || negativeSideEffect;
    });
  }, [negativeSideEffects, negativeSideEffectUpdates]);

  if (metrics.negativeSideEffectCount.length === 0) return null;

  return (
    <>
      <Table
        bordered
        responsive
        aria-labelledby="negative-side-effects-heading"
      >
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Command</th>
            <th>Side Effect</th>
            <th>Details</th>
            <th>Impact</th>
            <th>Bug Reports</th>
          </tr>
        </thead>
        <tbody>
          {displayNegativeSideEffects.map((negativeSideEffect, index) => (
            <tr key={`negative-side-effects-${index}`}>
              <td>
                <LinkComponent to={getLinkUrl(negativeSideEffect)}>
                  {negativeSideEffect.testTitle}
                </LinkComponent>
              </td>
              <td>{negativeSideEffect.scenarioCommands}</td>
              <td>{negativeSideEffect.text}</td>
              <td>{negativeSideEffect.details}</td>
              <td>{negativeSideEffect.impact}</td>
              <td>
                <ul className="mb-2">
                  {negativeSideEffect.assertionAtBugs &&
                  negativeSideEffect.assertionAtBugs.length
                    ? negativeSideEffect.assertionAtBugs.map(bug => (
                        <li key={bug.id}>
                          <a
                            href={bug.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {bug.at?.name && `${bug.at.name}#`}
                            {bug.bugId}: {bug.title}
                          </a>
                        </li>
                      ))
                    : !canEdit
                    ? 'None'
                    : ''}
                </ul>
                <div>
                  {canEdit && (
                    <div className="mb-1">
                      <button
                        ref={linkBugButtonRef}
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          setSelectedNegativeSideEffect(negativeSideEffect)
                        }
                      >
                        Link {atName} Bug
                      </button>
                    </div>
                  )}
                  {canEdit && (
                    <div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setReportNegativeSideEffect(negativeSideEffect)
                        }
                      >
                        Report {atName} Bug
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <NegativeSideEffectLinkAtBugModal
        show={!!selectedNegativeSideEffect}
        onClose={() => setSelectedNegativeSideEffect(null)}
        atId={testPlanReport.at.id}
        atName={atName}
        negativeSideEffect={selectedNegativeSideEffect}
        onLinked={updatedNegativeSideEffect => {
          setNegativeSideEffectUpdates(prev => ({
            ...prev,
            [updatedNegativeSideEffect.encodedId]: updatedNegativeSideEffect
          }));
        }}
      />
      <ReportAtBugModal
        show={!!reportNegativeSideEffect}
        onClose={() => setReportNegativeSideEffect(null)}
        assertion={reportNegativeSideEffect}
        testPlanReport={testPlanReport}
        testPlanVersion={testPlanVersion}
      />
    </>
  );
};

NegativeSideEffectsSummaryTable.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  atName: PropTypes.string.isRequired,
  getLinkUrl: PropTypes.func,
  LinkComponent: PropTypes.elementType,
  testPlanVersion: PropTypes.object.isRequired
};

export default NegativeSideEffectsSummaryTable;
