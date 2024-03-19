import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../../common/BasicModal';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const LoadingStatus = ({ message, children }) => {
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
            <Container>
              <Spinner
                animation="border"
                variant="primary"
                role="status"
                style={{
                  width: '50px',
                  height: '50px'
                }}
              />
            </Container>
          }
        />
      )}
      {children}
    </>
  );
};

LoadingStatus.propTypes = {
  message: PropTypes.string,
  children: PropTypes.node
};

export default LoadingStatus;
