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
3. Run the server
    ```
    yarn dev
    ```
Now you can navigate your browser to: [http://localhost:3000/](http://localhost:3000/). You need to use localhost instead of `0.0.0.0` because the cookie needs to be treated as secure.

### Signing in as a tester, admin, or vendor

ARIA-AT App determines if you are authorized to sign in as an admin, tester, or vendor based on whether your Github username is listed in the admins.txt, testers.txt, or vendors.txt file.

Another way to log in as either a tester or admin, useful for quick testing and not requiring editing testers.txt or membership within any GitHub organizations or teams, is described below.

1. Sign out and return to the home page.
2. Add `?fakeRole=admin` to the URL bar and press enter. Alternatively use `?fakeRole=tester` to log in as a tester only or `?fakeRole=` to preview logging in without a role.
3. Follow the sign in steps as normal.
4. After signing in, your selected role will be used for the duration of your session.

This functionality is available in development environments where the ALLOW_FAKE_ROLE environment variable is "true".

## Debugging

Instead of running `yarn dev` to start the local environment run `yarn run dev-debug`.

This will add [express debugging](https://expressjs.com/en/guide/debugging.html)
to information about routes, middleware and the request response cycle.

Additionally it adds the ability for you use Chrome DevTools and a
`debugger` to step through code via Node's built-in
[inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/). Navigate to [chrome://inspect/#devices](chrome://inspect/#devices) and open the
dedicated DevTools for Node.

## GraphQL Playground

To use the GraphQL playground, go to `/api/graphql` while the dev server is running.

## Testing

### Running all tests

Setup the test database by running the commands in [database.md](./database.md).

The following command runs the linter, formatter and Jest tests, all at once.

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
