
const request = require('request');
const ab2str = require('arraybuffer-to-string');
const crypto = require("crypto");
const signal = require('signal-protocol')
const auth = require('./authentication.js')
const SignalProtocolStore = require('./SignalProtocolStore.js')
var store  = new SignalProtocolStore.SignalProtocolStore()

registerGCMID = function(username,password,gcmId){
    console.log('REGISTERING GCM ID...\n')
    registerGCMIDPromise = new Promise(function(resolve,reject){
        try{
            auth.getTimestamp().then(function(tmstmp){
                let authCred = auth.generateCredentials(username,password)
                let signatureAddressObject = auth.generateSignatureAddress()
                let headers = auth.generatePUTHeaders(authCred,tmstmp,signatureAddressObject.signature,signatureAddressObject.address)
                let json = generateGCMJSON(gcmId)
                let url = 'https://pillar-chat-service-auth.herokuapp.com'
                let path = '/v1/accounts/gcm'
                let method = 'PUT'
                let port = 80
                let options = auth.generatePUTOptions(url,path,port,method,headers,json)
                requestRegisterGCMID(request,options).then(function(){
                    console.log('GCM ID REGISTERED\n')
                    resolve()
                })
            })
        }
        catch(e){reject(e)}
    })
    return(registerGCMIDPromise)
}

module.exports.registerGCMID = registerGCMID

requestRegisterGCMID= function(request,options){
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

generateGCMJSON = function(gcmId){
    console.log('GENERATING JSON...')
    var json= {
        gcmRegistrationId: gcmId
      }
    return (json)
}


