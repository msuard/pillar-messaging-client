
const auth = require('./authentication.js')
const request = require('request');


sendMessage = function(username,password,destRegID,destDevID,content,body,destination,type){
    console.log('SENDING MESSAGE..\n')
    newAccountPromise = new Promise(function(resolve,reject){
        try{
            auth.getTimestamp().then(function(tmstmp){
                let authCred = auth.generateCredentials(username,password)
                let signatureAddressObject = auth.generateSignatureAddress()
                let headers = auth.generatePUTHeaders(authCred,tmstmp,signatureAddressObject.signature,signatureAddressObject.address)
                console.log('HEADERS')
                console.log(headers)
                let json = generateMessageJSON(tmstmp,destRegID,destDevID,content,body,destination,type)
                let url = 'https://pillar-chat-service-auth.herokuapp.com'
                let path = '/v1/messages/'+destination
                let method = 'PUT'
                let port = 80
                let options = auth.generatePUTOptions(url,path,port,method,headers,json)
                console.log('MSG OPTIONS')
                console.log(options)
                console.log('MSG BODY')
                console.log(json)
                requestSendMessage(request,options).then(function(){
                    console.log('MESSAGE SENT\n')
                    resolve()
                })
            })
        }
        catch(e){
            console.log('ERROR SENDING MESSAGE')
            reject(e)}
    })
    return(newAccountPromise)
}
module.exports.sendMessage = sendMessage

requestSendMessage = function(request,options){
    console.log('HTTP PUT REQUEST...')
    console.log(options.json)
    newMessagePromise = new Promise(function(resolve,reject){
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
    return(newMessagePromise)
}

generateMessageJSON = function(tmstmp,destRegID,destDevID,content,body,destination,type){
    console.log('GENERATING JSON...')

    var json = {
            //"relay": "est",
            "messages": [
            {
                "timestamp": tmstmp,
                "destinationRegistrationId": destRegID,
                "content": content,
                "body": body,
                "destinationDeviceId": destDevID,
                "destination": destination,
                "type": type
            }
            ]
        }
        return (json)
}