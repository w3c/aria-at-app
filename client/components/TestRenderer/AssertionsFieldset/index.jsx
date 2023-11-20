import React from 'react';
import PropTypes from 'prop-types';
import { Fieldset } from '..';
import styled from '@emotion/styled';

const Label = styled.label`
    display: block;
`;

const AssertionsFieldset = ({ assertions, commandIndex }) => {
    return (
        <Fieldset>
            <legend>Assertions</legend>
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
    commandIndex: PropTypes.number.isRequired
};

export default AssertionsFieldset;
