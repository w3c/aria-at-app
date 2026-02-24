# Automation setup and configuration

This project makes use of an external github repository [aria-at-gh-actions-helper](https://github.com/w3c/aria-at-gh-actions-helper) to launch github actions that run the automation suite.
More documentation about the tools used in that repository are in it's [README](https://github.com/w3c/aria-at-gh-actions-helper/README.md).

## GitHub Workflow Automation Configuration

The following environment variables must be set in the environment configuration file (e.g. `deploy/files/config-staging.env`):

- `GITHUB_APP_ID` — The GitHub App ID for generating access tokens to dispatch workflows to the actions-helper repository, assigned by GitHub when the app is created.
- `GITHUB_APP_INSTALLATION_ID` — The installation ID for the GitHub App on the target organization.
- `GITHUB_APP_PRIVATE_KEY` — The GitHub App's PEM private key, base64-encoded: `base64 < private-key.pem`.
- `GITHUB_WORKFLOW_REPO` — The repository containing the workflow files (e.g. `w3c/aria-at-gh-actions-helper`).
- `AUTOMATION_CALLBACK_FQDN` — A **fully qualified domain name** that is accessible from the GitHub workflow server, pointing at the running instance of aria-at-app.
- For **local development** testing of these features, a forwarding proxy server like `ngrok` is recommended: `npx ngrok http 3000 --host-header=rewrite` will setup a server forwarding to your local 3000 development port. You can then use the domain it gives you when launching the app: `AUTOMATION_CALLBACK_FQDN=128935b17294.ngrok.app yarn dev`
