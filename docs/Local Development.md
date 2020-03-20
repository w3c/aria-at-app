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
- docker
  - Linux
    - See [docker documentation](https://docs.docker.com/install/linux/docker-ce/debian/#install-docker-ce) (make sure to follow the instructions for the appropriate linux repository).
    - Yarn will run docker NOT as root, so you also must follow [these instructions](https://docs.docker.com/install/linux/linux-postinstall/) to create the user group "docker" and add your user to it.
- docker-compose
   - Linux
     - See [docker-compose documentation](https://docs.docker.com/compose/install/).

## Running local application

### Install Dependencies with Yarn
Before running the application or its testing environment, make sure to install all dependencies with the following:
```
yarn install
```

### Local Environment with Docker

The local application uses Docker Compose to create two containers, one for the API server and one for the React application. In these containers, docker will install the appriopriate node packages and run both services. Changes in your working directory will be hot reloaded into the docker containers.

Docker Compose is only meant to be used in local development. A separate process for staging and production will be used.

```
yarn dev  // Runs dev server
```

Now you can navigate your browser to: http://0.0.0.0:3000/

## Testing

### Running all tests in a single pass
The following command encompasses running the linter, formatter, and testing suite only once.
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

### *Beta*: Watch all client and server tests in a single window using docker
All the client and server tests can be run in a docker container with the following:
```
yarn testAll
```
*The downside to this is that the tests only register changes about every 10 seconds. It is very slow.*

To edit the docker test configuration, modify `docker-compose.test.yml`.

## Best Practices
* Before submitting a pull request, please run `yarn test` to ensure formatting, linting, and passing tests. The CI system will pick up on failing tests, in addition to local testing.