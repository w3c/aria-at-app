import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Fieldset } from '..';
import styled from '@emotion/styled';
import supportJson from '../../../resources/support.json';

const Label = styled.label`
    display: block;

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
                    <Label key={`AssertionKey_${assertionIndex}`}>
                        <input
                            type="checkbox"
                            id={`pass-${commandIndex}-${assertionIndex}`}
                            name={`assertion-${commandIndex}-${assertionIndex}`}
                            defaultChecked={passed}
                            onClick={click}
                        />
                        {description[0]}
                    </Label>
                );
            })}
        </Fieldset>
    );
};

AssertionsFieldset.propTypes = {
    assertions: PropTypes.array.isRequired,
    commandIndex: PropTypes.number.isRequired,
    assertionsHeader: PropTypes.string.isRequired
};

export default AssertionsFieldset;
