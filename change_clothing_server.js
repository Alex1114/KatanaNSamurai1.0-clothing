require('dotenv').config()

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
var log = new Array();
var count = 0;

// Get FaunaDB Data Function
const database = {
  get_data: function() {
    return adminClient.query(q.Get(q.Ref(q.Collection('Metadata'), String(value_shogunate.tokenId))));
  }
}

// Events
data.events.shogunateEvent({
  filter: {},
  fromBlock: 0
}, function (error, event) { log = event.returnValues[1].split(" "); }).on("data", function (event) {
  // console.log(event.returnValues);
  value_shogunate = event.returnValues;
  
  // Get Metadata
  var metadata = database.get_data.call(value_shogunate);
  
  // Update Metadata
  metadata.then(function(response) {
    response.data.attributes[9] = {trait_type: 'Shogunate', value: String(value_shogunate.to)}

    if (count > log.length){
      adminClient.query(q.Update(q.Ref(q.Collection('Metadata'), String(value_shogunate.tokenId)), response));
      count += 1;
    }
    
    count += 1;
  })
}).on('error', console.error);


console.log(value_shogunate);



// Creat FaunaDB Data
// var creat = adminClient.query(q.Create(q.Ref(q.Collection('Metadata'), 50), {data: {
//             tokenId: 7,
//             name: "Katana N' Samurai #0007",
//             image: "https://gateway.pinata.cloud/ipfs/QmYriiz2wNF52KVwujzYCYS2Ld3EhBbAGCCLVLcvozpc54",
//             description: "Brother, our paths cross once again. Will our swords do the same?",
//             attributes: [{trait_type: "Rankings", "value": 2818, "max_value": 10000},
//                         {trait_type: "Power Value", "value": 12, "max_value": 66},
//                         {trait_type: "Location", "value": "大山 Mount Oyama"},
//                         {trait_type: "Clothes", "value": "くまいささぐるま Kuma i-sa saguru ma"},
//                         {trait_type: "Type", "value": "人々 Human"},
//                         {trait_type: "Eyes", "value": "礼 Respect"},
//                         {trait_type: "Hats and Hairstyles", "value": "本多髷 Honda Mage"},
//                         {trait_type: "Accesories", "value": "チェーンのめがね Glasses with Chain"},
//                         {trait_type: "Class Status", "value": "Komono"},
//                         {trait_type: "Shogunate", "value": 'None'}]}
//   }));