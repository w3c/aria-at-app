import React from 'react';
import { Container } from 'react-bootstrap';

const SignupInstructions = () => {
  return (
    <Container id="main" as="main" tabIndex="-1">
      <p>
        You are not yet registered to participate! Let us know you want to help
        by&nbsp;
        <a href="https://github.com/w3c/aria-at-app/issues/new">
          opening an issue on GitHub
        </a>
        .
      </p>
    </Container>
  );
};

export default SignupInstructions;
