var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var router = express.Router();
var dotenv = require('dotenv');
dotenv.config();

var faunadb = require('faunadb');
var q = faunadb.query;
var adminClient = new faunadb.Client({ secret: process.env.REACT_APP_FAUNA_KEY });

var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.WebsocketProvider(process.env.WEB3_ALCHEMY_API_KEY));

var abi = require("./contract-abi.json");
var address = process.env.REACT_APP_CONTRACT_ADDRESS;
var data = new web3.eth.Contract(abi, address);

var value_mint = 0;
var value_shogunate = 0;

// Events
data.events.mintEvent({
  filter: {},
  fromBlock: 0
}, function (error, event) { /*console.log(event);*/ }).on("data", function (event) {
  value_mint = event.returnValues;
}).on('error', console.error);

data.events.shogunateEvent({
  filter: {},
  fromBlock: 0
}, function (error, event) { /*console.log(event);*/ }).on("data", function (event) {
  value_shogunate = event.returnValues;
}).on('error', console.error);

// Express.router
router.param('tokenId', function (req, res, next, tokenId) {
  console.log('Id validations on ' + tokenId);
  if (parseInt(tokenId) <= parseInt(value_mint.totalSupply)) {
    console.log(parseInt(value_mint.totalSupply))
    console.log("Verified successfully");
    next();
  } else {
    console.log("Someone is being naughty 🔥");
    res.send("Someone is being naughty 🔥")
  }
});

router.get('/Metadata/:tokenId', function (req, res) {
  console.log(req.params.tokenId)
  adminClient.query(
    q.Get(q.Ref(q.Collection('Metadata'), String(req.params.tokenId)))
  )
    .then((ret) => res.json(ret.data))
    .catch((err) => console.error('Error: %s', err))
});

app.use('/', router);
app.listen(port);