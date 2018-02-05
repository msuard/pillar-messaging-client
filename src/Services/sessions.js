var fs = require('fs');
const signal = require('signal-protocol')
const SignalProtocolStore = require('./SignalProtocolStore.js')
const ab2str = require('arraybuffer-to-string');


getJSON = function(){
    console.log('GET STORE')
    var json = require('./store.json');
    //var jsomn = JSON.parse(json);
    return(json)
}

buildSession = function(preKeyBundle){
    var sessionPromise = new Promise(function(resolve,reject){

        var recipientId = preKeyBundle.devices[0].registrationId.toString() //???
        var deviceId = preKeyBundle.devices[0].deviceId.toString() //


        var json  = getJSON()

        console.log('SESSION STORE')
        console.log(JSON.stringify(json))


        var address = new signal.SignalProtocolAddress(recipientId, deviceId);
        console.log(address)
        console.log('ADDRESS TO STRING')
        console.log(address.toString())
        var store  = new SignalProtocolStore.SignalProtocolStore()
        console.log('STORE OBJECT')
        console.log(store)
        // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
        var sessionBuilder = new signal.SessionBuilder(store, address);
        
        // Process a prekey fetched from the server. Returns a promise that resolves
        // once a session is created and saved in the store, or rejects if the
        // identityKey differs from a previously seen identity for this address.
        console.log('DEVICE')
        console.log(preKeyBundle.devices[0])
        console.log(ab2str(preKeyBundle.devices[0].preKey.publicKey,'hex'))

        var promise = sessionBuilder.processPreKey(preKeyBundle.devices[0]);
        
        promise.then(function onsuccess() {
            // encrypt messages
            console.log('ENCRYPT')
            resolve({'address' : address, 'store' : store})
        });
        
        promise.catch(function onerror(error) {
            // handle identity key conflict
            console.log('STORE ERROR')
            reject(error)
        });
    })
    return(sessionPromise)
}
module.exports.buildSession = buildSession

