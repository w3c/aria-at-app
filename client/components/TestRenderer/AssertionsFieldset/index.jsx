import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import supportJson from '../../../resources/support.json';
import { Fieldset } from '..';

const Label = styled.label`
  display: inline-block;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;

  input {
    margin-right: 0.25rem;
  }
`;

const AssertionsFieldset = ({ assertions, commandIndex, assertionsHeader }) => {
  // Handle case where build process didn't include assertionResponseQuestion
  const normalizedHeader = useMemo(() => {
    return assertionsHeader?.descriptionHeader?.replace(
      'undefined',
      supportJson.testPlanStrings.assertionResponseQuestion
    );
  }, [assertionsHeader]);

  return (
    <Fieldset>
      <legend id={`command-${commandIndex}-assertions-heading`}>
        {normalizedHeader}
      </legend>
      {assertions.map((assertion, assertionIndex) => {
        const { description, passed, click } = assertion;
        return (
          <Fieldset key={`AssertionKey_${assertionIndex}`}>
            <legend>{description[0]}</legend>
            <Label>
              <input
                type="radio"
                id={`pass-${commandIndex}-${assertionIndex}-yes`}
                name={`assertion-${commandIndex}-${assertionIndex}`}
                checked={passed === true}
                onChange={() => click(true)}
              />
              Yes
            </Label>
            <Label>
              <input
                type="radio"
                id={`pass-${commandIndex}-${assertionIndex}-no`}
                name={`assertion-${commandIndex}-${assertionIndex}`}
                checked={passed === false}
                onChange={() => click(false)}
              />
              No
            </Label>
          </Fieldset>
        );
      })}
    </Fieldset>
  );
};

AssertionsFieldset.propTypes = {
  assertions: PropTypes.array.isRequired,
  commandIndex: PropTypes.number.isRequired,
  assertionsHeader: PropTypes.object.isRequired
};

export default AssertionsFieldset;
