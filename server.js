// REQUIREMENTS

// Requirements from old lab
const express = require('express');
const app = express();

// require database
const logdb = require('./database.js')

// require morgan and fs
const morgan = require('morgan');
const errorhandler = require('errorhandler')
const fs = require('fs')

// require process
const { argv } = require('process');

// use express
app.use(express.urlencoded({extended: true}))
app.use(express.json())


// User input
let portNum = require('minimist')(process.argv.slice(2));
var port = portNum.port || 5000;

// start app server
const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%', port))
})




// coinflip function
function coinFlip() {
    let coinValue;
    let coinNum = Math.random();
    if (coinNum < 0.5 ) {
      coinValue = "heads";
    } else {
      coinValue = "tails";
    }
    return coinValue;
}

// coinflip api info
app.get('/app/flip', (req, res) => {
    res.status(200).json({ 'flip' : coinFlip()})
})



// coinflips function
function coinFlips(flips) {
    const flippies = [];
    for (let i = 0; i < flips; i ++) {
      flippies.push(coinFlip())
    }
    return flippies;
}


// countflips function
function countFlips(array) {
  
    let headsCounter = 0;
    let tailsCounter = 0;
    for (let i = 0; i < array.length; i ++) {
      if (array[i] == "heads") {
        headsCounter += 1;
      } else {
        tailsCounter += 1;
      }
    }
    if (headsCounter == 0 && tailsCounter != 0) {
      const tailFlipsOnly = {tails: tailsCounter};
      return tailFlipsOnly;
    } else if (headsCounter != 0 && tailsCounter == 0) {
      const headFlipsOnly = {heads: headsCounter};
      return headFlipsOnly;
    } else if (headsCounter == 0 && tailsCounter == 0) {
      const noFlips = {};
      return noFlips;
    } else {
      const flips = {tails: tailsCounter, heads: headsCounter};
      return flips;
    }
}


// coinflips api info
app.get('/app/flips/:number', (req, res) => {
    res.status(200).json({ 'raw' : coinFlips(req.params.number), 'summary' : countFlips(coinFlips(req.params.number))})
})



// flipACoin function
function flipACoin(call) {
    let currentCoin = coinFlip();
    let status;
  
    if (currentCoin == call) {
      status = "win";
    } else {
      status = "lose";
    }
      
    const output = {call: call, flip: currentCoin, result: status};
    return output;
}


// flipACoin head api
app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"))
})

// flip a coin tails api 
app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
})





// Morgan
let logging = morgan('combined')
app.use(logging('common'))


// API IS WORKING
app.get('/app', (req, res) => {
    res.status(200).end('The API is working')
    res.type('text/plain')
})

// no endpoint header
app.use(function(req, res){
    res.status(404).send("Endpoint does not exist")
    res.type("text/plain")
})


// debugging
args["debug"] || false
var debuggr = args.debug
args["log"] || true
var logger = args.log
args["help"]


// log to a database
if (logger === true) {
  const accesslog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('accesslog', { stream: accesslog }))
}

// function to log to database

app.use((req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
  }
  const statement = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const information = statement.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)

  next();
});


// debugger
if (debuggr === true) {
  app.get('/app/log/access', (req,res) => {
    const statement = logdb.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(statement)
  })

  // Error
  app.get('/app/error', (req,res) => {
    throw new Error('Error successful')
  })
}