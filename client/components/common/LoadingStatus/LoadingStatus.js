import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../../common/BasicModal';

const SpinningContainer = styled.div`
  display: flex;
  justify-content: center;
  ${props => props.hasNote && `margin-bottom: 2rem;`}
`;

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
              <SpinningContainer hasNote={!!note}>
                <Spinner
                  animation="border"
                  variant="primary"
                  role="status"
                  style={{
                    width: '50px',
                    height: '50px'
                  }}
                />
              </SpinningContainer>
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
