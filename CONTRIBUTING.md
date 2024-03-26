# Contributing to ARIA-AT App
We want to make contributing to this project as approachable and transparent as possible.
ARIA-AT App is maintained by [Bocoup](https://bocoup.com/) and designed and developed with the [W3C ARIA-AT Community Group](https://www.w3.org/community/aria-at/).

## Code of Conduct
This project is governed by the [Bocoup](https://github.com/w3c/aria-at-app/blob/develop/CODE_OF_CONDUCT.md) and [W3C](https://www.w3.org/Consortium/cepc/) Codes of Conduct.

## Development Process
We use GitHub to host code, track issues and feature requests, and accept pull requests.

## Issues
We use GitHub issues to track bugs, feature requests, and implementation proposals. Report a bug by [opening a new issue](https://github.com/w3c/aria-at-app/issues).

If your issue relates to a specific ARIA-AT test plan or the behavior of the ARIA-AT test renderer, please open an issue in the [aria-at repo](https://github.com/w3c/aria-at/issues).

## Pull Requests
Pull requests are the best way to propose changes to the codebase. We use [GitHub Flow](https://guides.github.com/introduction/flow/index.html) as a development methodology.

If the pull request is not a bug fix, an implementation proposal should first be submitted via a new issue, in order to reach consensus with the maintainers on scope, technical approach, and design implications.

Implementation proposals and pull requests that affect the overall design or user experience of the app may require a design review before implementation.

Pull requests should be small and granular, ideally addressing one issue or feature at a time. Try to keep each pull request independently mergeable. Multiple dependent PRs should only be used when absolutely necessary to land a longer-term change.

In order to open a pull request:

1. Fork the repo and create your branch from `main`.
1. If you've added code that should be tested, add tests. See below for some additional guidance on testing.
1. If you've changed APIs, update the documentation.
1. Ensure the test suite passes.
1. If the pull request is not a bug fix, please link to the related implementation proposal and consensus issue.
1. Submit a pull request!

Maintainers with write access to the repository will create branches directly within the repository.

## Reviewing pull requests, merging, and deploying
All pull requests, including pull requests opened by maintainers, require code review from two maintainers before merging.

The second maintainer who reviews is responsible for merging the pull request into the protected `main` branch.

Maintainers will periodically deploy the `main` branch to the [staging environments](https://github.com/w3c/aria-at-app/wiki).

## Guidance on Testing

We expect PRs for all features to include enough tests to give confidence that new features are working and will continue to work.

100% test coverage is not the expectation. We do not expect contributors to comprehensively test every esoteric failure state. We do expect the happy path and common failure states to be tested.

We provide capabilities for unit testing, integration testing and end-to-end testing. Unit or integration testing every component is not the expectation, since trivial components will be covered by end-to-end tests (for example, the router). On the other hand, non-trivial components should be integration tested (For example, a modal or other application flow control components).

We expect contributors to use the type of testing which corresponds to the architecture of their code. For example, in the case of a utility function, unit tests are preferable to end-to-end testing, because of the complexity of end-to-end which runs a full browser, server and database. On the flipside, attempting to unit test a major set of features like the overall function of the data management page would require so many mocks that end-to-end testing would be the only efficient option.

## Technical incident reporting

The project maintainers keep a record of the technical problems which cause unforeseen interruptions to the service provided by the application in production. These incident reports document the aberrant behavior, the investigation process, and the technical resolution. They are available in [`docs/incident-reports/`](docs/incident-reports).

## License
When you submit code changes, your submissions are understood to be under the same [W3C Document License](https://github.com/w3c/aria-at-app/blob/main/LICENSE.md) that covers the project.
