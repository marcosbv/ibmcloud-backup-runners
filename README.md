# Backup jobs for Databases at Cloud

## Introduction

This repo provides a way to perform full backups on databases running on Cloud, storing them in a Cloud Object Storage instance. Currently PostgreSQL full backups are available.

PostgreSQL backups are available as full backups performed by pg\_dump or pg\_dumpall utilities. The file name format is:

```
<PGHOST>_<DatabaseName>_<YYYYMMDDHHmmss>.dump.gz
```

All files are compressed by default.

If *DATABASES* variable value is 'all', pg\_dumpall is used. Otherwise, pg\_dump is used for each table defined in *DATABASES* variable.

## Execution
```bash
# npm install only once
npm install
node index.js
```

## Common Environment Variables

BACKUP_RUNNER: Backup runner module to execute. Currently only 'postgresql' is supported.

DATABASES: comma-delimited list of databases to perform a backup.

COS_ENDPOINT: Endpoint for your Cloud Object Storage instance (i.e. *s3.sao01.cloud-object-storage.appdomain.cloud*)

COS_APIKEY: Cloud Object Storage API Key to authenticate with. This API Key must have at least Writer permissions for the bucket.

COS_CRN: Cloud Object Storage Instance ID (i.e crn:v1:bluemix:public:cloud-object-storage:global:a/XXXXXXXXXX:XXXXXXX).

COS_\BUCKET\_NAME: Bucket name to store your backups. 

PAGE_SIZE: Size of sent messages to COS (Default is 5MB).

QUEUE_SIZE: Size of queue of concurrent connections to COS (default is 5).

## PostgreSQL Environment Variables 

PGHOST: PostgreSQL host name.

PGPORT: PostgreSQL port to connect to.

PGUSER: PostgreSQL user.

PGPASSWORD: PostgreSQL user's password.

PG\_ADDITIONAL\_OPTIONS: comma-delimited list of parameters to be passed to PostgreSQL backup command (i.e: -F,custom).