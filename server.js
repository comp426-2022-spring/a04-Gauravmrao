// Require Express.js
const express = require('express');
const app = express();

// require morgan
const morgan = require('morgan')

// require database stuff
const fs = require ('fs')
const db = require("./database.js")

// get user input arguments
const args = require('minimist')(process.argv.slice(2))

// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
  console.log(help)
  process.exit(0)
}

// store help text
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



///////////let portNum = require('minimist')(process.argv.slice(2));
var port = args.port || 5555;



const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%', port))
})



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

app.get('/app/flip', (req, res) => {
    res.status(200).json({ 'flip' : coinFlip()})
})




function coinFlips(flips) {
    const flippies = [];
    for (let i = 0; i < flips; i ++) {
      flippies.push(coinFlip())
    }
    return flippies;
}

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

app.get('/app/flips/:number', (req, res) => {
    res.status(200).json({ 'raw' : coinFlips(req.params.number), 'summary' : countFlips(coinFlips(req.params.number))})
})




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


app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"))
})


app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
})


app.get('/app', (req, res) => {
    res.status(200).end('The API is working')
    res.type('text/plain')
})


app.use(function(req, res){
    res.status(404).send("Endpoint does not exist")
    res.type("text/plain")
})



if (args.log == true) {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('combined', { stream: accessLog }))
}









