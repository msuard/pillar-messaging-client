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
var SHA3 = require('sha3');
var sha3 = new SHA3.SHA3Hash(256);

//GENERATE SIGNALING KEY]

var signalingKey = ab2str(crypto.randomBytes(416),'base64')
console.log('SIGNALING KEY\n')
console.log(signalingKey)
console.log('\n')

let keypair = secp256k1.genKeyPair();


let pubkey = keypair.getPublic()

console.log(keypair)
console.log(pubkey)
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
            console.log(preKeysArray)
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

                var jsonKeys = {

                    "identityKey": ab2str(identityKeyPair.pubKey, 'base64'),
                    "lastResortKey": {
                        "keyId": keyId.toString,
                        "publicKey": ab2str(identityKeyPair.pubKey, 'base64'),
                    },
                    "password": "password",
                    "preKeys": preKeysArray,
                    "registrationId": "1",
                    "signalingKey": ab2str(signedPreKey.keyPair.pubKey, 'base64'), //"Random52ByteString",
                    "signedPreKey": {
                    "keyId": keyId,
                    "publicKey": ab2str(signedPreKey.keyPair.pubKey, 'base64'),
                    "signature": ab2str(signedPreKey.signature, 'base64')
                    }
                }


                var bodyString = JSON.stringify(json)
                console.log(bodyString)
//DEFINE BODY
//var json={"signalingKey":signalingKey,"fetchesMessages":true,"registrationId":1049,"name":null,"voice":false}
//var body = '{"signalingKey":signalingKey,"fetchesMessages":true,"registrationId":1049,"name":null,"voice":false}'
//var json = {"custom": {"name": "Mr Tester", "avatar": "https://s3.amazonaws.com/testuser/profile.jpg"}}


var body = '{"custom":{"name":"Mr Tester","avatar":"https://s3.amazonaws.com/testuser/profile.jpg"}}'

var json= {
    "signalingKey": signalingKey,
    "fetchesMessages": true,
    "registrationId": 1049,
    "name": null,
    "voice": false
  }

//var body = '"{\\"custom\\": {\\"name\\": \\"Mr Tester\\", \\"avatar\\": \\"https://s3.amazonaws.com/testuser/profile.jpg\\"}}"'
console.log(body)
var bodybytesBuffer = new Buffer.from(body)
console.log(bodybytesBuffer)
//sha3.update(bodybytesBuffer);
//var bodyHash1 = sha3.digest('hex');  //SHOULD IT BE HEX???
//var bodyHash = keccak256(json).toString('base64');
var bodyHash =createKeccakHash('keccak256').update(bodybytesBuffer).digest('base64')

//N.B. The body should be hashed exactly as it’s being sent, for string type bodies (text/*, application/json, etc…), 
//the hash should be generated as the byte string encoded with the charset value set in the Content-Type header of the request.
console.log('BODY HASH BASE 64 STRING\n')
//console.log(bodyHash1)
console.log(bodyHash)
console.log('1mQVZytXT7XPU5R47hFoKrC6phG58lzyLtUTGMsjWJY=')
console.log('\n')

var verb='PUT' //Get the request verb of the request (e.g. GET, POST, etc) as a string.
var path='/v1/accounts' //Get the path of the request as a string.

//GET SERVER TIMESTAMP
getTimestamp().then(function(timestamp){ //Get a unix timestamp representing the current time as a string.
    console.log('\nTIMESTAMP:\n')
    console.log(timestamp)
    console.log('\n')

var payload = verb+'\n'+path+'\n'+timestamp+'\n'+bodyHash  //Take the results of steps 3-6 and concatenate them as follows:{VERB}\n{PATH}\n{TIMESTAMP}\n{HASH}

var payloadbytesBuffer = new Buffer.from(payload)

console.log('PAYLOAD\n')
console.log(payload)
console.log('\n')


//sha3.update(payloadbytesBuffer);
//var payloadHash = sha3.digest('hex');  //SHOULD IT BE HEX???
var payloadHash =createKeccakHash('keccak256').update(payloadbytesBuffer).digest('base64')
console.log('PAYLOAD HASH\n')
console.log(payloadHash)
var payloadHashBytesBuffer = new Buffer.from(payloadHash)
//console.log(payloadHashBuffer)
//var payloadHashArray=[]
//for (var i = 0; i < payloadHash.length/2; i++) {
//   payloadHashArray.push(payloadHash.charAt(i*2)+payloadHash.charAt(i*2+1));
//}

var keyPair = secp256k1.genKeyPair();

console.log('KEYPAIR\n')
console.log(keyPair)
console.log('\n')

console.log('PRIVATE KEY\n')
var privateKey=keyPair.priv.toString('hex')
console.log(privateKey)
console.log('\n')



// Always hash you message to sign! 

console.log('SIG\n')

var sig = secp256k1.sign(payloadHashBytesBuffer, keyPair.priv, 'hex', {canonical:true})
console.log(sig)
console.log('\n')


console.log('ISVALIDSIG\n')
console.log(keyPair.verify(payloadHashBytesBuffer,sig))
console.log('\n')

console.log ('TOSHISIG')

var toshisig = '0x'+sig.r.toString('hex')+sig.s.toString('hex')+'0'+sig.recoveryParam.toString()//+sig.recoveryParam.toString(16)
console.log(toshisig)
console.log(toshisig.length)
console.log('\n')


console.log('\nPUBLIC KEY\n')

var pubPoint=keyPair.getPublic()
var publicKey = pubPoint.encode('hex')//{
console.log(publicKey)
console.log('\n')

console.log('RECOVERED PUBLIC KEY\n')
var recoveredPublicKey0 = secp256k1.recoverPubKey(payloadHashBytesBuffer, {r : sig.r, s : sig.s}, 0).encode('hex')
var recoveredPublicKey1 = secp256k1.recoverPubKey(payloadHashBytesBuffer, {r : sig.r, s : sig.s}, 1).encode('hex')
console.log(recoveredPublicKey0)
console.log(recoveredPublicKey1)
//console.log(secp256k1.recoverPubKey(payloadHash, sig, 'hex'))//.encode('hex'))

if (recoveredPublicKey0==publicKey){console.log('TRUE')}
if (recoveredPublicKey1==publicKey){console.log('TRUE')}




var pubKey=''

for (var i = 2; i < publicKey.length; i++) {
    pubKey+=publicKey.charAt(i);
  }

//console.log(pubKey)
console.log('\n')



console.log('PUBKEY HASH\n')
var pubKeyHash0 =createKeccakHash('keccak256').update(recoveredPublicKey0).digest('hex')
console.log(pubKeyHash0)
console.log(pubKeyHash0.length)

var pubKeyHash1 =createKeccakHash('keccak256').update(recoveredPublicKey1).digest('hex')
console.log(pubKeyHash1)
console.log(pubKeyHash1.length)

console.log('\n')

console.log('ADDRESS\n')

var address0='0x'+pubKeyHash0.slice(24)
console.log(address0)
console.log(address0.length)

var address1='0x'+pubKeyHash1.slice(24)
console.log(address1)
console.log(address1.length)

console.log('\n')


var auth = "Basic " + new Buffer("username2" + ":" + "password").toString("base64");

var headers = {
    'Content-Type': 'application/json',
    "Authorization" : auth,
    'Toshi-Timestamp': tmstmp.toString(),
    //'Content-Length': bodyString.length
    'Toshi-ID-Address': '0xee6c4e52c1d8eacb6f3f04ca5d76b168af4f658e',//publicKey.toString('hex'),
    'Toshi-Signature': toshisig
};

var options = {
    uri: 'https://pillar-chat-service-auth.herokuapp.com'+path,
    //path: '/v1/accounts/bootstrap/',
    port: 80,
    method: verb,
    headers: headers,
    //timestamp: tmstmp
    json:json
};

console.log ('\nHTTP PUT REQUEST\n')

request(options, function(error,response,body) {


    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.

})
})
})
})
})
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


genPreKeysArray=function(preKeysArray,index){
    var preKeysArrayPromise=new Promise (function(resolve, reject){
        if (index==2){
            resolve(preKeysArray)
        }
        else{
            
            signal.KeyHelper.generatePreKey(index)
            .then(function(preKey){
                preKeysArray.push({"keyId": preKey.keyId.toString(), "publicKey": '0x05'+ab2str(preKey.keyPair.pubKey, 'base64'), "identityKey": ab2str(preKey.keyPair.privKey, 'base64')})
                //console.log(preKeysArray[-1].publicKey.length)
                resolve(genPreKeysArray(preKeysArray,index+1))
            })
        }
    
    })
    return(preKeysArrayPromise)
    
    }