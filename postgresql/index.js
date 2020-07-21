/**
 * Backup runner for PostgreSQL.
 * 
 * This Node.js application un pg_dump using normal parameters and 
 * uploads its output to a COS.
 * 
 * It expects all connection PostgreSQL environment variables (PGHOST, PGPORT, PGUSER, PGPASSWORD)
 * except PGDATABASE. Instead, we're going to receive a variable DATABASES containing a comma-delimited
 * list of databases to backup. For each database in the list, the application will perform backups
 * in a sequential order. 
 */

/**
 * CONSTANTS
 */
const PGHOST = process.env.PGHOST
const PG_ADDITIONAL_OPTIONS = process.env.PG_ADDITIONAL_OPTIONS ? process.env.PG_ADDITIONAL_OPTIONS.split(',') : []

let listenerConfigured = false
let performDatabaseBackup = async function (db, timestamp, transfer_options, cosRedirector, bucket_name) {
    return new Promise((resolve, reject) => {
        console.log('Starting Promise ' + db)
        const all = db === 'all'

        const args = PG_ADDITIONAL_OPTIONS.concat(all ? [] : ['-d', db])
        const fileName = `${PGHOST}_${db}_${timestamp}.dump.gz`
        const bucket_options = {
            Bucket: bucket_name,
            Key: fileName
        }

        cosRedirector.once('command_exit', (code) => {
            console.log(`Finished pg_dump for database ${db} with status code ${code}`)
            setTimeout(() => {
                resolve({code: code})
            }, 2000)
        })
        cosRedirector.execCommandAndSendToCOS(all ? 'pg_dumpall' : 'pg_dump', args, bucket_options, transfer_options, true)
        if(!listenerConfigured) {
            cosRedirector.on('upload_finish', (data) => {
                console.log('Finished uploading file ' + data.Key)
            })
            listenerConfigured=true
        }
       
    })
}

module.exports = {performDatabaseBackup}