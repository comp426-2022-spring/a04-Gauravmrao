// REQUIREMENTS

// Requirements from old lab
const express = require('express');
const app = express();

// require database
const logdb = require('./database.js')

// require morgan and fs
const morgan = require('morgan');
const fs = require('fs')

// require process
const { argv } = require('process');

// require get the user input
const args = require('minimist')(process.argv.slice(2))

// use express
app.use(express.urlencoded({extended: true}))
app.use(express.json())


// User input
let portNum = require('minimist')(process.argv.slice(2));
var port = portNum.port || 5000;

// start app server
const server = app.listen(port, () => {
  console.log('App listening on port %PORT%'.replace('%PORT%',port));
});




// debugging logic
args["debug"] || false
var debug = args.debug
args["log"] || true
var log = args.log
args["help"]


// help function
if (args.help === true) {
  console.log(`server.js [options]
  --port	Set the port number for the server to listen on. Must be an integer
              between 1 and 65535.
  --debug	If set to \`true\`, creates endlpoints /app/log/access/ which returns
              a JSON access log from the database and /app/error which throws 
              an error with the message "Error test successful." Defaults to 
              \`false\`.
  --log		If set to false, no log files are written. Defaults to true.
              Logs are always written to database.
  --help	Return this message and exit.`)
  process.exit(0)
}





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



// 404's
app.use(function(req,res) {
  res.status(404).end('Endpoint does not exist');
  res.type('text/plain');
});

app.use(function(req,res){
    res.status(404).send('404 NOT FOUND');
});


// log to a database
if (log === true) {
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
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)

  next()
})











// responder
app.get('/app/', (req,res) => {
      res.statusCode = 200;
      res.statusMessage = 'OK';
      res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'});
      res.end(res.statusCode+ ' ' +res.statusMessage);
});



// Morgan
// let logging = morgan('combined')
// app.use(logging('common'))



if (debug === true) {
  app.get('/app/log/access', (req,res) => {
    const stmt = db.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(stmt)
  })
  app.get('/app/error', (req,res) => {
    throw new Error('Error test successful')
  })
}


