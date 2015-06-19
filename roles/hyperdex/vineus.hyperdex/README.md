Role Name
=========

Install / seteup an [hyperdex](http://hyperdex.org) cluster

Requirements
------------

Ansible 1.6

Role Variables
--------------

    hyperdex_coordinator_enable: False
    hyperdex_coordinator_log_dir: /var/log/hyperdex/coordinator
    hyperdex_coordinator_port: 6000
    hyperdex_coordinator_data_dir: /hyperdex/coordinator
    hyperdex_coordinator_listen_addr: auto
    hyperdex_coordinator_connect_addr:
    hyperdex_coordinator_connect_port: 6000

    hyperdex_daemon_enable: False
    hyperdex_daemon_log_dir: /var/log/hyperdex/daemon
    hyperdex_daemon_port: 6001
    hyperdex_daemon_data_dir: /hyperdex/daemon
    hyperdex_daemon_listen_addr: auto
    hyperdex_daemon_connect_addr:
    hyperdex_daemon_connect_port: 6000


Dependencies
------------

None

Example Playbook
----------------

with a hosts file containing 1 IP address under the region "maincoordinator" and N IP addresses under "node".

Servers use a private network IP on eth1 (change to eth0 is needed)

    - hosts: maincoordinator
      sudo: yes
      roles:
        - {
            role: hyperdex,
            hyperdex_coordinator_enable: True,
            hyperdex_coordinator_listen_addr: "{{ ansible_eth1.ipv4.address }}",
            hyperdex_daemon_enable: True,
            hyperdex_daemon_listen_addr: "{{ ansible_eth1.ipv4.address }}",
            hyperdex_daemon_connect_addr: "{{ ansible_eth1.ipv4.address }}",
            hyperdex_daemon_connect_port: 6000,
            tags: ['hyperdex']
          }


    - hosts: node
      sudo: yes
      roles:
        - {
            role: hyperdex,
            hyperdex_coordinator_enable: True,
            hyperdex_coordinator_listen_addr: "{{ ansible_eth1.ipv4.address }}",
            hyperdex_coordinator_connect_addr: "{{ hostvars[groups['maincoordinator'][0]]['ansible_eth1']['ipv4']['address'] }}",
            hyperdex_coordinator_connect_port: 6000,
            hyperdex_daemon_enable: True,
            hyperdex_daemon_listen_addr: "{{ ansible_eth1.ipv4.address }}",
            hyperdex_daemon_connect_addr: "{{ ansible_eth1.ipv4.address }}",
            tags: ['hyperdex']
          }

License
-------

MIT
