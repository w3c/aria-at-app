import React from 'react';
import { Feedback, Fieldset } from '@components/TestRenderer';
import PropTypes from 'prop-types';

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

                        return (
                            <Fieldset
                                key={`AssertionOptionsKey_${optionIndex}`}
                                className="undesirable-fieldset"
                            >
                                <legend>{description}</legend>
                                <div>
                                    <input
                                        key={`${description}__${commandIndex}`}
                                        type="checkbox"
                                        value={description}
                                        id={`${description}-${commandIndex}`}
                                        className={`undesirable-${commandIndex}`}
                                        tabIndex={optionIndex === 0 ? 0 : -1}
                                        autoFocus={isSubmitted && focus}
                                        defaultChecked={checked}
                                        onClick={e => change(e.target.checked)}
                                    />
                                    <label
                                        htmlFor={`${description}-${commandIndex}`}
                                    >
                                        Behavior occurred
                                    </label>
                                </div>
                                <div>
                                    <label
                                        htmlFor={`${description}-${commandIndex}-severity`}
                                    >
                                        Impact:
                                    </label>
                                    <select
                                        id={`${description}-${commandIndex}-severity`}
                                        name={`${description}-${commandIndex}-severity`}
                                        onChange={e =>
                                            severitychange(e.target.value)
                                        }
                                        disabled={!checked}
                                        defaultValue={severity}
                                    >
                                        {severityOptions.map(option => (
                                            <option
                                                key={`${description}-${commandIndex}-severity-${option}`}
                                                value={option.toUpperCase()}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {more && (
                                    <div>
                                        <label
                                            htmlFor={`${description}-${commandIndex}-input`}
                                        >
                                            Details:
                                        </label>
                                        <input
                                            key={`${description}__${commandIndex}__input`}
                                            type="text"
                                            id={`${description}-${commandIndex}-input`}
                                            name={`${description}-${commandIndex}-input`}
                                            className={`undesirable-${description.toLowerCase()}-input`}
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
                                                        .required && 'required'
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
                                    </div>
                                )}
                            </Fieldset>
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
