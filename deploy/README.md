# Results collection system configuration

This subdirectory defines the procedure used to provision and deploy systems
for running the test results collection mechanism for Aria-AT. The process is
facilitated by [the Ansible configuration management
tool](https://www.ansible.com/).

Because the system must access private infrastructure, some aspects of the
process cannot be shared publicly. The private information is included in this
repository in encrypted form.

## Local development (for project contributors)

To support local development and functional testing, a
[Vagrant](https://www.vagrantup.com/)-mediated
[VirtualBox](https://www.virtualbox.org/) virtual machine is also available. On Vagrant up and destroy, sudo access is required.

This does not rely on any private infrastructure, so any contributor may follow
these instructions. This will require some manual modification of the
configuration files. Those unfamiliar with Ansible may contact the project
maintainers for more detailed instructions. Note that the resulting virtual
machine will not have all the capabilities of the production system.

1. Install [Vagrant](https://www.vagrantup.com/) (version 2) and
   [VirtualBox](https://www.virtualbox.org/) (version 5.2)
2. Install vagrant-hostsupdater
    ```
    vagrant plugin install vagrant-hostsupdater
    ```
3. Open a terminal and navigate to the directory containing this text file
4. Run the following command:
    ```
    vagrant up
    ```
This will initiate the creation of a virtual machine. You will be prompted for your sudo password. Further documentation on using Vagrant can be found in [the "Getting Started" guide by the maintainers of that project](https://www.vagrantup.com/intro/getting-started/index.html).

Once the vagrant box is up you can test by running by going to the ip configured
in the `Vagrantfile` [192.168.10.40](192.168.10.40).

If you make any changes locally and want to run them again:
    ```
    vagrant rsync && vagrant up --provision
    ```

If you want to debug you can run `vagrant ssh` to ssh into the vagrant box. You
can view logging from ansible with `sudo -i cat /var/log/messages`.

## Deployment

To deploy this project to  server:

1. Obtain an authorized key and add it to your keychain. This is needed for deploys to Staging and Production. 
  - The shared key is named `aria-at-bocoup`.
  - Place it in the ~/.ssh directory.
  - For security, set permissions on the key file, which is required by the OS: `chmod 600 ~/.ssh/aria-at-bocoup`.
  - Add it to your keychain with the following command: `ssh-add ~/.ssh/aria-at-bocoup`.
  - Run `ssh root@aria-at-staging.w3.org` and `ssh root@aria-at.w3.org` to verify that you can connect to the servers.
2. Bocoup maintains its own instance of the app on its internal infrastructure for quick and easy testing. Note that you must be a Bocouper to deploy to this environment. Follow the steps below to verify you are able to connect.
  - Run `ssh aria-at-app-sandbox.bocoup.com` and confirm you can connect.
  - Confirm that `sudo su` successfully switches you to the root user. You will need to enter the sodoer password you chose during your Bocoup onboarding. This password will be required when deploying to the Sandbox.
3. Obtain a copy of the `ansible-vault-password.txt` file in LastPass and place it in the directory which contains this document.
4. Install [Ansible](https://www.ansible.com/) version 2.11. Instructions for macOS are as follows:
  - Install Ansible at the specific 2.11 version: `python3 -m pip install --user ansible-core==2.11.1`
  - Add the following line to your `~/.zshrc` file, changing the path below to match where Python installs Ansible for you:
    ```
    export PATH=$PATH:/Users/Luigi/Library/Python/3.9/bin
    ```
  - Run `source ~/.zshrc` to refresh your shell.
  - Run `ansible --version` to verify your ansible is on version 2.11.
5. Execute the following command from the deploy directory:
   - Sandbox:
    ```
    ansible-playbook provision.yml --inventory inventory/sandbox.yml
    ```
   - Staging:
    ```
    ansible-playbook provision.yml --inventory inventory/staging.yml
    ```
   - Production:
    ```
    ansible-playbook provision.yml --inventory inventory/production.yml
    ```

## Environment Configuration

Configuration files are located in the `files/` folder. Each config file is in the format `config-<environment>.env`

Command to edit encrypted files (must be run in the deploy folder):

```
ansible-vault edit files/config-sandbox.env
```

## Manual DB Backup
From the `deploy` folder:

1. Retrieve the database user (aka PGUSER) and database password (aka PGPASSWORD), the environment is `production` or `staging`.
   `ansible-vault view --vault-password-file ansible-vault-password.txt files/config-<environment>.env`
2. Ssh into the machine. The deploy key will be at `~/.ssh/aria-at-bocoup`, if you followed the deploy setup instructions. The domain is `aria-at.w3.org` for production and `aria-at-staging.w3.org` for staging.
  `ssh -i <deploy key> root@<domain>`
3. Create the backup and save it to a file. After running the command, the terminal prompt will ask for the PGPASSWORD. Use the current date for the timestamp, e.g. `20230406`. Run
  `pg_dump -U <value for PGUSER> -h localhost -d aria_at_report > <environment>_dump_<timestamp>.sql`. 
4. From another terminal window that's not connected to the server, copy the backup to your machine.
  `scp -i <deploy key> root@<domain>:<environment>_dump_<timestamp>.sql .`

## Database Restore
1. Ssh into the machine.
  `ssh -i <deploy key> root@aria-at.w3.org`
2. Load the backup that was created
  `psql -d aria_at_report -f <environment>_dump_<timestamp>.sql`

## Github Workflow Automation Configuration
* The `jwt-signing-key.pem` file should be located in the project root folder.
  From within the `deploy` folder, you can run `ansible-vault view --vault-password-file ansible-vault-password.txt files/jwt-signing-key.pem.enc > ../jwt-signing-key.pem` to decrypt the configuration file.
* The `AUTOMATION_CALLBACK_FQDN` environment variable in the environment configuration file should be a **fully qualified domain name** that is accessible from the github workflow server pointing at the running instance of aria-at-app.  For local development testing of these features, a forwarding proxy server like `ngrok` is recommended: `npx ngrok http 3000 --host-header=rewrite` will setup a server forwarding to your local 3000 development port.  You can then use the domain it gives you when launching the app:
  `AUTOMATION_CALLBACK_FQDN=128935b17294.ngrok.app yarn dev`
