const signal = require('signal-protocol')
const ab2str = require('arraybuffer-to-string');
const str2ab =require('string-to-arraybuffer')
const base64 = require('base-64');

encryptDecrypt = function(){
    var signalstream = require('signal-stream')
    var signal = require('signal-protocol')
    var h = require('signal-stream/test/helpers')(signal)
    
    h.bobAliceSessionCiphers()
    .then(([aliceCipher, bobCipher]) => {
        let alice = signalstream(aliceCipher)
        let bob = signalstream(bobCipher)
        require('http')
        .get({
            hostname:'info.cern.ch',
            path: '/hypertext/WWW/TheProject.html',
        }, res => {
            res
            .pipe(alice.encrypt)
            .pipe(bob.decrypt)
            .pipe(bob.encrypt)
            .pipe(alice.decrypt)
            .on('data', d =>
                console.log(d.toString()))
        })
    })
}

encryptMessage = function(plaintext,store,address){
    var cipherPromise = new Promise(function(resolve,reject){
        try{
            var base64AB = str2ab(plaintext,'base64')
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

decryptMessage = function(store,address,ciphertext){
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
            var cipher = new signal.SessionCipher(store, address);
            //sessionCipher.decryptWhisperMessage(ciphertext,'binary').then(function(plaintext) {
            //sessionCipher.decryptPreKeyWhisperMessage(ciphertext,'binary').then(function(plaintext) {
                // handle plaintext ArrayBuffer

            function bufferify (ab) {
                var b = new Buffer(ab)
                resolve(b)
            }
            // returns a promise of plaintext
           
                if (ciphertext.type == 3)
                console.log('DECRYPT PRE KEY WHISPER MSG')
                return cipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
                .then(bufferify)
                console.log('DECRYPT WHISPER MSG')
                return cipher.decryptWhisperMessage(ciphertext.body, 'binary')
                .then(bufferify)
            

            //resolve(plaintext)
            //});
        }
        catch(e){reject(e)}
    })
    return(cipherPromise)
}
module.exports.decryptMessage = decryptMessage
                                                                                                                                                                                             