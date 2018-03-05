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
      return(result[1])
    });
  }

function decryptor (cipher) {
    function bufferify (ab) {
        var b = new Buffer(ab)
        return b
    }
    
    // returns a promise of plaintext
    return function (ciphertext) {
        console.log(ciphertext.body)
        if (ciphertext.type == 3)
        console.log('DECRYPT PRE KEY WHISPER MSG')
        return cipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
        console.log('DECRYPT WHISPER MSG')
        return cipher.decryptWhisperMessage(ciphertext.body, 'binary')
        .then(bufferify)
    }
}

let sender = "Alice35"
let password = "pwd"
let fcmId1='eF1qD84g0H4:APA91bF4k2lZkzOnYIn0U1_Oh1IDxZ4H6EXAjRRoGAQsbrBS5OjdxP37FLrfjW-VcSnr9gZAh4czB5oVR4xlcOtWkxhHM5y4De4qVZcnEiopS9tuOWd69dQLZ-BFruyRBVs0Ijx8XfoM'

let recipient = "Bob35"
let deviceID = 1
let fcmId2='cntJhnwKF6E:APA91bGZU6kgH_lKDHApUEQrc3fm3byjs7cdHwGIXA3602-o2BsG9lm3U-JaHUR6iSvo9zwNdSpmTychMsex5jaJG8bKsLrR2iQpSfk0rK0hQrzyqBal6b5NFd9COkCjVDl-hyrfsG_v'

var aliceStore = new SignalStore.SignalProtocolStore();
var bobStore = new SignalStore.SignalProtocolStore();

console.log('GENERATE IDs')
return Promise.all([
    generateIdentity(aliceStore),
    generateIdentity(bobStore),
]).then(function(result) {
    console.log(aliceStore)
    console.log(bobStore)
    //ALICE_ADDRESS = new signal.SignalProtocolAddress(result[0], 1)
    BOB_ADDRESS   = new signal.SignalProtocolAddress(result[1], 1)
    console.log('REGISTERING ACCOUNTS')
    let aliceRegID = result[0]
    let bobRegID = result[1]

    accounts.createNewAccount2(sender,password,aliceRegID)
.then(function(){
    accounts.createNewAccount2(recipient,password,bobRegID)
.then(function(){
    console.log('REGISTER FCM IIDs\n')
    gcm.registerGCMID(sender,password,fcmId1)
.then(function(){
    gcm.registerGCMID(recipient,password,fcmId2)
.then(function(){
    console.log('REGISTER BOB KEYS\n')
    keys.registerKeys(recipient,password,bobStore)
.then(function(bobStore){
    console.log('ALICE GETS RECIPIENT KEYS\n')
    keys.getRecipientKeys(sender,password,recipient,deviceID)
.then(function(preKeyBundle){
    console.log(BOB_ADDRESS)
    console.log('\npreKeyBundle')
    console.log(preKeyBundle.devices[0])
    var builder = new signal.SessionBuilder(aliceStore, BOB_ADDRESS)
    console.log('builder')
    console.log(builder)
    return builder.processPreKey(preKeyBundle.devices[0]) //REGISTER BOB's PREKEY BUNDLE INTO ALICE SESSION STORE


}).then(function () {   
    console.log('PROCESSED PREKEY BUNDLE')
    //console.log(aliceStore)
    //console.log(BOB_ADDRESS.toString())
    //console.log(bobStore)
    //console.log(ALICE_ADDRESS.toString())
    var aliceSessionCipher = new signal.SessionCipher(aliceStore, BOB_ADDRESS);
    //var bobSessionCipher = new signal.SessionCipher(bobStore, ALICE_ADDRESS);
    let content = base64.encode('ciphertext message')
    let message = 'Yo Bob whatsup man are you down for partyyyy?'
    let messageType = 1
    //msg='first encrypted message bitchezz'
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






/*

        console.log('CIPHERTEXT')
        console.log(ciphertext)
        console.log('DECRYPTOR')
            decryptor(bobSessionCipher)(ciphertext)
            .then(function(plaintext){
                console.log(ab2str(plaintext))
            })
        })
    })
*/
})})})})})})})})})})})