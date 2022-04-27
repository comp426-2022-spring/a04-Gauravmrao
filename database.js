"use strict";

// require get the user input
const args = require('minimist')(process.argv.slice(2))


// require sqlite
const database = require('better-sqlite3')

// define database
const logdb = new database('log.db')

// define statement
const statement = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='access';`)

// define row
let row = statement.get();

// if row is undefined
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')
    const sqlInit = `
        CREATE TABLE access ( id INTEGER PRIMARY KEY, remote-addr VARCHAR, remote-user VARCHAR, datetime VARCHAR, method VARCHAR, url VARCHAR, http-version NUMERIC, status INTEGER, content-length NUMERIC)`
    logdb.exec(sqlInit)
} else {
    console.log('Log database exists.')
}

module.exports = logdb



if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// help and usage messages
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
