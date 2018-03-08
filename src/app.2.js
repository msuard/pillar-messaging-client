let accounts = require('./Services/accounts.js')
let gcm = require('./Services/gcm.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')
const str2ab =require('string-to-arraybuffer')
const ab2str = require('arraybuffer-to-string');
let base64 = require('base-64');
const utf8 = require('utf8');
const colors = require('colors')

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
      if (ciphertext.type == 3)
        return cipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
      return cipher.decryptWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
    }
  }

var ALICE_ADDRESS=''
var BOB_ADDRESS=''
var RAFA_ADDRESS=''

var aliceStore = new SignalStore.SignalProtocolStore();
var bobStore = new SignalStore.SignalProtocolStore();
var rafaStore = new SignalStore.SignalProtocolStore();


var bobPreKeyId = 1337;
var bobSignedKeyId = 1;

var alicePreKeyId = 7331;
var aliceSignedKeyId = 1;

var rafaPreKeyId = 9634;
var rafaSignedKeyId = 1;

var alicePreKeyBundle
var bobPreKeyBundle
var bobPreKeyBundle2
var rafaPreKeyBundle

var alice_bob
var bob_alice

var rafa_bob
var bob_rafa

var rafa_alice
var alice_rafa

var builderAliceBob
var builderBob
var builderRafaAlice
var builderRafaBob
var builderBobRafa
var msg

return Promise.all([
    generateIdentity(aliceStore),
    generateIdentity(bobStore),
    generateIdentity(rafaStore),
]).then(function(result) {
    
    ALICE_ADDRESS = new signal.SignalProtocolAddress(result[0], 1); 
    BOB_ADDRESS   = new signal.SignalProtocolAddress(result[1], 1);
    RAFA_ADDRESS   = new signal.SignalProtocolAddress(result[2], 1);

    builderAliceBob = new signal.SessionBuilder(aliceStore, BOB_ADDRESS);
    builderRafaAlice = new signal.SessionBuilder(rafaStore, ALICE_ADDRESS);
    builderBobRafa = new signal.SessionBuilder(bobStore, RAFA_ADDRESS);


return Promise.all([
    generatePreKeyBundle(aliceStore, alicePreKeyId, aliceSignedKeyId),
    generatePreKeyBundle(bobStore, bobPreKeyId, bobSignedKeyId),
    generatePreKeyBundle(rafaStore, rafaPreKeyId, rafaSignedKeyId),

]).then(function(result) {

  alicePreKeyBundle = result[0];
  bobPreKeyBundle = result[1];
  rafaPreKeyBundle = result[2];
  
  alice_bob = new signal.SessionCipher(aliceStore, BOB_ADDRESS);
  alice_rafa = new signal.SessionCipher(aliceStore, RAFA_ADDRESS);
  
  bob_alice = new signal.SessionCipher(bobStore, ALICE_ADDRESS);
  bob_rafa = new signal.SessionCipher(bobStore, RAFA_ADDRESS);

  rafa_alice = new signal.SessionCipher(rafaStore, ALICE_ADDRESS);
  rafa_bob = new signal.SessionCipher(rafaStore, BOB_ADDRESS);
  

return Promise.all([
    builderAliceBob.processPreKey(bobPreKeyBundle),
    builderBobRafa.processPreKey(rafaPreKeyBundle),
    builderRafaAlice.processPreKey(alicePreKeyBundle),

]).then(function(){ 
    msg='Alice: But what about us?'
    return alice_bob.encrypt(msg)
  }).then(function(ciphertext){ return decryptor(bob_alice)(ciphertext)
  }).then(function(plaintext){ console.log(ab2str(plaintext).bold.green+'\n')

}).then(function(){
    msg='Bob: We’ll always have Paris. [...]'
    return bob_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.red+'\n')

}).then(function(){
  msg='Bob: We’ll always have Paris. [...]'
  return bob_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.red+'\n')

}).then(function(){ 
  msg='Alice: When I said I would never leave you.'
  return alice_bob.encrypt(msg)
}).then(function(ciphertext){ return decryptor(bob_alice)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.green+'\n')
})

.then(function(){
  msg='Alice: When I said I would never leave you..'
  return alice_bob.encrypt(msg)
}).then(function(ciphertext){ return decryptor(bob_alice)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.green+'\n')

}).then(function(){
  msg='Alice: When I said I would never leave you...'
  return alice_bob.encrypt(msg)
}).then(function(ciphertext){ return decryptor(bob_alice)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.green+'\n')

}).then(function(){
  msg='Bob: We’ll always have Paris. [...]'
  return bob_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.red+'\n')

}).then(function(){
  msg='Rafa: Hey, Alice!'
  return rafa_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_rafa)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.green+'\n')


}).then(function(){
  msg='Bob: Hi, Rafa, whats up?!!'
  return bob_rafa.encrypt(msg)
}).then(function(ciphertext){ return decryptor(rafa_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.blue+'\n')


}).then(function(){
  msg='Alice: Rafa! How are you doing?'
  return alice_rafa.encrypt(msg)
}).then(function(ciphertext){ return decryptor(rafa_alice)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.blue+'\n')

}).then(function(){
  msg='Bob: We’ll always have Paris. [...]'
  return bob_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.red+'\n')

}).then(function(){
  msg='Bob: We’ll always have Paris. [...]'
  return bob_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.red+'\n')

}).then(function(){
  msg='Bob: We’ll always have Paris. [...]'
  return bob_alice.encrypt(msg)
}).then(function(ciphertext){ return decryptor(alice_bob)(ciphertext)
}).then(function(plaintext){ console.log(ab2str(plaintext).bold.red+'\n')

})







})
})
