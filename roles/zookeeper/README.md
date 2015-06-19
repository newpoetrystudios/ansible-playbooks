ZooKeeper
=========

This role dawnloads and manages ZooKeeper. By default the role will download
and configure a single ZooKeeper instance.



Role Variables
--------------

zookeeper_inst: (OPTIONAL)

This variable used to control the installation of ZooKeeper.

defaults/main.yml
```
zookeeper_inst:
  user: zookeeper
  group: zookeeper
  inst_dir: /opt
  downloadURL: http://apache.mirror.rafal.ca/zookeeper/stable/zookeeper-3.4.6.tar.gz
  tarFileSHA256: 01b3938547cd620dc4c93efe07c0360411f4a66962a70500b163b59014046994
  java: openjdk-7-jdk



  user          - This variable will create a system user to run ZooKeeper.
  group         - This variable will create a system group to run ZooKeeper.
  inst_dir      - Base installation directory.
  downloadURL   - The source file to download (Make sure ends with zookeeper-X.Y.Z.tar.gz)!!!
                  X.Y.Z will be extracted and used as the version to install.
  tarFileSHA256 - SHA256 of the source file.
  java          - Package name to install Java. You can omit this variable and
                  install your own version of Java.
```


zookeeperZooCfg: (OPTIONAL)

This variable can be used to control the main configuration file zoo.cfg

Example:
```
	zookeeperZooCfg:
     tickTime: "2000"
     initLimit: "10"
     syncLimit: "5"
     dataDir: "/var/lib/zookeeper"
     clientPort: "2181"
	 servers:
	  - {host: "zookeeper01.can-west-1a.example.org", ports: "2888:3888" }
	  - {host: "zookeeper02.can-west-1a.example.org", ports: "2888:3888" }
	  - {host: "zookeeper03.can-west-1a.example.org", ports: "2888:3888" }
	 autopurge:
	  snapRetainCount: "32"
	  purgeInterval: "24"
```

Best practice is to managed the variable in group_vars (on a cluster level) or if really needed in host_vars. 

For cluster deployement the minimum you'll need is only the zookeeperZooCfg.servers and zookeeperZooCfg.dataDir. Also you can overide other valuse using the exact same naming convention as ZooKeeper config. The example below shows all the available variables @the moment.

NOTE: Please pay attention to the servers definition since myid file for ZooKeeper's
      id will be created automagically based on entry index i.e. first entry=1,
      second entry=2 and for this to work your servers definition in the inventory file MUST be fqdn!!!



Example Playbook
----------------

Example play that includes the role:

    - hosts: zookeeper-prod-can-west-1a
      roles:
         - ZooKeeper


Additional Info:

	<http://zookeeper.apache.org>



License
-------

GPLv3



Author Information
------------------

Tal Lannder

Tal@Pjili.com
