import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Feedback, Fieldset } from '..';

const ProblemOptionContainer = styled.div`
    &.enabled {
        margin-bottom: 15px;
    }
`;

const Label = styled.label`
    display: inline-block;
    width: 100%;
    margin-bottom: 5px;

    > select,
    > input[type='text'] {
        min-width: 120px;
        width: 50%;
        height: 26px;
        margin-left: 5px;
    }

    > input[type='checkbox'] {
        margin-right: 5px;
    }

    &.off-screen {
        position: absolute !important;
        height: 1px;
        width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap;
    }
`;

const UnexpectedBehaviorsFieldset = ({
    commandIndex,
    unexpectedBehaviors,
    isSubmitted
}) => {
    const severityOptions = ['Moderate', 'High'];

    return (
        <Fieldset id={`cmd-${commandIndex}-problems`}>
            <legend>{unexpectedBehaviors.description[0]}</legend>
            {isSubmitted && (
                <Feedback
                    className={`${
                        unexpectedBehaviors.description[1].required &&
                        'required'
                    } ${
                        unexpectedBehaviors.description[1].highlightRequired &&
                        'highlight-required'
                    }`}
                >
                    {unexpectedBehaviors.description[1].description}
                </Feedback>
            )}
            <div>
                <input
                    key={`Problem__${commandIndex}__true`}
                    type="radio"
                    id={`problem-${commandIndex}-true`}
                    name={`problem-${commandIndex}`}
                    autoFocus={
                        isSubmitted && unexpectedBehaviors.passChoice.focus
                    }
                    defaultChecked={unexpectedBehaviors.passChoice.checked}
                    onClick={unexpectedBehaviors.passChoice.click}
                />
                <label
                    id={`problem-${commandIndex}-true-label`}
                    htmlFor={`problem-${commandIndex}-true`}
                >
                    {unexpectedBehaviors.passChoice.label}
                </label>
            </div>
            <div>
                <input
                    key={`Problem__${commandIndex}__false`}
                    type="radio"
                    id={`problem-${commandIndex}-false`}
                    name={`problem-${commandIndex}`}
                    autoFocus={
                        isSubmitted && unexpectedBehaviors.failChoice.focus
                    }
                    defaultChecked={unexpectedBehaviors.failChoice.checked}
                    onClick={unexpectedBehaviors.failChoice.click}
                />
                <label
                    id={`problem-${commandIndex}-false-label`}
                    htmlFor={`problem-${commandIndex}-false`}
                >
                    {unexpectedBehaviors.failChoice.label}
                </label>
            </div>

            <Fieldset
                className="problem-select"
                hidden={!unexpectedBehaviors.failChoice.checked}
            >
                <legend>{unexpectedBehaviors.failChoice.options.header}</legend>
                {unexpectedBehaviors.failChoice.options.options.map(
                    (option, optionIndex) => {
                        const {
                            checked,
                            focus,
                            description,
                            more,
                            severity,
                            change,
                            severitychange
                        } = option;

                        const descriptionId = description
                            .toLowerCase()
                            .replace(/[.,]/g, '')
                            .replace(/\s+/g, '-');

                        return (
                            <ProblemOptionContainer
                                className={checked ? 'enabled' : ''}
                                key={`AssertionOptionsKey_${optionIndex}`}
                            >
                                {/* Undesirable behavior checkbox */}
                                <Label
                                    key={`${descriptionId}_${commandIndex}__checkbox`}
                                >
                                    <input
                                        type="checkbox"
                                        value={description}
                                        className={`undesirable-${commandIndex}`}
                                        tabIndex={optionIndex === 0 ? 0 : -1}
                                        autoFocus={isSubmitted && focus}
                                        defaultChecked={checked}
                                        onClick={e => change(e.target.checked)}
                                    />
                                    {description} behavior occurred
                                </Label>

                                {/* Severity select */}
                                <Label
                                    key={`${descriptionId}_${commandIndex}__severity`}
                                    className={!checked ? 'off-screen' : ''}
                                    aria-hidden={!checked}
                                >
                                    Impact:
                                    <select
                                        onChange={e =>
                                            severitychange(e.target.value)
                                        }
                                        disabled={!checked}
                                        defaultValue={severity}
                                    >
                                        {severityOptions.map(option => (
                                            <option
                                                key={`${descriptionId}-${commandIndex}-severity-${option}`}
                                                value={option.toUpperCase()}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </Label>

                                {/* Details text input */}
                                {more && (
                                    <>
                                        <Label
                                            key={`${descriptionId}_${commandIndex}__details`}
                                            className={
                                                !checked ? 'off-screen' : ''
                                            }
                                            aria-hidden={!checked}
                                        >
                                            Details:
                                            <input
                                                type="text"
                                                className={`undesirable-${descriptionId.toLowerCase()}-details`}
                                                autoFocus={
                                                    isSubmitted && more.focus
                                                }
                                                value={more.value}
                                                onChange={e =>
                                                    more.change(e.target.value)
                                                }
                                                disabled={!checked}
                                            />
                                            {isSubmitted && (
                                                <Feedback
                                                    className={`${
                                                        more.description[1]
                                                            .required &&
                                                        'required'
                                                    } ${
                                                        more.description[1]
                                                            .highlightRequired &&
                                                        'highlight-required'
                                                    }`}
                                                >
                                                    {
                                                        more.description[1]
                                                            .description
                                                    }
                                                </Feedback>
                                            )}
                                        </Label>
                                    </>
                                )}
                            </ProblemOptionContainer>
                        );
                    }
                )}
            </Fieldset>
        </Fieldset>
    );
};

UnexpectedBehaviorsFieldset.propTypes = {
    commandIndex: PropTypes.number.isRequired,
    unexpectedBehaviors: PropTypes.object.isRequired,
    isSubmitted: PropTypes.bool
};

export default UnexpectedBehaviorsFieldset;
