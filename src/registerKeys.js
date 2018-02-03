const fetch = require('../lib/ServiceClient');
const WebSocketConnection = require('../lib/WebSocketConnection')
var bip39 = require('bip39');
const elliptic = require('elliptic');
var hash = require('hash.js')
const keccak256 = require('js-sha3').keccak_256;
const secp256k1 = new (elliptic.ec)('secp256k1')
const signal = require('signal-protocol')
const ab2str = require('arraybuffer-to-string')
//var http = require('http');


//let seed = bip39.mnemonicToSeedHex('basket actual jude ben');

const base_url = "https://pillar-chat-service.herokuapp.com";


//let hmac = hash.hmac(hash.sha512, "Bitcoin seed");
// hmac.update(seed, 'hex');

// let digest = hmac.digest();

let keypair = secp256k1.genKeyPair();

//let chaincode = digest.slice(32);

let pubkey = keypair.getPublic()

console.log(keypair)
console.log(pubkey)

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

var keyId
 
var registrationId = signal.KeyHelper.generateRegistrationId();
// Store registrationId somewhere durable and safe.
console.log('\nREGISTRATION ID\n')
console.log(registrationId) // Could be any integer (wallet ID??)
 
signal.KeyHelper.generateIdentityKeyPair().then(function(identityKeyPair) {
    // keyPair -> { pubKey: ArrayBuffer, privKey: ArrayBuffer }
    // Store identityKeyPair somewhere durable and safe.
    console.log('\nID KEY PAIR\n:')
    console.log(identityKeyPair)
    console.log('\n')

    signal.KeyHelper.generatePreKey(16777215).then(function(lastResortKey){

   

        genPreKeysArray([],1)
        .then(function(preKeysArray){



        //signal.KeyHelper.generatePreKey(keyId).then(function(preKey) {
            //store.storePreKey(preKey.keyId, preKey.keyPair);
            //console.log('PRE KEYS ARRAY\n:')
            //console.log(preKeysArray)
            //console.log('\n')

            let keyId=0 //Any integer
        
            signal.KeyHelper.generateSignedPreKey(identityKeyPair, keyId).then(function(signedPreKey) {
                //store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);
                console.log('SIGNED PRE KEY\n:')
                console.log(signedPreKey)
                console.log('\n')
            
                console.log(parseInt('0xFFFFFF'))

                //CREATE BODY
    /*
                var body = {
                    "lastResortKey": {
                    "keyId": parseInt(0xFFFFFF,10),
                    },
                    "preKeys": preKeysArray,
                    "signedPreKey": {
                    "keyId": keyId.toString()
                    }
                }
        */        

                var body = {
                    "identityKey": ab2str(identityKeyPair.pubKey, 'base64'),
                    "lastResortKey": {
                        "keyId": '0xFFFFFF',
                        "publicKey": ab2str(lastResortKey.keyPair.pubKey, 'base64')
                        
                    },
                    "password": new Buffer("password").toString("base64"),
                    "keys": preKeysArray,
                    "registrationId": registrationId.toString(),
                    "signalingKey": ab2str(signedPreKey.keyPair.pubKey, 'base64'), //"Random52ByteString",
                    "signedPreKey": {
                        "keyId": keyId.toString(),
                        "publicKey": ab2str(signedPreKey.keyPair.pubKey, 'base64'),
                        "signature": ab2str(signedPreKey.signature, 'base64')
                    }
                }

                
                var bodyString = JSON.stringify(body);

                console.log('BODY\n')
                console.log(body)
                console.log('\n')


                auth = "Basic " + new Buffer("username" + ":" + "password").toString("base64");
                console.log(new Buffer("username" + ":" + "password").toString("base64"))

                let options = {
                    url: base_url+'/v2/keys',
                    json: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization" : auth
                    },

                    method: 'PUT'
                    ,
                    body: body

                }
                console.log('OPTIONS\n')
                //console.log(options)
                    

                fetch(options).then((data => {

                    let obj = JSON.parse(data)

                    console.log("RESPONSE: " + JSON.stringify(obj));
                }))
            })
        })
    })
})
/*
// Request Toshi timestamp
var tmstmp

var request = require('request');
request('https://pillar-chat-service.herokuapp.com/v1/accounts/bootstrap', function (error, response, body) {
console.log('error:', error); // Print the error if one occurred
console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
console.log('body:', body); // Print the HTML for the Google homepage.
var parsed = JSON.parse(body);
console.log(parsed)
tmstmp=parsed.timestamp
console.log(tmstmp)


console.log('TIMESTAMP\n')
console.log(tmstmp)
console.log('\n')

})

*/


  // create account

  /*
  fetch(
      _getUrl('/v1/accounts/bootstrap') , function(err, response, body){

        let newBody = JSON.parse(body);
        console.log("-----" + body);
        console.log("response" + JSON.stringify(response));
      })
      .then(
          (body) =>{
            cachedAt = new Date().getTime();

            let obj = JSON.parse(body)

            console.log("time" + cachedAt);
            console.log("body" + obj);
            
          },
      );
      */








getUrl=function(path) {
    return base_url + path;
}



genPreKeysArray=function(preKeysArray,index){
var preKeysArrayPromise=new Promise (function(resolve, reject){
    if (index==2){
        resolve(preKeysArray)
    }
    else{
        
        signal.KeyHelper.generatePreKey(index)
        .then(function(preKey){
            preKeysArray.push({"keyId": preKey.keyId, "publicKey": '0x05'+ab2str(preKey.keyPair.pubKey, 'base64'), "identityKey": ab2str(preKey.keyPair.privKey, 'base64')})
            //console.log(preKeysArray[-1].publicKey.length)
            resolve(genPreKeysArray(preKeysArray,index+1))
        })
    }

})
return(preKeysArrayPromise)

}

