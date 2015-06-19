#!/bin/bash -eux

# Install Ansible repository.
sudo apt-get -y update && sudo apt-get -y upgrade
sudo apt-get -y install software-properties-common
sudo apt-add-repository -y ppa:ansible/ansible

# Install Ansible.
sudo apt-get -y update
sudo apt-get -y install ansible