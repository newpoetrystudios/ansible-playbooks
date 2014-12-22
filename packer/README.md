
To create AMIs, use [packer](http://packer.io).  Here's how you do it:

```shell
$ export AWS_ACCESS_KEY=<your key>
$ export AWS_SECRET_KEY=<your key>
$ cd deploy
$ packer ami/redis.json
```

That'll create the redis AMI.  You can then use it to build a new redis server.

Try out the other builders!