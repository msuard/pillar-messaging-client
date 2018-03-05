
const request = require('request');
const ab2str = require('arraybuffer-to-string');
const crypto = require("crypto");
const signal = require('signal-protocol')
const auth = require('./authentication.js')
const SignalProtocolStore = require('./SignalProtocolStore.js')

createNewAccount2 = function(username,password,registrationID){
    console.log('CREATING NEW ACCOUNT...\n')
    newAccountPromise = new Promise(function(resolve,reject){
        try{
            //var store  = new SignalProtocolStore.SignalProtocolStore()
            auth.getTimestamp().then(function(tmstmp){
                let authCred = auth.generateCredentials(username,password)
                let signatureAddressObject = auth.generateSignatureAddress()
                let headers = auth.generatePUTHeaders(authCred,tmstmp,signatureAddressObject.signature,signatureAddressObject.address)
                //let registrationID = generateRegistrationID(store)
                let signalingKey = generateSignalingKey()
                let json = generateAccountJSON(signalingKey,registrationID,username)
                let url = 'https://pillar-chat-service-auth.herokuapp.com'
                let path = '/v1/accounts'
                let method = 'PUT'
                let port = 80
                let options = auth.generatePUTOptions(url,path,port,method,headers,json)
                requestNewAccount(request,options).then(function(){
                    console.log('NEW ACCOUNT CREATED: USERNAME = '+username+', PASSWORD = '+password+', REGISTRATION ID = '+registrationID+'\n')
                    resolve()
                })
            })
        }
        catch(e){reject(e)}
    })
    return(newAccountPromise)
}

module.exports.createNewAccount2 = createNewAccount2

createNewAccount = function(username,password,store){
    console.log('CREATING NEW ACCOUNT...\n')
    newAccountPromise = new Promise(function(resolve,reject){
        try{
            auth.getTimestamp().then(function(tmstmp){
                let authCred = auth.generateCredentials(username,password)
                let signatureAddressObject = auth.generateSignatureAddress()
                let headers = auth.generatePUTHeaders(authCred,tmstmp,signatureAddressObject.signature,signatureAddressObject.address)
                generateIdentity(store)
                .then(function(registrationID){
                    let signalingKey = generateSignalingKey()
                    let json = generateAccountJSON(signalingKey,registrationID,username)
                    let url = 'https://pillar-chat-service-auth.herokuapp.com'
                    let path = '/v1/accounts'
                    let method = 'PUT'
                    let port = 80
                    let options = auth.generatePUTOptions(url,path,port,method,headers,json)
                    requestNewAccount(request,options).then(function(){
                        console.log('NEW ACCOUNT CREATED: USERNAME = '+username+', PASSWORD = '+password+', REGISTRATION ID = '+registrationID+'\n')
                        resolve(registrationID)
                    })
                })
            })
        }
        catch(e){reject(e)}
    })
    return(newAccountPromise)
}

module.exports.createNewAccount = createNewAccount

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

requestNewAccount = function(request,options){
    console.log('HTTP PUT REQUEST...')
    newAccountPromise = new Promise(function(resolve,reject){
        try{
            request(options, function(error,response,body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
                resolve()
            })
        }
        catch(e){reject(e)}
    })
    return(newAccountPromise)
}

generateRegistrationID=function(store){
    console.log('GENERATING REGISTRATION ID...')
    let registrationID = signal.KeyHelper.generateRegistrationId();
    store.put('registrationId', registrationID);
    return(registrationID)
}


generateSignalingKey = function(){
    console.log('GENERATING SIGNALING KEY...')
    var signalingKey = ab2str(crypto.randomBytes(416),'base64')
    return(signalingKey)
}
generateAccountJSON = function(signalingKey,registrationID,username){
    console.log('GENERATING JSON...')
    var json= {
        "signalingKey": signalingKey,
        "fetchesMessages": true,
        "registrationId": registrationID,
        "name": username,
        "voice": false
    }
    return (json)
}


