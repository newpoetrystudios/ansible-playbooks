#!/bin/sh

cd {{redis_working_directory}}
BACKUP=redis-backup-`date +%F-%H-%M`.tar.gz
tar zcvf $BACKUP ./dump.rdb
aws s3 mv $BACKUP s3://{{redis_s3_backup_bucket}}