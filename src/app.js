
let accounts = require('./Services/accounts.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')

var fs = require('fs');

fs.stat('./Services/store.json', function (err, stats) {
    //console.log(stats);//here we got all information of file in stats variable
 
    if (err) {
        return console.error(err);
    }
 
    fs.unlink('./Services/store.json',function(err){
         if(err) return console.log(err);
         console.log('JSON store file deleted successfully');
    });  
 });

let username = "max1"
let password = "pwd"

let destination = "max"
let destDevID = 1

accounts.createNewAccount(username,password)
.then(function(){
    keys.registerKeys(username,password)
    .then(function(){
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
    })
})





/*
keys.registerKeys(username,password)
accounts.createNewAccount(username,password)

.then(function(){
    keys.registerKeys(username,password)
    .then(function(){
        console.log('SUCCESS')
    })
})
*/
/*
let destRegID = 7693
let content = "hi"
let body = "whatsup"
let type = 4

messages.sendMessage(username,password,destRegID,destDevID,content,body,destination,type)
*/