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

// Get FaunaDB Data Function
const database = {
  get_data: function() {
    return adminClient.query(q.Get(q.Ref(q.Collection('Metadata'), String(value_shogunate.tokenId))));
  },
  past_data: function() {
    // console.log(log_all);
    // To Do
  }
}

// Events
data.events.shogunateEvent({
  filter: {},
  fromBlock: 0
}, function (error, event) { 

  // console.log(event.returnValues);
  log_all = event.returnValues;
  var past_event = database.past_data.call(log_all);

}).on("data", function (event) {

  // console.log(event.returnValues);
  value_shogunate = event.returnValues;

  // Ignore First Run 
  if (sleep_switch == 1){
    function sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    sleep(5000).then(() => { 
      first_run = 0;
      sleep_switch = 0;
    })
  }

  if (first_run == 0){

    // Get Metadata
    var metadata = database.get_data.call(value_shogunate);
    
    // Update Metadata
    metadata.then(function(response) {
      response.data.attributes[9] = {trait_type: 'Shogunate', value: String(value_shogunate.to)}

      async function change_shoungate_clothing(){

        const metadataFilter = {
          name: "Katana N' Samurai" +　value_shogunate.tokenId + ".jpg",
          // keyvalues: {
          //   power_value: {
          //       value: '13',
          //       op: 'eq'
          //   }
          // }
        };
        const filters = {
            status : 'pinned',
            pageLimit: 10,
            pageOffset: 0,
            metadata: metadataFilter
        };

        let get_IPFS_URI = await pinata.pinList(filters).then((result) => {
            // Change URI
            response.data.image = "https://gateway.pinata.cloud/ipfs/" + result.rows[0].ipfs_pin_hash + "/success"
        }).catch((err) => {
            console.log(err);
        });
        
        // Update Metadata (FaunaDB)
        let result = await adminClient.query(q.Update(q.Ref(q.Collection('Metadata'), String(value_shogunate.tokenId)), response));
        
        console.log("Update: ", result.ref);
      }

      change_shoungate_clothing();

    })

  }


}).on('error', console.error);


















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