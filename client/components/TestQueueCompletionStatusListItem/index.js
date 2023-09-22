import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import BotTestCompletionStatus from './BotTestCompletionStatus';

const TestQueueCompletionStatusListItem = props => {
    const { testResultsLength, tester, runnableTestsLength, id } = props;

    const isBot = useMemo(
        () => tester.username.toLowerCase().slice(-3) === 'bot',
        [tester]
    );

    const renderTesterInfo = () => {
        if (isBot) {
            return (
                <span aria-describedby={id}>
                    <FontAwesomeIcon icon={faRobot} />
                    {tester.username}
                </span>
            );
        } else {
            return (
                <a
                    href={`https://github.com/` + `${tester.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Allows ATs to read the number of
                    // completed tests when tabbing to this
                    // link
                    aria-describedby={id}
                >
                    {tester.username}
                </a>
            );
        }
    };

    const renderTestCompletionStatus = () => {
        if (isBot) {
            return <BotTestCompletionStatus {...props} />;
        } else {
            return (
                <div id={id}>
                    {`${testResultsLength} of ${runnableTestsLength} tests complete`}
                </div>
            );
        }
    };

    return (
        <li>
            {renderTesterInfo()}
            {renderTestCompletionStatus()}
        </li>
    );
};

TestQueueCompletionStatusListItem.propTypes = {
    testResultsLength: PropTypes.number.isRequired,
    tester: PropTypes.shape({
        username: PropTypes.string.isRequired
    }).isRequired,
    runnableTestsLength: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    testPlanRunId: PropTypes.string.isRequired,
    testPlanVersionId: PropTypes.string.isRequired
};

export default TestQueueCompletionStatusListItem;
