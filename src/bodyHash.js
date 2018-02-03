const keccak256 = require('js-sha3').keccak_256;
const createKeccakHash = require('keccak')
const ab2str = require('arraybuffer-to-string');
const str2ab = require('string-to-arraybuffer');
const elliptic = require('elliptic');
const secp256k1 = new (elliptic.ec)('secp256k1');

var body = '{"custom": {"name": "Mr Tester", "avatar": "https://s3.amazonaws.com/testuser/profile.jpg"}}'
//var body = {custom: {name: "Mr Tester", avatar: "https://s3.amazonaws.com/testuser/profile.jpg"}}


var bodybytes = []; // char codes
var bodybytesv2 = []; // char codes

for (var i = 0; i < body.length; ++i) {
  var code = body.charCodeAt(i);
  
  bodybytes = bodybytes.concat([code]);
  
  bodybytesv2 = bodybytesv2.concat([code & 0xff, code / 256 >>> 0]);
}

// 72, 101, 108, 108, 111, 31452
//console.log('bytes', bytes);

// 72, 0, 101, 0, 108, 0, 108, 0, 111, 0, 220, 122
//console.log('bytesv2', bytesv2);
var bodybytesBuffer=new Buffer(bodybytes)
//var bodyString = new Buffer(body).toString('base64')//JSON.stringify(body);
//console.log(bodyString)
//var bodyAB=str2ab(bodyString); 
//bodyStringBase64=ab2str(bodyAB)
//console.log(bodyStringBase64)


//var bodyHash = keccak256(bodyString);//Take the body of your request and hash it with KECCAK-256.
//var bodyHashBase64String = bodyHash.toString('base64') //Base64 encode the result of Step 1 as a string.
//N.B. The body should be hashed exactly as it’s being sent, for string type bodies (text/*, application/json, etc…), the hash should be generated as the byte string encoded with the charset value set in the Content-Type header of the request.
console.log('BODY HASH\n')
//console.log(bodyHash)
var encodedHash=createKeccakHash('keccak256').update(bodybytesBuffer).digest('base64')
console.log(encodedHash)
//console.log(createKeccakHash('keccak256').update(body).digest('hex'))
console.log('\n')
//console.log('to5m3Kmk6z9OZI/Kb+/yabcfDKl47nSuspAtxnFaQsA=')
//console.log('b68e66dca9a4eb3f4e648fca6feff269b71f0ca978ee74aeb2902dc6715a42c0')

var payload='PUT'+"\n"+'/v1/accounts/bootstrap'+"\n"+(123456789).toString()+"\n"+encodedHash;

console.log('PAYLOAD\n')
console.log(payload)


var payloadbytes = []; // char codes
var payloadbytesv2 = []; // char codes

for (var i = 0; i < payload.length; ++i) {
  var code = payload.charCodeAt(i);
  
  payloadbytes = payloadbytes.concat([code]);
  
  payloadbytesv2 = payloadbytesv2.concat([code & 0xff, code / 256 >>> 0]);
}

// 72, 101, 108, 108, 111, 31452
//console.log('bytes', bytes);

// 72, 0, 101, 0, 108, 0, 108, 0, 111, 0, 220, 122
//console.log('bytesv2', bytesv2);
var payloadbytesBuffer=new Buffer(payloadbytes)

var payloadHash=createKeccakHash('keccak256').update(payloadbytesBuffer).digest('hex')

console.log(payloadHash)

var payloadHashArray=[]
for (var i = 0; i < payloadHash.length/2; i++) {
    payloadHashArray.push(payloadHash.charAt(i*2)+payloadHash.charAt(i*2+1));
}

var keyPair = secp256k1.genKeyPair();

console.log('KEYPAIR\n')
console.log(keyPair)
console.log('\n')


console.log('PRIVATE KEY\n')
var privateKey=keyPair.priv.toString('hex')
console.log(privateKey)
console.log('\n')

var sig = secp256k1.sign(payloadHashArray, keyPair.priv, 'hex', {canonical:true})

var s=sig.s
var r=sig.r
var v=sig.recoveryParam

var recoveredPubKey= secp256k1.recoverPubKey(payloadHashArray, {r : sig.r, s : sig.s}, sig.recoveryParam).encode('hex')

console.log(recoveredPubKey)
console.log('PUBLIC KEY\n')
var pubPoint=keyPair.getPublic()
var publicKey = pubPoint.encode('hex')
console.log(publicKey)

var pubKeyHash =createKeccakHash('keccak256').update(publicKey).digest('hex')
console.log(pubKeyHash)
console.log(pubKeyHash.length)
console.log('\n')

console.log('ADDRESS\n')
var address='0x'+pubKeyHash.slice(24)
console.log(address)
console.log(address.length)
console.log('\n')