import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '@components/common/ProgressBar';
import { Table } from 'react-bootstrap';

const columnName = ({ atName, browserName }) => `${atName} and ${browserName}`;

const HtmlSupportTable = ({ ariaHtmlFeaturesMetrics }) => {
  console.log(ariaHtmlFeaturesMetrics);
  const { htmlFeaturesByAtBrowser } = ariaHtmlFeaturesMetrics;
  console.log(htmlFeaturesByAtBrowser);

  const supportCombos = [...new Set(htmlFeaturesByAtBrowser.map(columnName))];

  const dataByFeature = {};
  for (const row of htmlFeaturesByAtBrowser) {
    if (!dataByFeature[row.refId]) {
      dataByFeature[row.refId] = {};
    }
    dataByFeature[row.refId][columnName(row)] = row;
  }

  const keys = Object.keys(dataByFeature).sort();

  return (
    <>
      <h2>HTML Feature Support Levels</h2>
      <p id="html-feature-support-levels-table-description"></p>
      <Table bordered responsive aria-label="HTML Feature Support Levels">
        <thead>
          <tr>
            <th>HTML Feature</th>
            {supportCombos.map(name => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map(key => (
            <tr key={key}>
              <td>{key}</td>
              {supportCombos.map(col => (
                <td key={key + col}>
                  <ProgressBar
                    progress={dataByFeature[key][col].passedPercentage}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

HtmlSupportTable.propTypes = {
  ariaHtmlFeaturesMetrics: PropTypes.object.isRequired
};

export default HtmlSupportTable;
