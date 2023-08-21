import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Feedback } from '..';
import { Form } from 'react-bootstrap';

const OutputTextAreaWrapper = styled.p`
    > textarea {
        width: 100%;
    }
`;

const NoOutputCheckbox = styled(Form.Check.Label)`
    display: inline-block;
    float: right;
    > input {
        margin-right: 4px;
    }
`;

const OutputTextArea = ({ commandIndex, atOutput, isSubmitted }) => {
    const [noOutput, setNoOutput] = React.useState(false);

    return (
        <OutputTextAreaWrapper>
            <label htmlFor={`speechoutput-${commandIndex}`}>
                {atOutput.description[0]}
                {isSubmitted && (
                    <Feedback
                        className={`${
                            atOutput.description[1].required && 'required'
                        } ${
                            atOutput.description[1].highlightRequired &&
                            'highlight-required'
                        }`}
                    >
                        {atOutput.description[1].description}
                    </Feedback>
                )}
            </label>
            {!atOutput.value && (
                <NoOutputCheckbox role="checkbox" aria-checked={noOutput}>
                    <Form.Check.Input
                        type="checkbox"
                        onChange={() => setNoOutput(!noOutput)}
                        value={noOutput}
                    />
                    No output
                </NoOutputCheckbox>
            )}
            <textarea
                key={`SpeechOutput__textarea__${commandIndex}`}
                id={`speechoutput-${commandIndex}`}
                autoFocus={isSubmitted && atOutput.focus}
                value={atOutput.value}
                onChange={e => atOutput.change(e.target.value)}
                disabled={noOutput}
            />
        </OutputTextAreaWrapper>
    );
};

OutputTextArea.propTypes = {
    commandIndex: PropTypes.number.isRequired,
    atOutput: PropTypes.object.isRequired,
    isSubmitted: PropTypes.bool.isRequired
};

export default OutputTextArea;
