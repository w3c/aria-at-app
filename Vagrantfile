# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = '2'

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = 'debian/buster64'

  # Ideally, this IP will be unique, so the entry added to /etc/hosts won't
  # conflict with that of another project.
  config.vm.network :private_network, ip: '192.168.10.40'

  # A specific name looks much better than "default" in ansible output.
  config.vm.define 'vagrant'

  config.vm.provision 'ansible_local' do |ansible|
    ansible.provisioning_path = '/vagrant/deploy'
    ansible.playbook = 'provision.yml'
    ansible.inventory_path = 'inventory/vagrant.yml'
  end
end
