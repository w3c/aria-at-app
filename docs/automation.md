# Automation setup and configuration

This project makes use of an external github repository [aria-at-gh-actions-helper](https://github.com/bocoup/aria-at-gh-actions-helper) to launch github actions that run the automation suite.
More documentation about the tools used in that repository are in it's [README](https://github.com/bocoup/aria-at-gh-actions-helper/README.md).
This repository also has a second copy [aria-at-gh-actions-helper-dev](https://github.com/bocoup/aria-at-gh-actions-helper-dev) which is used in the staging or local environments by default to not get in the way of the queue for the live service.

## GitHub Workflow Automation Configuration

- The `jwt-signing-key.pem` file should be located in the project root folder. Obtain `ansible-vault-password.txt` from a project administrator and place it in the `deploy` folder. From within the `deploy` folder, you can run `ansible-vault view --vault-password-file ansible-vault-password.txt files/jwt-signing-key.pem.enc > ../jwt-signing-key.pem` to decrypt the configuration file.
- The `AUTOMATION_CALLBACK_FQDN` environment variable in the environment configuration file should be a **fully qualified domain name** that is accessible from the github workflow server pointing at the running instance of aria-at-app.
- For **local development** testing of these features, a forwarding proxy server like `ngrok` is recommended: `npx ngrok http 3000 --host-header=rewrite` will setup a server forwarding to your local 3000 development port. You can then use the domain it gives you when launching the app: `AUTOMATION_CALLBACK_FQDN=128935b17294.ngrok.app yarn dev`
