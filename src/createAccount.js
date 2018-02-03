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


//GENERATE SIGNALING KEY]

var signalingKey = ab2str(crypto.randomBytes(416),'base64')
console.log('SIGNALING KEY\n')
console.log(signalingKey)
console.log('\n')

//DEFINE BODY
var json={"signalingKey":signalingKey,"fetchesMessages":true,"registrationId":1049,"name":null,"voice":false}
var body = '{"signalingKey":signalingKey,"fetchesMessages":true,"registrationId":1049,"name":null,"voice":false}'

var bodyString = JSON.stringify(body);

//var bodyHash = new Buffer(keccak256.array(bodyString)).toString('hex');
//var bodyHash =  abi.soliditySHA3(['string'],[bodyString]).toString('hex');
//var bodyHash = keccak256(str2ab(bodyString)); //Take the body of your request and hash it with KECCAK-256.
var bodyHash =createKeccakHash('keccak256').update(body).digest('base64')
//var bodyHashBase64String = bodyHash.toString('base64') //Base64 encode the result of Step 1 as a string.
//N.B. The body should be hashed exactly as it’s being sent, for string type bodies (text/*, application/json, etc…), the hash should be generated as the byte string encoded with the charset value set in the Content-Type header of the request.
console.log('BODY HASH BASE 64 STRING\n')
console.log(bodyHash)
console.log('\n')

var verb='PUT' //Get the request verb of the request (e.g. GET, POST, etc) as a string.
var path='/v1/accounts/bootstrap/' //Get the path of the request as a string.

//GET SERVER TIMESTAMP
getTimestamp().then(function(timestamp){ //Get a unix timestamp representing the current time as a string.
    console.log('\nTIMESTAMP:\n')
    console.log(timestamp)
    console.log('\n')

var payload = verb+'\n'+path+'\n'+timestamp+'\n'+bodyHash  //Take the results of steps 3-6 and concatenate them as follows:{VERB}\n{PATH}\n{TIMESTAMP}\n{HASH}

console.log('PAYLOAD\n')
console.log(payload)
console.log('\n')

//var payloadHash = new Buffer(keccak256.array(payload))//.toString('hex');
//var payloadHash =  abi.soliditySHA3(['string'],[payload])//.toString('hex');
var payloadHash = keccak256(payload).toString('hex');
//var payloadHash = '0x'+keccak256(payload).toString('hex');
console.log('PAYLOAD HASH\n')
console.log(payloadHash)
console.log('\n')
var payloadHashArray=[]
for (var i = 0; i < payloadHash.length/2; i++) {
    payloadHashArray.push(payloadHash.charAt(i*2)+payloadHash.charAt(i*2+1));
  }
//console.log(payloadHashArray)


//var privKey='1f7c84017b68970886772e89932defffdbf02a87bd255392a2ea042cd02d4ca4'
//var pubKey='0x3dCa7dd458420Cf5A603A10F9F8B0A36A4243002'



// A new random 32-byte private key. 
//var privateKey = crypto.randomBytes(32);
//console.log('ISVALID\n')
//console.log(util.isValidPrivate(privateKey))
//console.log('\n')

//console.log('PRIVKEY\n')
//console.log(privateKey.toString('hex'))
//console.log(privateKey.toString('hex').length)
//console.log('\n')
// Corresponding uncompressed (65-byte) public key. 
//var pub = eccrypto.getPublic(privateKey);
//var keyPair = secp256k1.keyFromPrivate(privateKey);
var keyPair = secp256k1.genKeyPair();
//keyPair.pub=new bn(publicKey.toString('hex'),16)
//var keypair = elliptic.ec.gen]

//keyPair.getPublic()
//console.log(pub)
//console.log(keyPair.pub)
console.log('KEYPAIR\n')
console.log(keyPair)
console.log('\n')
//var publicKey = util.privateToPublic(privateKey);

console.log('PRIVATE KEY\n')
var privateKey=keyPair.priv.toString('hex')
console.log(privateKey)
console.log('\n')



// Always hash you message to sign! 
//var msg = crypto.createHash("sha256").update(payload).digest();

console.log('SIG\n')
//var sig = util.ecsign(msg,privateKey)//
//var sig = keyPair.sign(payloadHash);//, { canonical: true });
var sig = secp256k1.sign(payloadHashArray, keyPair.priv, 'hex', {canonical:true})
console.log(sig)
//var sig = web3.eth.sign(privateKey,payloadHash);
console.log('\n')
console.log('R')
console.log(sig.r)
console.log(sig.r.toString('hex').length)
console.log('S')
console.log(sig.s)
console.log(sig.s.toString('hex').length)
console.log('V')
console.log(sig.recoveryParam)
console.log('\n')
//console.log((sig.v-27).toString(16))
//var signature = Buffer.concat([sig.r, sig.s], 64)

console.log('ISVALIDSIG\n')
console.log(keyPair.verify(payloadHashArray,sig))
//console.log(util.isValidSignature(sig.recoveryParam,sig.r,sig.s))
console.log('\n')
//console.log('SIGNATURE')

//console.log(signature.toString('hex'))
//console.log(signature.toString('hex').length)

// var recoverPub = util.ecrecover(payloadHash,sig.v,sig.r,sig.recoveryParam).toString('hex')

//console.log('RECOVER')
//console.log(recoverPub)



console.log ('TOSHISIG')
//var toshisig=serialize.serialize(sig).toString('hex')
//var toshisig=JSON.stringify(sig)
//var toshisig='0xcffb17822a12e6077db1b529e5bcfd666dfa4c057dd97435064dc04d9a06b4cc23c6eb1c2f4721131ff2996b8c20e586008c1417c1e75b85a52ba846554808dc00'
var toshisig = '0x'+sig.r.toString('hex')+sig.s.toString('hex')+'0'+sig.recoveryParam//+sig.recoveryParam.toString(16)
console.log(toshisig)
//console.log('0xcffb17822a12e6077db1b529e5bcfd666dfa4c057dd97435064dc04d9a06b4cc23c6eb1c2f4721131ff2996b8c20e586008c1417c1e75b85a52ba846554808dc00')
//var toshisig = '0x'+R+S+'0'+sig.recoveryParam.toString(16)
//var toshisig = '0x'+sig.s.toString('hex')+sig.r.toString('hex')+'0'+sig.recoveryParam.toString(16)
//var toshisig = '0x'+sig.r.toString('hex')+sig.s.toString('hex')+(sig.v-27)+'0'
//var toshisig = '0x'+sig.r.toString('hex')+sig.s.toString('hex')+sig.v.toString(16)
//var toshisig = '0x'+sig.r.toString('hex')+sig.s.toString('hex')+sig.v.toString()
//var toshisig = '0x'+sig.s.toString('hex')+sig.r.toString('hex')+'00'//+(sig.v-27).toString(16)
//var toshisig = '0x'+sig.s.toString('hex')+sig.r.toString('hex')+(sig.v-27)+'0'
//var toshisig = '0x'+sig.s.toString('hex')+sig.r.toString('hex')+sig.v.toString(16)
//var toshisig = '0x'+sig.s.toString('hex')+sig.r.toString('hex')+sig.v.toString()
//console.log(toshisig)
console.log(toshisig.length)

console.log('\n')

//console.log(secp256k1.recoverPubKey(toshisig))

console.log(secp256k1.recoverPubKey(payloadHashArray, {r : sig.r, s : sig.s}, sig.recoveryParam).encode('hex'))
//console.log(secp256k1.recoverPubKey(payloadHash, sig, 'hex'))//.encode('hex'))
console.log('PUBLIC KEY\n')
var pubPoint=keyPair.getPublic()
//console.log(pubPoint)
//var x = pubPoint.getX()
//var y = pubPoint.getY()
var publicKey = pubPoint.encode('hex')//{
//var publicKey =  secp256k1.recoverPubKey(payloadHash, {r : sig.r, s : sig.s}, sig.recoveryParam, 'hex').encode('hex')
//var pub={x : x.toString('hex'), y : y.toString('hex')};
//var publicKey = secp256k1.keyFromPublic(pub,'hex')
console.log(publicKey)
//console.log(ab2str(pub, 'hex'))
//console.log(ab2str(pub, 'hex').length)
console.log('\n')

//var pubKey='0x'+publicKey
var pubKey=''

for (var i = 2; i < publicKey.length; i++) {
    pubKey+=publicKey.charAt(i);
  }

console.log(pubKey)
console.log('\n')

console.log('PUBKEY HASH\n')
//var pubKeyHash = new Buffer(keccak256.array(publicKey)).toString('hex');
//var pubKeyHash = abi.soliditySHA3(['string'],[publicKey]).toString('hex');
//var pubKeyHash = secp256k1.keyFromPrivate(publicKey);
//var pubKeyHash = keccak256(publicKey);
var pubKeyHash =createKeccakHash('keccak256').update(publicKey).digest('hex')
console.log(pubKeyHash)
console.log(pubKeyHash.length)
console.log('\n')

console.log('ADDRESS\n')
var address='0x'+pubKeyHash.slice(24)
console.log(address)
console.log(address.length)
console.log('\n')


/*

eccrypto.sign(privateKey, payloadHash).then(function(sig) {
    console.log("Signature in DER format:", sig);
    eccrypto.verify(publicKey, msg, sig).then(function() {
        console.log("Signature is OK");

        console.log(ab2str(sig, 'hex'))
*/           
    

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
    json:json
};

console.log ('\nHTTP PUT REQUEST\n')

request(options, function(error,response,body) {


    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.


/*
                console.log(response)
                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('end', function() {

                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);
                    console.log('RESPONSE')
                    console.log(parsed)
                });
                */
            })//.write(bodyString)
            /*
            .then(function(response) {
                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('end', function() {

                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);
                    console.log(parsed)
                });
            });
            */
        

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
