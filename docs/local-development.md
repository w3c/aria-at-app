# Local Development for ARIA-AT Report

## Dependencies
- Node
  - Version >= 10.13.0 and < 13
  - It is recommended to install node with [`nvm`](https://github.com/nvm-sh/nvm)
- Yarn
  Yarn is resposible for installing dependencies, similar to npm. This project is utilizing yarn workspaces to organize the code into a monorepo structure.
  - macOS
    ```
    brew install yarn
    ```
  - Linux
    - See [yarn documentation](https://classic.yarnpkg.com/en/docs/install/#debian-stable)

## Running local application

### Install Dependencies with Yarn
Before running the application or its testing environment, make sure to install all dependencies with the following:
```
yarn install
```

### Set up local database

Follow the instructions provided in [database.md](database.md).

### Set up aria-at-tests folder (workaround)
The application does not dynamically load the ARIA-AT tests onto the application's machine for iframe rendering. The following is a workaround solution until dynamic importing is implemented.

1. Create `aria-at-tests` folder
Make a directory called `aria-at-tests` next to the `aria-at-app` repository, and `cd` into it.
```
# Assuming in aria-at-app folder
cd ../
mkdir aria-at-tests
cd aria-at-tests
```

2. Clone the ARIA-AT repo into a folder with the SHA
If the latest SHA is `fd04dbd11c30d11f811232afa0c9efdded395c5c`, then do the following (as an example)
```
cd aria-at-tests
git clone git@github.com:w3c/aria-at.git fd04dbd11c30d11f811232afa0c9efdded395c5c
cd fd04dbd11c30d11f811232afa0c9efdded395c5c
git reset --hard fd04dbd11c30d11f811232afa0c9efdded395c5c
```

3. Run the app as usual

4. Repeat the above steps every time the latest tests are imported.


### Local Environment
```
yarn dev  // Runs dev server
```

Now you can navigate your browser to: http://0.0.0.0:3000/

### Debugging

Instead of running `yarn dev` to start the local enviornment run `yarn run dev-debug`.

This will add [express debuging](https://expressjs.com/en/guide/debugging.html)
to information about routes, middleware and the request responce cycle.

Additionally it adds the the ability for you use chrome dev tools and a
`debbuger` to step through code via node's build in
[inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/). Just
navigate to (chrome://inspect/#devices)[chrome://inspect/#devices] and open the
dedicated dev tools for node.

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
