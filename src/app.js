const fetch = require('../lib/ServiceClient');
const WebSocketConnection = require('../lib/WebSocketConnection')
var bip39 = require('bip39');
const elliptic = require('elliptic');
var hash = require('hash.js')
const keccak256 = require('js-sha3').keccak_256;
const secp256k1 = new (elliptic.ec)('secp256k1')






let seed = bip39.mnemonicToSeedHex('basket actual jude ben');

const base_url = "https://pillar-chat-service.herokuapp.com";


//let hmac = hash.hmac(hash.sha512, "Bitcoin seed");
// hmac.update(seed, 'hex');

// let digest = hmac.digest();

let keypair = secp256k1.genKeyPair();



//let chaincode = digest.slice(32);

let pubkey = keypair.getPublic()

//console.log("address9999999999:" +  JSON.stringify( pubkey));

//this._cache = {};
//this._root = {
//  keypair: keypair,
//  chaincode: chaincode
//  };




//this.ws = new WebSocketConnection(base_url,
// null,
// keypair,
//    "toshi-app-js");
//this.ws.connect();




function _getUrl(path) {
    return base_url + path;
}



// create prekeys

auth = "Basic " + new Buffer("username" + ":" + "password").toString("base64");


let options = {
    url: _getUrl('/v2/keys'),
    json: true,
    headers: {
        "Authorization" : auth

    },

    method: 'PUT'
    ,
    body: {
        "lastResortKey": {
            "keyId": -28579668
        },
        "preKeys": [
            {
                "keyId": -81338653
            },
            {
                "keyId": -26773841
            },
            {
                "keyId": -9396493
            },
            {
                "keyId": 15463664,
                "publicKey": "0x99A4e6886435f16C51701f7A0E2a04b5eB81dEB7"
            },
            {
                "keyId": -98227863
            }
        ],
        "signedPreKey": {
            "keyId": -77033897
        }

    }
}
    ;

fetch(options).then((body => {

    let obj = JSON.parse(body)


    console.log(" keysss " + JSON.stringify(obj));
}))


  // create account

  
  fetch(
      _getUrl('/v1/accounts/bootstrap') , function(err, response, body){

        let newBody = JSON.parse(body);
        console.log("-----" + body);
        console.log("respose" + JSON.stringify(response));
      })
      .then(
          (body) =>{
            cachedAt = new Date().getTime();

            let obj = JSON.parse(body)

            console.log("time" + cachedAt);
            console.log("body" + obj);
            
          },
      );
      
















