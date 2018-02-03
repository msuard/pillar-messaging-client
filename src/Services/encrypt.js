const signal = require('signal-protocol')

encryptMessage = function(plaintext,store,address){
    var cipherPromise = new Promise(function(resolve,reject){
        try{
            var base64Encoded = plaintext.toString('base64')
            var sessionCipher = new signal.SessionCipher(store, address);

            sessionCipher.encrypt(base64Encoded).then(function(ciphertext) {
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

