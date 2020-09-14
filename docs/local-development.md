# Local Development for ARIA-AT Report

## Dependencies
1. Node
    - Version >= 10.13.0 and < 13
    - It is recommended to install node with [`nvm`](https://github.com/nvm-sh/nvm)
2. Yarn
    - Yarn is resposible for installing dependencies, similar to npm. This project is utilizing yarn workspaces to organize the code into a monorepo structure.
    - For macOS, use: `brew install yarn`
    - For linux, See [yarn documentation](https://classic.yarnpkg.com/en/docs/install/#debian-stable)

## Running the application locally

1. Install Dependencies with Yarn
    ```
    yarn install
    ```
2. Set up local database using the instructions provided in [database.md](database.md).
3. Run the server
    ```
    yarn dev
    ```
Now you can navigate your browser to: [http://localhost:3000/](http://localhost:3000/). You need to use localhost instead of `0.0.0.0` because the cookie needs to be treated as secure.

## Debugging

Instead of running `yarn dev` to start the local enviornment run `yarn run dev-debug`.

This will add [express debuging](https://expressjs.com/en/guide/debugging.html)
to information about routes, middleware and the request responce cycle.

Additionally it adds the the ability for you use chrome dev tools and a
`debbuger` to step through code via node's build in
[inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/). Just
navigate to (chrome://inspect/#devices)[chrome://inspect/#devices] and open the
dedicated dev tools for node.

## Testing

### Running all tests

The following command encompasses running the linter, formatter, Jest tests, and Lighthouse accessibility checks only once.
    ```
    yarn test
    ```

### Linting and formatting

Code linting is performed by **ESLint**. To manually run ESLint:
    ```
    yarn lint
    ```

Code formatting is performed by **Prettier**. To manually run Prettier:
    ```
    yarn prettier
    ```

### Unit tests

* React application tests are located in `client/tests`.
* Express server tests are located in `server/tests`.
* Both the client and server side user **Jest** for testing.
    * The client side, additionally, uses **Enzyme** to test React output
    * The server side, additionally, user **Supertest** to test HTTP integration

The following command will run all unit tests.
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


### Accessibility tests

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is used for automated accessibility testing of the React application. It has also been integrated into the CI workflow To run the Lighthouse tests, run:
    ```
    yarn a11y
    ```

## Best Practices

Before submitting a pull request, please run `yarn test` to ensure formatting, linting, and passing tests. The CI system will pick up on failing tests, in addition to local testing.
