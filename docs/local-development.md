# Local Development for ARIA-AT Report

## Dependencies

1. Node
    - Version 14 or greater
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
    - Note: You must run `yarn db-import-tests:dev` after setting up your database to import the latest test harness into
      your project.
3. Run the server
    ```
    yarn dev
    ```
Now you can navigate your browser to: [http://localhost:3000/](http://localhost:3000/). You need to use localhost instead of `0.0.0.0` because the cookie needs to be treated as secure.

### Signing in as a tester, admin, or vendor

ARIA-AT App determines if you are authorized to sign in as an admin, tester, or vendor based on whether your Github username is listed in the admins.txt, testers.txt, or vendors.txt file.

Another way to log in as either a tester or admin, useful for quick testing and not requiring editing testers.txt or membership within any GitHub organizations or teams, is described below.

1. With the app running, open the browser DevTools.
2. Go to the DevTools console.
3. Paste in the following code:
    - To become an admin:
        ```
          signMeInAsAdmin("joe-the-admin")
        ```
    - To become a tester:
        ```
          signMeInAsTester("joe-the-tester")
        ```
    - To become a vendor:
        ```
          signMeInAsVendor("joe-the-vendor")
        ```

The part in quotes is the username, feel free to change the username to whatever you prefer.

This functionality is available in development environments where the ALLOW_FAKE_USER environment variable is "true".

## Debugging

### Debugging the Client

Follow the below steps to debug the client:

- Insert a `debugger` statement at the line you wish to debug.
- Open DevTools in Chrome.
- Use the app until you trigger the line of code with the debugger statement. The app will pause on the given line.

### Debugging the Server

Follow the below steps to debug the server:

- Instead of running `yarn dev` to start the local environment, run `yarn run dev-debug`.
- Using VSCode, add a breakpoint to a line of code you wish to debug.
- Open the command pallete and choose the "Attach to Node process" command, and from the menu choose the `yarn dev-debug` process.
- Use the app until the given line of code runs, and the app will pause on the breakpoint.

### Debugging Unit and Integration Tests

- Using VSCode, set a breakpoint.
- Open the test suite file you wish to debug and *make sure the file is the active tab*.
- Open the "Run and Debug" sidebar.
- Choose "Jest Client Debug Current Test" if you wish to debug a client test, or "Jest Server Debug Current Test" if you wish to debug a server test.
- The debugger will trigger when it hits the line with a breakpoint.

### Debugging End-To-End Tests

- In order to debug the test code, follow the instructions for debugging unit tests.
- To debug client code, insert a debugger statement at the desired location, then follow the instructions for debugging unit tests. A test browser app will open. Run the test until you trigger the desired line.
- To debug server code, add two breakpoints, one to the server code you wish to debug and one to the first line of the desired test. When the debugger pauses on the first line of the test, open the command palette and choose "Attach to Node process" and choose the `dev-debug` process.
- Hit play and the debugger will pause on your breakpoint.

## GraphQL Playground

To use the GraphQL playground, go to `/api/graphql` while the dev server is running.

## Testing

Please see CONTRIBUTING.md for some additional information regarding the expectations around testing.

### Running All Tests

Set up the test database by running the commands in [database.md](./database.md).

The following command runs the linter, formatter and Jest tests, all at once.

```
yarn test
```

### Linting and Formatting

Code linting is performed by **ESLint**. To manually run ESLint:

```
yarn lint
```

Code formatting is performed by **Prettier**. To manually run Prettier:

```
yarn prettier
```

### Unit Tests

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

### End-To-End Tests

Like unit tests, end-to-end tests are run by Jest, and the commands which run Jest tests should be used to run end-to-end tests as well.

### Previewing components with Storybook
Storybook is a tool for building out UI components. To start the Storybook server, run:
```
yarn storybook
```

#### Writing stories
- Make a new file in `client/stories` with the format `<component>.stories.jsx`. 
- Run the Storybook server

Any changes in the component will be picked up by the Storybook server.

### Accessibility testing

#### Manual accessibilty testing

Please note that this section may be out of date.

If you have a Linux computer, you will have to download a Windows VM in order to test the application with NVDA or JAWS. Here are the basic instructions:
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
    netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=8000 connectaddress=10.0.2.2 connectport=8000
    ```
* Now open your browser, and navigate to: `localhost:3000` and log in, and turn
  on the screen reader. There are several helpful [guides](https://dequeuniversity.com/screenreaders/) to the keyboard shortcuts used. 


#### Automated accessibility tests

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is used for automated accessibility testing of the React application. It has also been integrated into the CI workflow. To run the Lighthouse tests, run:

```
yarn a11y
```

## Best Practices

Before submitting a pull request, run `yarn test` to make sure the linters and tests are passing. After opening a PR the GitHub Actions CI system will automatically verify the linters and tests are passing.
