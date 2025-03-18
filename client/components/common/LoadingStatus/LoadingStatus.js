import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Spinner } from 'react-bootstrap';
import BasicModal from '../../common/BasicModal';

const LoadingStatus = ({ message, note, children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message) setIsLoading(true);
    else setIsLoading(false);
  }, [message]);

  return (
    <>
      {isLoading && (
        <BasicModal
          title={message}
          show={true}
          closeButton={false}
          staticBackdrop={true}
          centered={true}
          headerSep={false}
          showFooter={false}
          content={
            <>
              <div
                className={clsx(
                  'indeterminate-loading-container',
                  !!note && 'has-note'
                )}
              >
                <Spinner animation="border" variant="primary" role="status" />
              </div>
              {note && (
                <>
                  <b>Note:</b> {note}
                </>
              )}
            </>
          }
        />
      )}
      {children}
    </>
  );
};

LoadingStatus.propTypes = {
  message: PropTypes.string,
  note: PropTypes.string,
  children: PropTypes.node
};

export default LoadingStatus;
