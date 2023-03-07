# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = '2'

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = 'debian/buster64'

  config.vm.provider "virtualbox" do |v|
    v.memory = 4096
    v.cpus = 2
  end

  config.vm.synced_folder '.', '/vagrant', type: 'rsync',
    rsync__exclude: ['node_modules/', 'client/dist/'],
    rsync__args: ['-r', '--perms', '--chmod=Du=rwx,Dg=rwx,Do=rwx,Fu=rwx,Fg=rwx,Fo=rwx', './server']

  # Ideally, this IP will be unique, so the entry added to /etc/hosts won't
  # conflict with that of another project.
  config.vm.network :private_network, ip: '192.168.10.40'

  config.vm.post_up_message = 'The app is now running at http://aria-at-app.loc/'

  # Automatically add an entry to /etc/hosts for this Vagrant box (requires
  # sudo). This should match the Ansible host_vars/vagrant site_fqdn value.
  config.hostsupdater.aliases = ['aria-at-app.loc']

  # A specific name looks much better than "default" in ansible output.
  config.vm.define 'vagrant'

  config.vm.provision 'ansible_local' do |ansible|
    ansible.compatibility_mode = '2.0'
    ansible.provisioning_path = '/vagrant/deploy'
    ansible.playbook = 'provision.yml'
    ansible.inventory_path = 'inventory/vagrant.yml'
  end
end
