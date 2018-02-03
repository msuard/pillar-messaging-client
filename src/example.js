const fetch = require('../lib/ServiceClient');
const WebSocketConnection = require('../lib/WebSocketConnection');
var bip39 = require('bip39');
const elliptic = require('elliptic');
var hash = require('hash.js');
const keccak256 = require('js-sha3').keccak_256;
const secp256k1 = new (elliptic.ec)('secp256k1');
const signal = require('signal-protocol');
const ab2str = require('arraybuffer-to-string');
const str2ab = require('string-to-arraybuffer');
var request = require('request');
var eccrypto = require('eccrypto');
var crypto = require("crypto");
var util = require("ethereumjs-util");
var serialize = require('node-serialize');
const createKeccakHash = require('keccak')


//DEFINE BODY
var body = '{"custom": {"name": "Mr Tester", "avatar": "https://s3.amazonaws.com/testuser/profile.jpg"}}'
var bodyHash =createKeccakHash('keccak256').update(body).digest('base64')
console.log('BODY HASH BASE 64 STRING\n')
console.log(bodyHash)
console.log('to5m3Kmk6z9OZI/Kb+/yabcfDKl47nSuspAtxnFaQsA=\n')

var verb='POST' //Get the request verb of the request (e.g. GET, POST, etc) as a string.
var path='/v1/user' //Get the path of the request as a string.

//GET SERVER TIMESTAMP
getTimestamp().then(function(timestamp){ //Get a unix timestamp representing the current time as a string.
    console.log('\nTIMESTAMP:\n')
    console.log(timestamp)
    console.log('\n')

var payload = verb+'\n'+path+'\n'+timestamp+'\n'+bodyHash  //Take the results of steps 3-6 and concatenate them as follows:{VERB}\n{PATH}\n{TIMESTAMP}\n{HASH}

console.log('PAYLOAD\n')
console.log(payload)
console.log('\n')

//var payloadHash = keccak256(payload).toString('hex');
var payloadHash =createKeccakHash('keccak256').update(payload).digest('base64')
console.log('PAYLOAD HASH\n')
console.log(payloadHash)
console.log('\n')
var payloadHashArray=[]
for (var i = 0; i < payloadHash.length/2; i++) {
    payloadHashArray.push(payloadHash.charAt(i*2)+payloadHash.charAt(i*2+1));
  }


var keyPair = secp256k1.genKeyPair();

console.log('KEYPAIR\n')
console.log(keyPair)
console.log('\n')


console.log('PRIVATE KEY\n')
var privateKey=keyPair.priv
console.log(privateKey)
console.log('\n')

console.log('SIG\n')
var sig = secp256k1.sign(payloadHashArray, keyPair.priv, 'hex', {canonical:true})
console.log(sig)
console.log('\n')

console.log('ISVALIDSIG\n')
console.log(keyPair.verify(payloadHashArray,sig))
console.log('\n')



console.log ('TOSHISIG')
var toshisig = '0x'+sig.r+sig.s+'0'+sig.recoveryParam//+sig.recoveryParam.toString(16)
console.log(toshisig)
console.log(toshisig.length)
console.log('\n')

console.log('RECOVERED PUBLIC KEY')
console.log(secp256k1.recoverPubKey(payloadHashArray, {r : sig.r, s : sig.s}, 0).encode('hex'))
console.log(secp256k1.recoverPubKey(payloadHashArray, {r : sig.r, s : sig.s}, 1).encode('hex'))

console.log('PUBLIC KEY\n')
/*
var pubPoint=keyPair.getPublic()
var publicKey = pubPoint.encode('hex')
console.log(publicKey)
console.log(publicKey.length)*
console.log('\n')
*/

let publicKey1=secp256k1.recoverPubKey(payloadHashArray, {r : sig.r, s : sig.s}, 0).encode('hex')
let publicKey2=secp256k1.recoverPubKey(payloadHashArray, {r : sig.r, s : sig.s}, 1).encode('hex')

var pubKey1=''
for (var i = 2; i < publicKey1.length; i++) {
    pubKey1+=publicKey1.charAt(i);
  }
  console.log(pubKey1)
  console.log('\n')

  var pubKey2=''
for (var i = 2; i < publicKey2.length; i++) {
    pubKey2+=publicKey2.charAt(i);
  }
  console.log(pubKey2)
  console.log('\n')

console.log('PUBKEY HASH\n')
//var pubKeyHash = keccak256(publicKey);
var pubKeyHash1 =createKeccakHash('keccak256').update(pubKey1).digest('hex')
console.log(pubKeyHash1)
console.log(pubKeyHash1.length)

var pubKeyHash2 =createKeccakHash('keccak256').update(pubKey2).digest('hex')
console.log(pubKeyHash2)
console.log(pubKeyHash2.length)
console.log('\n')

console.log('ADDRESS\n')
var address1=('0x'+pubKeyHash1.slice(24))
console.log(address1)
console.log(address1.length)
var address2=('0x'+pubKeyHash2.slice(24))
console.log(address2)
console.log(address.length)
console.log('0x056db290f8ba3250ca64a45d16284d04bc6f5fbf\n')


var auth = "Basic " + new Buffer("username" + ":" + "password").toString("base64");

var headers = {
    'Content-Type': 'application/json',
    "Authorization" : auth,
    'Toshi-Timestamp': tmstmp.toString(),
    //'Content-Length': bodyString.length
    'Toshi-ID-Address': address,//publicKey.toString('hex'),
    'Toshi-Signature': toshisig
};

var options = {
    uri: 'https://pillar-chat-service.herokuapp.com'+path,
    //path: '/v1/accounts/bootstrap/',
    port: 80,
    method: verb,
    headers: headers,
    //timestamp: tmstmp
    json:body
};

console.log ('\nHTTP PUT REQUEST\n')

request(options, function(error,response,body) {


    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body)})
           
})

function getTimestamp(){
    timestampPromise = new Promise(function(resolve,reject){
        try{
            request('https://pillar-chat-service.herokuapp.com/v1/accounts/bootstrap', function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            var parsed = JSON.parse(body);
            //console.log(parsed)
            tmstmp=parsed.timestamp
            resolve(tmstmp)
            }).end()
        }
        catch(e){reject(e)}
    })
    return timestampPromise
}
