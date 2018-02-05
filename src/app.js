
let accounts = require('./Services/accounts.js')
let gcm = require('./Services/gcm.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')

var fs = require('fs');

fs.stat('./src/Services/store.json', function (err, stats) {
    //console.log(stats);//here we got all information of file in stats variable
 
    if (err) {
        return console.error(err);
    }
 
    fs.unlink('./src/Services/store.json',function(err){
         if(err) return console.log(err);
         console.log('JSON store file deleted successfully');
    });  
 });

let username = "fcm-app-1"
let password = "pwd"
let gcmId='d1EZIcYkAIU:APA91bHGpRcdXS87ajBal3fdpaqDIl0I-C5aglhkWrFzgN4etFjEzf3RBXSw6kMsxoKgsp6tKo66jfS32q8S2fXZrEq9KG7UCs63_xMdCvzCDDpQhlYql3jv5iKqrUWjTQ8-iQeNNDu5'
//let gcmId='fu5CtiuvofQ:APA91bGUKon-czCAcUDw8S45OGPtDvQ2ok-04aEGOMoZC-6UBirtkC06DbHNg-HKh1mtsiVGokfw18o-0coKyHvg7U03lxXUjUIhKgr2PJNx6OK5NyeTTTHaPYhe54k0r-QMdpsELCwA'

let destination = "fcm-app-2"
let destDevID = 1


accounts.createNewAccount(username,password)
.then(function(){
    gcm.registerGCMID(username,password,gcmId)
    .then(function(){
        keys.registerKeys(username,password)
        .then(function(){
            keys.getRecipientKeys(username,password,destination,destDevID)
            .then(function(preKeyBundle){
                sessions.buildSession(preKeyBundle)
                .then(function(sessionObject){
                    let content='hello'
                    let body='.'

                    encrypt.encryptMessage(body,sessionObject.store,sessionObject.address)
                    .then(function(ciphertext){
                        var destRegID = sessionObject.address.getName()
                        var content = content//ciphertext.body
                        var body = body//ciphertext.body
                        var type = 1
                        var msgdestination=destination
                        console.log('MESSAGES')
                        messages.sendMessage(username,password,destRegID,destDevID,content,body,msgdestination,type)
                    })
                })
            })
        })
    })
})

/*

keys.getRecipientKeys(username,password,destination,destDevID)
    .then(function(preKeyBundle){
        sessions.buildSession(preKeyBundle)
        .then(function(sessionObject){
            let plaintext='blablabla'
            encrypt.encryptMessage(plaintext,sessionObject.store,sessionObject.address)
            .then(function(ciphertext){
                var destRegID = sessionObject.address.getName()
                var content = ciphertext.body
                var body = ciphertext.body
                var type = 1
                var msgdestination=destination
                console.log('MESSAGES')
                messages.sendMessage(username,password,destRegID,destDevID,content,body,msgdestination,type)
            })
        })
    })

*/

