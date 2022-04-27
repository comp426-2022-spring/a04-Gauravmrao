"use strict";

// require sqlite
const database = require('better-sqlite3')

// define database
const db = new database('log.db')

// define statement
const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='access';`)

// define row
let row = stmt.get();

// if row is undefined
if (row === undefined) {
    console.log('Your database appears to be empty. I will initialize it now.')
    const sqlInit = `
        CREATE TABLE accesslog ( 
            id INTEGER PRIMARY KEY, 
            remoteaddr VARCHAR, 
            remoteuser VARCHAR, 
            datetime VARCHAR, 
            method VARCHAR, 
            url VARCHAR, 
            protocol VARCHAR,
            http-version NUMERIC, 
            secure VARCHAR,
            status INTEGER, 
            referer VARCHAR,
            useragent VARCHAR.
            content-length NUMERIC)
        `
    db.exec(sqlInit)
} else {
    console.log('Log database exists.')
}

module.exports = db


