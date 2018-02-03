/*
const elliptic = require('elliptic');
privateKey = "9775013a0a7e2d957b2ff9743e5e48c8d2c933dc0ea16f1860a73971e5d7405a";
//var keyPair = sign = elliptic.ec('secp256k1').genKeyPair();
//var privateKey=keyPair.priv.toString('hex')
//var pubPoint=keyPair.getPublic()
//console.log(pubPoint)
//var publicKey = pubPoint.encode('hex')//{
//sign = elliptic.ec('secp256k1').keyFromPrivate(privateKey ,'hex').sign("a78032652a5e54a353b3ae604863546d972ae2a5ac8c1bb0f2e473b1120a9b20")
msg = "a78032652a5e54a353b3ae604863546d972ae2a5ac8c1bb0f2e473b1120a9b20"
sign = elliptic.ec('secp256k1').sign(msg, privateKey, 'hex', {canonical:true})
//privateKey.ec.curve.n.sub(sign.s)
//sign.r.toString(16)

//sign.s.toString(16)


console.log(elliptic.ec('secp256k1').keyFromPrivate(privateKey ,'hex').getPublic().encode('hex'))
//console.log(publicKey)
//console.log(elliptic.ec('secp256k1').recoverPubKey(msg, sign, sign.recoveryParam).encode('hex'))
console.log(elliptic.ec('secp256k1').recoverPubKey(msg, sign, 0).encode('hex'))
console.log(elliptic.ec('secp256k1').recoverPubKey(msg, sign, 1).encode('hex'))
*/

var EC = require('elliptic').ec;
 
// Create and initialize EC context 
// (better do it once and reuse it) 
var ec = new EC('secp256k1');
 
// Generate keys 
var key = ec.genKeyPair();
 
// Sign message (must be an array, or it'll be treated as a hex sequence) 
var msg = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
//var msg = '7d460855c7f9f0cb9e4559b7c26c61d55e4a1d8ad80f4d342f9f9057c346e9d9'.toString('hex')
var signature = key.sign(msg);
 
// Export DER encoded signature in Array 
var derSign = signature.toDER();
 
// Verify signature 
console.log(key.verify(msg, derSign));

console.log(ec.recoverPubKey(msg, signature, 0).encode('hex'))
console.log(ec.recoverPubKey(msg, signature, 1).encode('hex'))
console.log(ec.keyFromPrivate(key.priv ,'hex').getPublic().encode('hex'))

/*
 
// CHECK WITH NO PRIVATE KEY 
 
// Public key as '04 + x + y' 
var pub = '04bb1fa3...';
 
// Signature MUST be either: 
// 1) hex-string of DER-encoded signature; or 
// 2) DER-encoded signature as buffer; or 
// 3) object with two hex-string properties (r and s) 
 
var signature = 'b102ac...'; // case 1 
var signature = new Buffer('...'); // case 2 
var signature = { r: 'b1fc...', s: '9c42...' }; // case 3 
 
// Import public key 
var key = ec.keyFromPublic(pub, 'hex');
 
// Verify signature 
console.log(key.verify(msg, signature));
*/