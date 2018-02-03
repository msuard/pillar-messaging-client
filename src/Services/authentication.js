const request = require('request');

getTimestamp = function(){
    console.log('GETTING SERVER TIMESTAMP...')
    timestampPromise = new Promise(function(resolve,reject){
        try{
            request('https://pillar-chat-service-auth.herokuapp.com/v1/accounts/bootstrap', function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            var parsed = JSON.parse(body);
            //console.log(parsed)
            tmstmp=parsed.timestamp
            resolve(tmstmp)
            }).end()
        }
        catch(e){reject(e)}
    })
    return timestampPromise
}
module.exports.getTimestamp = getTimestamp

generateSignatureAddress = function(){
    console.log('GENERATING SIGNATURE...')
    var signature='signature'
    var address='address'
    return({signature,address})
}
module.exports.generateSignatureAddress = generateSignatureAddress

generateCredentials = function(username,password){
    console.log('GENERATING CREDENTIALS...')
    var authCred = "Basic " + new Buffer(username + ":" + password).toString("base64");
    return(authCred)
}
module.exports.generateCredentials = generateCredentials

generatePUTHeaders = function(authCred,tmstmp,signature,address){
    console.log('GENERATING HEADERS...')
    var headers = {
        'Content-Type': 'application/json',
        "Authorization" : authCred,
        'Toshi-Timestamp': tmstmp.toString(),
        //'Content-Length': bodyString.length
        'Toshi-ID-Address': address,
        'Toshi-Signature': signature,
        'Accept': 'application/json'
    };
    return(headers)
}
module.exports.generatePUTHeaders = generatePUTHeaders

generateGETHeaders = function(authCred){
    console.log('GENERATING HEADERS...')
    var headers = {
        "Authorization" : authCred,
    };
    return(headers)
}
module.exports.generateGETHeaders = generateGETHeaders


generatePUTOptions = function(url,path,port,method,headers,json){
    console.log('GENERATING OPTIONS...')
    var options = {
        uri: url+path,
        port: port,
        method: method,
        headers: headers,
        json:json
    };
    //console.log(options)
    return(options)
}
module.exports.generatePUTOptions = generatePUTOptions

generateGETOptions = function(url,path,port,method,headers){
    console.log('GENERATING OPTIONS...')
    var options = {
        uri: url+path,
        port: port,
        method: method,
        headers: headers,
    };
    //console.log(options)
    return(options)
}
module.exports.generateGETOptions = generateGETOptions
    