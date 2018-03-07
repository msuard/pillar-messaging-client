
let accounts = require('./Services/accounts.js')
let gcm = require('./Services/gcm.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')
const str2ab =require('string-to-arraybuffer')
const ab2str = require('arraybuffer-to-string');
let base64 = require('base-64');

let username = "fcm-app-117"
let password = "pwd"
let gcmId1='eF1qD84g0H4:APA91bF4k2lZkzOnYIn0U1_Oh1IDxZ4H6EXAjRRoGAQsbrBS5OjdxP37FLrfjW-VcSnr9gZAh4czB5oVR4xlcOtWkxhHM5y4De4qVZcnEiopS9tuOWd69dQLZ-BFruyRBVs0Ijx8XfoM'
let gcmId2='cntJhnwKF6E:APA91bGZU6kgH_lKDHApUEQrc3fm3byjs7cdHwGIXA3602-o2BsG9lm3U-JaHUR6iSvo9zwNdSpmTychMsex5jaJG8bKsLrR2iQpSfk0rK0hQrzyqBal6b5NFd9COkCjVDl-hyrfsG_v'

let destination = "fcm-app-118"
let destDevID = 1

const signal = require('signal-protocol')
const SignalStore = require('./Services/SignalProtocolStore.js')
let SessionRecord = require('../node_modules/signal-protocol/src/SessionRecord.js')

function generateIdentity(store) {
    return Promise.all([
      signal.KeyHelper.generateIdentityKeyPair(),
      signal.KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
      store.put('identityKey', result[0]);
      store.put('registrationId', result[1]);
      return(result[1])
    });
  }

  function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    return Promise.all([
      store.getIdentityKeyPair(),
      store.getLocalRegistrationId()
    ]).then(function(result) {
      var identity = result[0];
      var registrationId = result[1];
  
      return Promise.all([
        signal.KeyHelper.generatePreKey(preKeyId),
        signal.KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
      ]).then(function(keys) {
        var preKey = keys[0];
        var signedPreKey = keys[1];
  
        store.storePreKey(preKeyId, preKey.keyPair);
        store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
  
        return {
          identityKey: identity.pubKey,
          registrationId : registrationId,
          preKey:  {
            keyId     : preKeyId,
            publicKey : preKey.keyPair.pubKey
          },
          signedPreKey: {
            keyId     : signedPreKeyId,
            publicKey : signedPreKey.keyPair.pubKey,
            signature : signedPreKey.signature
          }
        };
      });
    });
  }

  function decryptor (cipher) {
    var bufferify = (ab) => {return new Buffer(ab)}
    // returns a promise of plaintext
    return function (ciphertext) {
      base64body = base64.encode(ciphertext.body)
      if (ciphertext.type == 3)
        return cipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
      return cipher.decryptWhisperMessage(base64body, 'binary')
        .then(bufferify)
    }
  }

var ALICE_ADDRESS=''
var BOB_ADDRESS=''

var aliceStore = new SignalStore.SignalProtocolStore();
var bobStore = new SignalStore.SignalProtocolStore();

var bobPreKeyId = 1337;
var bobSignedKeyId = 1;

var alicePreKeyId = 7331;
var aliceSignedKeyId = 1;

var alicePreKeyBundle
var bobPreKeyBundle

var aliceSessionCipher
var bobSessionCipher
var builderAlice
var builderBob
var sessionRecord
var msg1
var msg2

return Promise.all([
    generateIdentity(aliceStore),
    generateIdentity(bobStore),
]).then(function(result) {
    
    ALICE_ADDRESS = new signal.SignalProtocolAddress(result[0], 1); 
    BOB_ADDRESS   = new signal.SignalProtocolAddress(result[1], 1);
    return generatePreKeyBundle(bobStore, bobPreKeyId, bobSignedKeyId); //GENERATE BOB PRE KEY BUNDLE TO SEND TO ALICE

  }).then(function(genPreKeyBundleBob) {
    
  
    bobPreKeyBundle = genPreKeyBundleBob
    builderAlice = new signal.SessionBuilder(aliceStore, BOB_ADDRESS);
    
    return builderAlice.processPreKey(bobPreKeyBundle) //REGISTER BOB's PREKEY BUNDLE INTO ALICE SESSION STORE
  }).then(function () {

    aliceSessionCipher = new signal.SessionCipher(aliceStore, BOB_ADDRESS);

    return aliceStore.loadSession(BOB_ADDRESS.toString())
  }).then(function(record) {

    return bobStore.storeSession(str2ab(ALICE_ADDRESS.toString()), record)
  }).then(function() {

    msg1='The quick brown fox jumps over the lazy dog'
    bobSessionCipher = new signal.SessionCipher(bobStore, ALICE_ADDRESS);

    return aliceSessionCipher.encrypt(base64.encode(msg1))
  }).then(function(ciphertext){     
   
    return decryptor(bobSessionCipher)(ciphertext)
  }).then(function(plaintext){   
    
    console.log("Message 1: " + base64.decode(ab2str(plaintext)))
 
    msg2='The quick brown dog jumps over the lazy fox'
    
    return aliceSessionCipher.encrypt(msg2)
  }).then(function (ciphertext) {
    return decryptor(bobSessionCipher)(ciphertext)
  }).then(function(plaintext) {

    return aliceSessionCipher.encrypt(msg2)
  }).then(function (ciphertext) {
    return decryptor(bobSessionCipher)(ciphertext)
  }).then(function(plaintext) {

    console.log("Message 3: " + ab2str(plaintext))
  })

