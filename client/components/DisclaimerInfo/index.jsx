import React, { useState } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
    display: flex;
    flex-direction: column;

    font-size: 1rem;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    background: #f7f7f7;

    border: 2px solid #d3d5d9;
    border-radius: 0.5rem;

    details {
        font-weight: normal;
        font-size: 1rem;

        span > ol {
            margin-bottom: 0;
        }

        summary {
            width: fit-content;

            list-style: none;

            font-weight: bold;
            text-align: left;
            border: thin solid transparent;
            background-color: transparent;

            :hover,
            :focus {
                background-color: #eee;
            }

            ::-webkit-details-marker {
                display: none;
            }
        }
    }

    &.yellow {
        background-color: #fff2d2;
        border-color: #f2d691;
        summary:hover,
        summary:focus {
            background-color: #f5e3b9;
        }
        .fa-exclamation-circle {
            color: #765c1c;
        }
    }
`;

const defaultTitle = 'Unapproved Report';
const defaultMessageContent = (
    <>
        The information in this report is generated from candidate tests.
        Candidate aria-at tests are in review by assistive technology developers
        and lack consensus regarding:
        <ol>
            <li>applicability and validity of the tests, and</li>
            <li>accuracy of test results.</li>
        </ol>
    </>
);

const DisclaimerInfo = ({
    title = defaultTitle,
    messageContent = defaultMessageContent,
    colorClassName = ''
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Container className={colorClassName}>
            <details>
                <summary
                    id="disclaimer-title"
                    aria-expanded={expanded}
                    aria-controls="description"
                    onClick={() => setExpanded(!expanded)}
                    aria-label={`Warning! ${title}`}
                >
                    <FontAwesomeIcon
                        icon={faExclamationCircle}
                        color="#94979b"
                        size="lg"
                        aria-hidden={true}
                    />
                    {title}
                </summary>
                {messageContent}
            </details>
        </Container>
    );
};

DisclaimerInfo.propTypes = {
    title: PropTypes.string,
    messageContent: PropTypes.node,
    colorClassName: PropTypes.oneOf(['yellow'])
};

export { defaultTitle, defaultMessageContent };
export default DisclaimerInfo;
