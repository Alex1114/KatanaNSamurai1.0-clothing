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

sleep(5000).then(() => { 
  
  var i = 35;
  var max = log_all.length;

  function get_data(){

    to = log_all[i].to;
    tokenId = log_all[i].tokenId;
    
    var metadata = adminClient.query(q.Get(q.Ref(q.Collection('Metadata'), String(tokenId)))).then(function(response) {

      response.data.attributes[9] = {trait_type: 'Shogunate', value: String(to)}
      console.log("NO.", i);
      console.log("TokenId =", tokenId);
      console.log(response.data.attributes[9])

      var clothes_name;
      var id;

      if (to == "Kamakura S"){
        clothes_name = "Cross S";
        id = "B13"
      }
      else if (to == "Kamakura M"){
        clothes_name = "Cross M";
        id = "B14"
      } 
      else if (to == "Kamakura L"){
        clothes_name = "Cross L";
        id = "B15"
      } 
      else if (to == "Kamakura XL"){
        clothes_name = "Cross XL";
        id = "B16"
      } 
      else if (to == "Muromachi S"){
        clothes_name = "Star-print S";
        id = "B17"
      } 
      else if (to == "Muromachi M"){
        clothes_name = "Star-print M";
        id = "B18"
      } 
      else if (to == "Muromachi L"){
        clothes_name = "Star-print L";
        id = "B19"
      } 
      else if (to == "Muromachi XL"){
        clothes_name = "Star-print XL";
        id = "B20"
      }
      else if (to == "Edo S"){
        clothes_name = "Chrysanthemum S";
        id = "B09"
      } 
      else if (to == "Edo M"){
        clothes_name = "Chrysanthemum M";
        id = "B10"
      } 
      else if (to == "Edo L"){
        clothes_name = "Chrysanthemum L";
        id = "B11"
      } 
      else if (to == "Edo XL"){
        clothes_name = "Chrysanthemum XL";
        id = "B12"
      } 
      else if (to == "Oda S"){
        clothes_name = "Checkered S";
        id = "B05"
      }         
      else if (to == "Oda M"){
        clothes_name = "Checkered M";
        id = "B06"
      }          
      else if (to == "Oda L"){
        clothes_name = "Checkered L";
        id = "B07"
      }   
      else if (to == "Oda XL"){
        clothes_name = "Checkered XL";
        id = "B08"
      }   
      else if (to == "Imperial House S"){
        clothes_name = "Cherry Blossom S";
        id = "B01"
      }   
      else if (to == "Imperial House M"){
        clothes_name = "Cherry Blossom M";
        id = "B02"
      }   
      else if (to == "Imperial House L"){
        clothes_name = "Cherry Blossom L";
        id = "B03"
      }   
      else if (to == "Imperial House XL"){
        clothes_name = "Cherry Blossom XL";
        id = "B04"
      }   

      const metadataFilter = {
        name: "KNS" + tokenId + id + ".jpg",
        keyvalues: {
          clothes: {
            value: String(clothes_name),
            op: 'eq'
          }
        }
      };

      const filters = {
          status : 'pinned',
          pageLimit: 10,
          pageOffset: 0,
          metadata: metadataFilter
      };

      let get_IPFS_URI = pinata.pinList(filters).then((result) => {

        // Change URI
        response.data.image = "https://gateway.pinata.cloud/ipfs/" + result.rows[0].ipfs_pin_hash;

        // Update Metadata (FaunaDB)
        let resultDB = adminClient.query(q.Update(q.Ref(q.Collection('Metadata'), String(tokenId)), response));
        console.log("Success");

        i++;
        if(i < max){
          get_data();
        }
      
      }).catch((err) => { console.log(err); });        

    })
      



  }
  get_data();



});


















