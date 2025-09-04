# ARIA and Assistive Technologies App (ARIA-AT App)
## ARIA-AT APP
ARIA-AT aims to improve interoperability between different Assistive Technologies (ATs) in how they render ARIA patterns. This is achieved through running manual tests and presenting test results to AT vendors. The tests are based on examples from [WAI-ARIA Authoring Practices](https://w3c.github.io/aria-practices/), and are vetted with stakeholders following the [Working Mode](https://github.com/w3c/aria-at/wiki/Working-Mode) process. This project is managed by the [ARIA-AT Community Group](https://www.w3.org/groups/cg/aria-at) in coordination with the [Authoring Practices Task Force](https://www.w3.org/WAI/ARIA/task-forces/practices/) of the [ARIA Working Group](http://www.w3.org/WAI/ARIA/). The W3C staff contact is Daniel Montalvo.

This app includes a reports page that shows the public results of manual testing across various browser / AT combinations. The app is also used by manual testers

## About this Software
This repo contains the software for running the web application that manages testers to run the manual tests, launches the tests in an iframe, stores results, and reports results once they are reviewed. This software is implemented on a react, node, express, sequelize, and postgresql stack. This repo also contains the ansible scripts for provisioning and deploying the software.

The test material and test harness themselves are managed in [w3c/aria-at](https://github.com/w3c/aria-at).

## How to run this code
Documentation for getting this software running locally is available in [docs/local-development.md](docs/local-development.md) directory.

## Get involved
* Join the [community group](https://www.w3.org/community/aria-at/)
* [Sign up as a tester](https://github.com/w3c/aria-at/issues/162) for the Pilot Test (May 27 - June 2)
* [Write more tests](https://github.com/w3c/aria-at/wiki/How-to-contribute-tests)
* [Review the assertions of existing test plans](https://w3c.github.io/aria-at/review-test-plans/)
* [Review test results](https://w3c.github.io/aria-at/results/)
* Fix a [good first issue](https://github.com/w3c/aria-at/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

## Conduct
All contributors to this project are expected to adhere to the Code of Conduct, available in the file named CODE_OF_CONDUCT.md.

## License
All documents in this Repository are licensed by contributors
under the
[W3C Document License](https://www.w3.org/Consortium/Legal/copyright-documents).
