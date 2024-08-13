import React from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

const TestQueueConflicts = () => {
  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>Conflicts | ARIA-AT</title>
      </Helmet>
      <h1>Test Queue Conflicts</h1>
    </Container>
  );
};

export default TestQueueConflicts;
