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

### Signing in as a tester and/or admin

ARIA-AT App determines whether you are authorized to sign in as a tester or admin based on whether you are a member of the official tester or admin teams within the W3C GitHub organization. The GitHub organization and team names can be changed by altering the app's environment variables, and there are dedicated teams for each app environment.

Another way to log in as either a tester or admin, useful for quick testing and not requiring membership within any GitHub organizations or teams, is described below.

1. Sign out and return to the home page.
2. Add `?fakeRole=admin` to the URL bar and press enter. Alternatively use `?fakeRole=tester` to log in as a tester only or `?fakeRole=` to preview logging in without a role.
3. Follow the sign in steps as normal.
4. After signing in, your selected role will be used for the duration of your session.

This functionality is available in development environments where the ALLOW_FAKE_ROLE environment variable is "true".

## Debugging

Instead of running `yarn dev` to start the local enviornment run `yarn run dev-debug`.

This will add [express debuging](https://expressjs.com/en/guide/debugging.html)
to information about routes, middleware and the request responce cycle.

Additionally it adds the the ability for you use chrome dev tools and a
`debbuger` to step through code via node's build in
[inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/). Just
navigate to [chrome://inspect/#devices](chrome://inspect/#devices) and open the
dedicated dev tools for node.

## GraphQL Playground

To use the GraphQL playground, go to `/api/graphql` while the dev server is running.

## Testing

### Running all tests

Setup the test database by running the following commands:
    ```
    yarn db-init:test
    yarn sequelize:test db:migrate
    yarn sequelize:test db:seed:all
    ```

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

### Accessibility testing

#### Manual accessibilty testings

There are some automatable accessibility checks, but the only real way to know whether a webpage is accessible is to access it with a screen reader.

If you have a linux computer, you will have to download a Windows VM in order to test the application with NVDA or JAWS. Here are the basic instructions:
* Enable virtualization in your BIOS settings
* Download [VirtualBox](http://download.virtualbox.org/virtualbox/)
* Download a [Windows VM](https://developer.microsoft.com/en-us/windows/downloads/virtual-machines)
* Import the downloaded VM with the default settings.
* Start the virtual machine and download JAWS or NVDA.
* Click the windows button and type "notepad" and click "Run Notepad as administrator"
    * Click "File > Open" and open the file: `Windows\system32\drivers\etc\hosts`
    * Add the following lines to the end of the file:
    ```
    10.0.2.2       localhost
    10.0.2.2       127.0.0.1
    ```
* Click the windows button and type "command" and click "Run Command Prompt as administrator"
    * Then write the following commands:
    ```
    netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=3000 connectaddress=10.0.2.2 connectport=3000
    netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=5000 connectaddress=10.0.2.2 connectport=5000
    ```
* Now open your browser, and navigate to: `localhost:3000` and log in, and turn
  on the screen reader. There are several helpful [guides](https://dequeuniversity.com/screenreaders/) to the keyboard shortcuts used. 


#### Automated accessibility tests

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is used for automated accessibility testing of the React application. It has also been integrated into the CI workflow To run the Lighthouse tests, run:
    ```
    yarn a11y
    ```

## Best Practices

Before submitting a pull request, please run `yarn test` to ensure formatting, linting, and passing tests. The CI system will pick up on failing tests, in addition to local testing.
