import React from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

const NotFound = () => {
  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>Page Not Found | ARIA-AT</title>
      </Helmet>
      <section className="not-found">
        <div>
          <h1>Whoops! Page not found</h1>
        </div>
      </section>
    </Container>
  );
};

export default NotFound;
