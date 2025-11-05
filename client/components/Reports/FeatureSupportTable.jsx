import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import ProgressBar from '@components/common/ProgressBar';
import { None } from '@components/common/None';

const columnName = ({ atName, browserName }) => `${atName} and ${browserName}`;
const none = None();

const FeatureSupportTable = ({ featureData, featureLabel }) => {
  const supportCombos = [...new Set(featureData.map(columnName))];
  supportCombos.sort((a, b) => a.localeCompare(b));

  const dataByFeature = {};
  const links = {};
  for (const row of featureData) {
    if (!dataByFeature[row.refId]) {
      dataByFeature[row.refId] = {};
    }
    links[row.refId] = { href: row.value, text: row.linkText };
    dataByFeature[row.refId][columnName(row)] = row;
  }

  const keys = Object.keys(dataByFeature).sort();

  const headingText = `${featureLabel} Feature Support Levels`;
  const tableLabel = `${featureLabel} Feature Support Levels`;
  const descriptionId = `${featureLabel.toLowerCase()}-feature-support-levels-table-description`;
  const featureColumnLabel = `${featureLabel} Feature`;

  return (
    <>
      <h2>{headingText}</h2>
      <p id={descriptionId}></p>
      <Table bordered responsive aria-label={tableLabel}>
        <thead>
          <tr>
            <th>{featureColumnLabel}</th>
            {supportCombos.map(name => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map(key => (
            <tr key={key}>
              <td>
                <a href={links[key].href} rel="noreferrer" target="_blank">
                  {key}
                </a>
              </td>
              {supportCombos.map(col => {
                const row = dataByFeature[key][col];

                if (!row) return <td key={key + col}>{none}</td>;

                const detailLink = `/aria-html-feature/${row.atId}/${row.browserId}/${key}`;
                return (
                  <td key={key + col}>
                    <Link
                      to={detailLink}
                      aria-label={`${row.passedPercentage}%`}
                    >
                      <ProgressBar progress={row.passedPercentage} />
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

FeatureSupportTable.propTypes = {
  featureData: PropTypes.array.isRequired,
  featureLabel: PropTypes.oneOf(['ARIA', 'HTML']).isRequired
};

export default FeatureSupportTable;
