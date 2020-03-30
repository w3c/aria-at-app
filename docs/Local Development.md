# Local Development for ARIA-AT Report

## Dependencies
- Node
  - Version 10.13.0 or greater
- Yarn
  Yarn is resposible for installing dependencies, similar to npm. This project is utilizing yarn workspaces to organize the code into a monorepo structure.
  - macOS
    ```
    brew install yarn
    ```
  - Linux
    - See [yarn documentation](https://classic.yarnpkg.com/en/docs/install/#debian-stable)

## Running local application

### Set up local database

Follow the instructions provided in [Database.md](https://github.com/bocoup/aria-at-report/blob/master/docs/Database.md).

### Install Dependencies with Yarn
Before running the application or its testing environment, make sure to install all dependencies with the following:
```
yarn install
```

### Local Environment
```
yarn dev  // Runs dev server
```

Now you can navigate your browser to: http://0.0.0.0:3000/

## Sandboxing UI Components with Storybook
Client side React UI components can be prototyped on [Storybook](https://storybook.js.org/). Storybook is a tool that allows developers to create components outside of the overall application system.

The following command runs the storybook server:
```
yarn storybook
```

If Storybook components will be shared as static files, run:
```
yarn workspace client build-storybook
```

## Testing

### Running all tests in a single pass
The following command encompasses running the linter, formatter, Jest tests, and Lighthouse accessibility checks only once.
```
yarn test
```

### Install Dependencies with Yarn
Before running the application or its testing environment, make sure to install all dependencies with the following:
```
yarn install
```

### Linting and formatting
* Code linting is performed by **ESLint**. To manually run ESLint:
```
yarn lint
```
* Code formatting is performed by **Prettier**. To manually run Prettier:
```
yarn prettier
```
### Running tests locally
* React application tests are located in `client/tests`. 
* Express server tests are located in `server/tests`.
* Both the client and server side user **Jest** for testing.
  * The client side, additionally, uses **Enzyme** to test React output
  * The server side, additionally, user **Supertest** to test HTTP integration

#### Manually Running Jest
The following command will run all the tests once.
```
yarn jest
```

If running the tests on demand, in a hot-loaded way, run the following for each workspace with the --watchAll command. The downside to this approach is that separate terminals have to be used to run each command.
```
# Run all client tests and watch for changes
yarn workspace client jest --watchAll

# Run all server tests and watch from changes
yarn workspace server jest --watchAll
```

### Running accessibility tests
[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is used for automated accessibility testing of the React application. It has also been integrated into the CI workflow To run the Lighthouse tests, run:
```
yarn a11y
```

## Best Practices
* Before submitting a pull request, please run `yarn test` to ensure formatting, linting, and passing tests. The CI system will pick up on failing tests, in addition to local testing.