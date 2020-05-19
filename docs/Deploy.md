# Deploying

## Prerequisite

- Install [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-ansible) which is used to deploy the application.
- Get a copy of `ansible-vault-password.txt`
- Get a copy of the private key used to access the server get your own public
  key placed on the server

## Testing the deploy with Vagrant

You can test that a deploy will function by running the deploy in a vagrant that
closely matches that of staging and production.

First install [vagrant](https://www.vagrantup.com/docs/installation/).

Copy your `ansible-vault-password.txt` to `deploy/ansible-vault-password.txt`.

Start the vagrant by running `vagrant up`.

If you make any changes locally and want to run them again `vagrant rsync &&
vagrant up --provision`.

If you want to debug you can run `vagrant ssh` to ssh into the vagrant box. You
can view logging from ansible with `sudo -i cat /var/log/messages`.

Once the vagrant box is up you can test by running by going to the ip configured
in the `Vagrantfile` [192.168.10.40](192.168.10.40).

## Updating passwords

If you need to update a password to the staging server use ansible vault like:
`ansible-vault decrypt deploy/files/config-staging.env`.

## How to deploy

0. Get the prerequisites.

1. Get a copy of the ansible vault password and place it at `deploy/ansible-vault-password.txt`.

2. `cd deploy`

3. `ansible-playbook provision.yml --inventory inventory/staging.yml`

4. Check if this has been working `http://aria-at-staging.w3.org/`
