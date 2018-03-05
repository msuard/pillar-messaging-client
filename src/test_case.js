let accounts = require('./Services/accounts.js')
let gcm = require('./Services/gcm.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')
const signal = require('signal-protocol')
const base64 = require('base-64');
const SignalStore = require('./Services/SignalProtocolStore.js')
const ab2str = require('arraybuffer-to-string');

function generateIdentity(store) {
    return Promise.all([
      signal.KeyHelper.generateIdentityKeyPair(),
      signal.KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
      store.put('identityKey', result[0]);
      store.put('registrationId', result[1]);
      return(result)
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





let sender = "Alice36"
let password = "pwd"
let fcmId1='eF1qD84g0H4:APA91bF4k2lZkzOnYIn0U1_Oh1IDxZ4H6EXAjRRoGAQsbrBS5OjdxP37FLrfjW-VcSnr9gZAh4czB5oVR4xlcOtWkxhHM5y4De4qVZcnEiopS9tuOWd69dQLZ-BFruyRBVs0Ijx8XfoM'

let recipient = "Bob36"
let deviceID = 1
let fcmId2='cntJhnwKF6E:APA91bGZU6kgH_lKDHApUEQrc3fm3byjs7cdHwGIXA3602-o2BsG9lm3U-JaHUR6iSvo9zwNdSpmTychMsex5jaJG8bKsLrR2iQpSfk0rK0hQrzyqBal6b5NFd9COkCjVDl-hyrfsG_v'

let content = base64.encode('ciphertext message')
let message = 'Yo Bob whatsup man are you down for partyyyy?'
let messageType = 1

var aliceStore = new SignalStore.SignalProtocolStore();
var bobStore = new SignalStore.SignalProtocolStore();

accounts.createNewAccount(sender,password,aliceStore)
.then(function(aliceRegID){
    accounts.createNewAccount(recipient,password,bobStore)
.then(function(bobRegID){
    console.log('REGISTER FCM IIDs\n')
    gcm.registerGCMID(sender,password,fcmId1)
.then(function(){
    gcm.registerGCMID(recipient,password,fcmId2)
.then(function(){
  console.log(aliceStore)
  console.log(bobStore)
    console.log('REGISTER BOB KEYS\n')
    keys.registerKeys(recipient,password,bobStore)
.then(function(bobStore){
    console.log('ALICE GETS RECIPIENT KEYS\n')
    keys.getRecipientKeys(sender,password,recipient,deviceID)
.then(function(preKeyBundle){
  console.log('PREKEY BUNDLE')
  console.log(preKeyBundle.devices[0])
    var BOB_ADDRESS   = new signal.SignalProtocolAddress(preKeyBundle.devices[0].registrationId, 1)
    var builder = new signal.SessionBuilder(aliceStore, BOB_ADDRESS)
    builder.processPreKey(preKeyBundle.devices[0]) //REGISTER BOB's PREKEY BUNDLE INTO ALICE SESSION STORE
.then(function () {
    console.log('PROCESSED PREKEY BUNDLE')
    var aliceSessionCipher = new signal.SessionCipher(aliceStore, BOB_ADDRESS);
    aliceSessionCipher.encrypt(message)
    .then(function(ciphertext){
    console.log('ALICE SENDS MESSAGE\n')
    console.log(ciphertext)
    let base64Ciphertext = base64.encode(JSON.stringify(ciphertext))
    messages.sendMessage(sender,password,BOB_ADDRESS.getName(),deviceID,content,base64Ciphertext,recipient,messageType)
    .then(function(){
    console.log('BOB GETS PENDING MESSAGES \n')
    messages.getPendingMessages(recipient,password)
    .then(function(messagesJson){
    let messagesArray=JSON.parse(messagesJson).messages
    let messageJSON = JSON.parse(base64.decode(messagesArray[messagesArray.length-1].message))
    console.log('BOB FETCHES ALICE REGISTRATION ID FROM MESSAGE \n')
    let ALICE_ADDRESS = new signal.SignalProtocolAddress(aliceRegID, 1)
    console.log('BOB DECRYPTS MESSAGE \n')
    console.log(messageJSON)
    console.log(bobStore)
    var bobSessionCipher = new signal.SessionCipher(bobStore, ALICE_ADDRESS)
    decryptor(bobSessionCipher)(ciphertext)
    //encrypt.decryptMessage(bobStore,ALICE_ADDRESS,messageJSON)
    .then(function(plaintext){
    console.log(ab2str(plaintext))

})})})})})})})})})})})