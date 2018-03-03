
let accounts = require('./Services/accounts.js')
let gcm = require('./Services/gcm.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')
const base64 = require('base-64');
const str2ab =require('string-to-arraybuffer')
const ab2str = require('arraybuffer-to-string');
const atob =require('atob')

let username = "fcm-app-73"
let password = "pwd"
let gcmId1='eF1qD84g0H4:APA91bF4k2lZkzOnYIn0U1_Oh1IDxZ4H6EXAjRRoGAQsbrBS5OjdxP37FLrfjW-VcSnr9gZAh4czB5oVR4xlcOtWkxhHM5y4De4qVZcnEiopS9tuOWd69dQLZ-BFruyRBVs0Ijx8XfoM'
let gcmId2='cntJhnwKF6E:APA91bGZU6kgH_lKDHApUEQrc3fm3byjs7cdHwGIXA3602-o2BsG9lm3U-JaHUR6iSvo9zwNdSpmTychMsex5jaJG8bKsLrR2iQpSfk0rK0hQrzyqBal6b5NFd9COkCjVDl-hyrfsG_v'

let destination = "fcm-app-74"
let destDevID = 1

const signal = require('signal-protocol')
const SignalStore = require('./Services/SignalProtocolStore.js')
const signalstream = require('signal-stream')

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
    function bufferify (ab) {
      var b = new Buffer(ab)
      return b
    }
    // returns a promise of plaintext
    return function (ciphertext) {
      if (ciphertext.type == 3)
        console.log('DECRYPT PRE KEY WHISPER MSG')
        return cipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
      console.log('DECRYPT WHISPER MSG')
      return cipher.decryptWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
    }
  }

var ALICE_ADDRESS=''
var BOB_ADDRESS=''

var aliceStore = new SignalStore.SignalProtocolStore();
var bobStore = new SignalStore.SignalProtocolStore();

var bobPreKeyId = 1337;
var bobSignedKeyId = 1;

var preKeyBundle

return Promise.all([
    generateIdentity(aliceStore),
    generateIdentity(bobStore),
]).then(function(result) {
    console.log('GENERATED IDS')
    console.log(result)
    ALICE_ADDRESS = new signal.SignalProtocolAddress(result[0], 1); 
    BOB_ADDRESS   = new signal.SignalProtocolAddress(result[1], 1);
    return generatePreKeyBundle(bobStore, bobPreKeyId, bobSignedKeyId); //GENERATE BOB PRE KEY BUNDLE TO SEND TO ALICE
}).then(function(genPreKeyBundle) {

    preKeyBundle = genPreKeyBundle
    console.log('GENERATED PREKEY BUNDLE')
    
    var builder = new signal.SessionBuilder(aliceStore, BOB_ADDRESS);
    return builder.processPreKey(preKeyBundle) //REGISTER BOB's PREKEY BUNDLE INTO ALICE SESSION STORE
}).then(function () {
/*
    var builder = new signal.SessionBuilder(bobStore, ALICE_ADDRESS);
    return builder.processPreKey(preKeyBundle) //REGISTER BOB's PREKEY BUNDLE INTO BOB's SESSION STORE

}).then(function () {
*/
    console.log(aliceStore)
    console.log(bobStore)
    console.log('PROCESSED PREKEY BUNDLE')
    var aliceSessionCipher = new signal.SessionCipher(aliceStore, BOB_ADDRESS);
    var bobSessionCipher = new signal.SessionCipher(bobStore, ALICE_ADDRESS);
    
    //let alice = signalstream(aliceSessionCipher)
    //let bob = signalstream(bobSessionCipher)
   //console.log('\n')
    //console.log(alice.encrypt)
    msg='coucou'
    aliceSessionCipher.encrypt(msg)
    .then(function(ciphertext){
        console.log(ciphertext)
     
        console.log('DECRYPTOR')
            decryptor(bobSessionCipher)(ciphertext)
            .then(function(plaintext){
                console.log(ab2str(plaintext))
            })


       // bobSessionCipher.decryptWhisperMessage(base64.encode(JSON.stringify(ciphertext)),'binary')
       // .then(function(plaintext){
       //     console.log(plaintext)
      //  })
    })
})