
let accounts = require('./Services/accounts.js')
let gcm = require('./Services/gcm.js')
let keys = require('./Services/keys.js')
let messages = require('./Services/messages.js')
let sessions = require('./Services/sessions.js')
const encrypt = require('./Services/encrypt.js')

var fs = require('fs');

let wipeStore = function(storeNb){
    fs.stat('./src/Services/store_'+storeNb+'.json', function (err, stats) {
        //console.log(stats);//here we got all information of file in stats variable
     
        if (err) {
            return console.error(err);
        }
     
       fs.unlink('./src/Services/store_'+storeNb+'.json',function(err){
             if(err) return console.log(err);
             console.log('JSON store file deleted successfully');
        });  
     });
}

//wipeStore(1)
//wipeStore(2)


let username = "fcm-app-25"
let password = "pwd"
let gcmId1='eF1qD84g0H4:APA91bF4k2lZkzOnYIn0U1_Oh1IDxZ4H6EXAjRRoGAQsbrBS5OjdxP37FLrfjW-VcSnr9gZAh4czB5oVR4xlcOtWkxhHM5y4De4qVZcnEiopS9tuOWd69dQLZ-BFruyRBVs0Ijx8XfoM'
let gcmId2='cntJhnwKF6E:APA91bGZU6kgH_lKDHApUEQrc3fm3byjs7cdHwGIXA3602-o2BsG9lm3U-JaHUR6iSvo9zwNdSpmTychMsex5jaJG8bKsLrR2iQpSfk0rK0hQrzyqBal6b5NFd9COkCjVDl-hyrfsG_v'

let destination = "fcm-app-26"
let destDevID = 1


       
console.log('REGISTER NEW ACCOUNT 1 \n')
accounts.createNewAccount(username,password)
.then(function(store1){
    console.log('REGISTER FCM IID 1\n')
    gcm.registerGCMID(username,password,gcmId1)
    .then(function(){
        console.log('REGISTER KEYS 1\n')
        keys.registerKeys(username,password,store1)
        .then(function(store1){
            console.log('REGISTER NEW ACCOUNT 2\n')
            accounts.createNewAccount(destination,password)
            .then(function(store2){
                console.log('REGISTER FCM IID 2\n')
                gcm.registerGCMID(destination,password,gcmId2)
                .then(function(){
                    console.log('REGISTER KEYS 2\n')
                    keys.registerKeys(destination,password,store2)
                    .then(function(store2){
                    console.log('GET RECIPIENT KEYS 1\n')
                    keys.getRecipientKeys(username,password,destination,destDevID)
                    .then(function(preKeyBundle1){
                        console.log('BUILD SESSION 1\n')
                        console.log(store1)
                        sessions.buildSession(preKeyBundle1,store1)
                        .then(function(sessionObject1){
                            console.log('SESSION OBJECT')
                            console.log(sessionObject1)
                            let content='helloooooooooooooooooo'
                            let body='yoyoyoooo'
                            console.log('ENCRYPT MESSAGE \n')
                            encrypt.encryptMessage(body,sessionObject1.store,sessionObject1.address)
                            .then(function(ciphertext){
                                console.log('CYPHERTEXT')
                                console.log(ciphertext)
                                console.log(ciphertext.type)
                                console.log('CYPHERTEXT BODY')
                                console.log(typeof(ciphertext.body))
                                let destRegID = sessionObject1.address.getName()
                                content = 'ciphertext message'//
                                body = ciphertext.body//JSON.stringify(ciphertext)//'message body'//
                                let type = 0
                                let msgdestination=destination

                                console.log('SEND MESSAGE \n')
                                messages.sendMessage(username,password,destRegID,destDevID,content,body,msgdestination,type)
                                .then(function(){
                                    console.log('GET PENDING MESSAGES \n')
                                    messages.getPendingMessages(destination,password)
                                    .then(function(messagesJson){
                                        messagesArray=JSON.parse(messagesJson).messages
                                        console.log('PENDING MESSAGES ARRAY :\n')
                                        console.log (messagesArray)
                                        console.log (messagesArray.length)
                                        console.log(messagesArray[messagesArray.length-1].message)
                                        console.log(messagesArray[messagesArray.length-1].content)

                                        console.log('GET RECIPIENT KEYS 2\n')
                                        keys.getRecipientKeys(destination,password,username,destDevID)
                                        .then(function(preKeyBundle2){
                                            console.log('BUILD SESSION 2\n')
                                            sessions.buildSession(preKeyBundle2,store2)
                                            .then(function(sessionObject2){
                                                console.log('DECRYPT MESSAGE')
                                                    encrypt.decryptMessage(destRegID,destDevID,sessionObject2.store,sessionObject2.address,ciphertext)
                                                    .then(function(plaintext){
                                                        console.log(plaintext)
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })

                            })
                        })

                    })
                    /*
                        console.log('SEND MESSAGE \n')
                        messages.sendMessage(username,password,destRegID,destDevID,content,body,msgdestination,type)
                        .then(function(){
                            console.log('GET PENDING MESSAGES \n')
                            messages.getPendingMessages(destination,password)
                            .then(function(messagesJson){
                                messagesArray=JSON.parse(messagesJson).messages
                                console.log('PENDING MESSAGES ARRAY :\n')
                                console.log (messagesArray)
                                console.log (messagesArray.length)
                                console.log(messagesArray[messagesArray.length-1].message)
                                console.log(messagesArray[messagesArray.length-1].content)
                            })
                        })
                    })
                    */
                    
                })
            })
        })
   })
})
 /*           
        })
    })
})
*/
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

