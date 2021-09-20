require('dotenv').config()

var faunadb = require('faunadb');
var q = faunadb.query;
var adminClient = new faunadb.Client({ secret: process.env.REACT_APP_FAUNA_KEY });

var pinataSDK = require('@pinata/sdk');
var pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.WebsocketProvider(process.env.WEB3_ALCHEMY_API_KEY));

var abi = require("./contract-abi.json");
var address = process.env.REACT_APP_CONTRACT_ADDRESS;
var data = new web3.eth.Contract(abi, address);

var value_mint = 0;
var value_shogunate = 0;
var log_all = [];
var first_run = 1;
var sleep_switch = 1;
var to = null;

// Get FaunaDB Data Function
const database = {
  get_data: function() {
    return adminClient.query(q.Get(q.Ref(q.Collection('Metadata'), String(tokenId))));
  }
}

// Events
async function history(){
  all = await data.events.shogunateEvent({
    filter: {},
    fromBlock: 0
  }, function (error, event) { 
    log_all.push(event.returnValues);
  }).on('error', console.error);
}
history();

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
sleep(3000).then(() => { 
  for (i = 0; i < log_all.length; i++){

    async function get_data(){
      to = log_all[i].to;
      tokenId = log_all[i].tokenId;
      // console.log(to)
      var metadata = await database.get_data.call(tokenId).then(function(response) {

          console.log(i)
          response.data.attributes[9] = {trait_type: 'Shogunate', value: String(to)}
          console.log(response.data.attributes[9])
      })
    

    }
    get_data();
    // metadata.then(function(response) {
    //   response.data.attributes[9] = {trait_type: 'Shogunate', value: String(to)}
    //   console.log(response.data.attributes[9])
    // })





    

  }





});














