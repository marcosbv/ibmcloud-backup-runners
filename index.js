/**
 * Backup runner main job.
 * 
 * This Node.js application runs DB backup commands and uploads its output to a COS.
 * The library will be dynamically loaded reading the value from BACKUP_RUNNER env variable.
 * 
 * Children implementations will export a method named performDatabaseBackup to perform db-specific 
 * backup commands.
 */

const COSRedirector = require('@marcosbv/redirect-to-cos')

// Lib to load
const bkp = require(`./${process.env.BACKUP_RUNNER}`)

/**
 * CONSTANTS
 */
const DATABASES=process.env.DATABASES.split(',')
const COS_ENDPOINT = process.env.COS_ENDPOINT
const COS_APIKEY = process.env.COS_APIKEY
const COS_CRN = process.env.COS_CRN
const COS_BUCKET_NAME = process.env.COS_BUCKET_NAME
const PAGE_SIZE = process.env.PAGE_SIZE || 5
const QUEUE_SIZE = process.env.QUEUE_SIZE || 5

const connection_config = 
{
    endpoint: COS_ENDPOINT,
    apiKeyId: COS_APIKEY,
    serviceInstanceId: COS_CRN
}

const cosRedirector = new COSRedirector(connection_config)

const transfer_options = {
    pageSize: PAGE_SIZE * 1024 * 1024,
    queueSize: QUEUE_SIZE
}


function fillZeros(number, pad) {
    let prefix = ''
    let length = parseInt(Math.floor(number / 10).toFixed(0)) + 1

    while (pad > length) {
        prefix += '0'
        pad--
    }

    return prefix.toString() + number.toString()
}

function dateToStr(date) {
    const month = fillZeros(date.getMonth() + 1, 2);
    const day = fillZeros(date.getDate(), 2)
    const hour = fillZeros(date.getHours(), 2)
    const minute = fillZeros(date.getMinutes(), 2)
    const second = fillZeros(date.getSeconds(), 2)
   
    return `${date.getFullYear()}${month}${day}${hour}${minute}${second}`
}

async function main() {
    const timestamp = dateToStr(new Date())
    for(const db of DATABASES) {
        console.log('Starting backup for database ' + db)
        await bkp.performDatabaseBackup(db, timestamp, transfer_options, cosRedirector, COS_BUCKET_NAME)
    }
}


main()