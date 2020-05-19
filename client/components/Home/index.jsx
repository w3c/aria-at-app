import React, { Component, Fragment } from 'react';

class Home extends Component {
    render() {
        return (
          <Fragment>
              <h2>About this project</h2>
              <p>ARIA AT aims to improve interoperability between different Assistive Technologies (ATs) in how they render ARIA patterns. This is achieved through running manual tests and presenting test results to AT vendors. The tests are based on examples from WAI-ARIA Authoring Practices, and are vetted with stakeholders following the working mode process.</p>

              <h2>Get involved</h2>
              <ul>
                <li><a href="https://www.w3.org/community/aria-at/">Join the community group</a></li>
                <li><a>Sign up as a tester</a></li>
                <li><a>Write more tests</a></li>
                <li><a>Review the assertions of existing test plans</a></li>
                <li><a>Review test results</a></li>
                <li><a>Fix a good first issue</a></li>
              </ul>
          </Fragment>
        );
    }
}

export default Home;
