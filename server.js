// REQUIREMENTS

// Requirements from old lab
const express = require('express');
const app = express();

// require logdb
const logdb = require('./database')

const morgan = require('morgan');
const errorhandler = require('errorhandler')
const fs = require('fs')

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


app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
})






let logging = morgan('combined')
app.use(logging('common'))


app.get('/app', (req, res) => {
    res.status(200).end('The API is working')
    res.type('text/plain')
})


app.use(function(req, res){
    res.status(404).send("Endpoint does not exist")
    res.type("text/plain")
})