# Local Development for ARIA-AT Report

## Dependencies
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
The local application uses Docker Compose to create two containers, one for the API server and one for the React application. In these containers, docker will install the appriopriate node packages and run both services. Changes in your working directory will be hot reloaded into the docker containers.

Docker Compose is only meant to be used in local development. A separate process for staging and production will be used.

```
yarn dev  // Runs dev server
```

Now you can navigate your browser to: http://0.0.0.0:3000/
