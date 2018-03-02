const signal = require('signal-protocol')
const ab2str = require('arraybuffer-to-string');
const str2ab =require('string-to-arraybuffer')

encryptMessage = function(plaintext,store,address){
    var cipherPromise = new Promise(function(resolve,reject){
        try{
            var base64Encoded = plaintext.toString('base64')
            var sessionCipher = new signal.SessionCipher(store, address);

            sessionCipher.encrypt(plaintext).then(function(ciphertext) {
                // ciphertext -> { type: <Number>, body: <string> }
                console.log('CIPHERTEXT')
                console.log(ciphertext)
                //handle(ciphertext.type, ciphertext.body);
                resolve(ciphertext)
            });
        }
        catch(e){reject(e)}
    })
    return(cipherPromise)
}

module.exports.encryptMessage = encryptMessage

decryptMessage = function(recipientId,deviceId,store,address,ciphertext){
    var cipherPromise = new Promise(function(resolve,reject){
        try{
            //var address2 = new signal.SignalProtocolAddress(recipientId, deviceId);
            //var sessionCipher = new signal.SessionCipher(store, address);

            // Decrypt a PreKeyWhisperMessage by first establishing a new session.
            // Returns a promise that resolves when the message is decrypted or
            // rejects if the identityKey differs from a previously seen identity for this
            // address.
            /*
            sessionCipher.decryptPreKeyWhisperMessage(ciphertext).then(function(plaintext) {
                // handle plaintext ArrayBuffer
                resolve(plaintext)
            }).catch(function(error) {
                // handle identity key conflict
            });
*/
            // Decrypt a normal message using an existing session
            var sessionCipher = new signal.SessionCipher(store, address);
            sessionCipher.decryptWhisperMessage(ciphertext.body).then(function(plaintext) {
                // handle plaintext ArrayBuffer
                resolve(plaintext)
            });
        }
        catch(e){reject(e)}
    })
    return(cipherPromise)
}
module.exports.decryptMessage = decryptMessage
                                                                                                                                                                                             