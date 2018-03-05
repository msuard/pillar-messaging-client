const request = require('request');
const signal = require('signal-protocol')
const ab2str = require('arraybuffer-to-string');
const str2ab =require('string-to-arraybuffer')
const auth = require('./authentication.js')
const SignalProtocolStore = require('./SignalProtocolStore.js')


getRecipientKeys = function(username,password,destination,deviceID){
    console.log('REQUESTING DESTINATION KEYS')
    recipientKeysPromise = new Promise(function(resolve,reject){
        try{
            let authCred = auth.generateCredentials(username,password)
            let headers = auth.generateGETHeaders(authCred)
            console.log(headers)
            let url = 'https://pillar-chat-service-auth.herokuapp.com'
            let path = '/v2/keys/'+destination+'/'+deviceID.toString()
            let method = 'GET'
            let port = 80
            let options= auth.generateGETOptions(url,path,port,method,headers)
            request(options, function(error,response,body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
                console.log('DONE')
                var preKeyBundle = JSON.parse(body);
                //console.log('PARSED')
                //console.log(preKeyBundle)
                var json = recoverPreKeysBundleJSON(preKeyBundle)
                console.log('RECOVERED')
                console.log(json)
                //console.log(json.devices[0].signedPreKey)
                //console.log(json.devices[0].preKey)
                resolve(json)
            })
        }
        catch(e){reject(e)}
    })
    return(recipientKeysPromise)
}
module.exports.getRecipientKeys = getRecipientKeys

registerKeys = function(username,password,store){
    console.log('REGISTERING MESSAGING KEYS...\n')
    registerKeysPromise = new Promise(function(resolve,reject){
        try{
            //var store  = new SignalProtocolStore.SignalProtocolStore(storeNb)
            auth.getTimestamp().then(function(tmstmp){
                let authCred = auth.generateCredentials(username,password)
                let signatureAddressObject = auth.generateSignatureAddress()
                let headers = auth.generatePUTHeaders(authCred,tmstmp,signatureAddressObject.signature,signatureAddressObject.address)
                //var store  = new SignalProtocolStore.SignalProtocolStore(storeNb)
                generateKeysJSON(store)
                //generatePreKeyBundle(store,1,1)
                .then(function(json){
                    console.log(json)
                    let url = 'https://pillar-chat-service-auth.herokuapp.com'
                    let path = '/v2/keys'
                    let method = 'PUT'
                    let port = 80
                    let options = auth.generatePUTOptions(url,path,port,method,headers,json)
                    requestRegisterKeys(request,options).then(function(){
                        console.log('DONE\n')
                        resolve(store)
                    })
                })
            })
        }
        catch(e){reject(e)}
    })
    return(registerKeysPromise)
}
module.exports.registerKeys = registerKeys

requestRegisterKeys = function(request,options){
    registerKeysPromise = new Promise(function(resolve,reject){
        try{
            console.log('HTTP PUT REQUEST...')
            request(options, function(error,response,body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
                resolve()
            })
        }
        catch(e){reject(e)}
    })
    return(registerKeysPromise)
}


generateKeysJSON = function(store){

    jsonPromise = new Promise(function(resolve,reject){
        try{

            return Promise.all([
                store.getIdentityKeyPair(),
                store.getLocalRegistrationId()
              ]).then(function(result) {
                var identityKeyPair = result[0];
                var registrationId = result[1];

            var keyId
/*         
            signal.KeyHelper.generateIdentityKeyPair().then(function(identityKeyPair) {
                // keyPair -> { pubKey: ArrayBuffer, privKey: ArrayBuffer }
                // Store identityKeyPair somewhere durable and safe.
                //console.log('IDENTITYKEYPAIR')
                //console.log(identityKeyPair)
                identityKeyPairStore = {
                    pubKey : identityKeyPair.pubKey,
                    privKey : identityKeyPair.privKey,
                }
                //console.log(identityKeyPairStore)
                store.put('identityKey',identityKeyPairStore);
*/
                //console.log('\nID KEY PAIR\n:')
                //console.log(identityKeyPair)
                //console.log('\n')

                signal.KeyHelper.generatePreKey(16777215).then(function(lastResortKey){ //Generate lastResortKey with unique keyID (don't change)
                    console.log(store)
                    genPreKeysArray([],0,store)
                    .then(function(preKeysArray){
                        
                        let keyId=0 //Any integer
                    
                        signal.KeyHelper.generateSignedPreKey(identityKeyPair, keyId).then(function(signedPreKey) {
                            //console.log('SIGNEDPREKEY')
                            //console.log(signedPreKey)
                            signedPreKeyStore = {
                                keyId : signedPreKey.keyId,
                                keyPair : {
                                    pubKey : signedPreKey.keyPair.pubKey,
                                    privKey : signedPreKey.keyPair.privKey,
                                }
                            }
                            //console.log(signedPreKeyStore)
                            store.storeSignedPreKey(signedPreKeyStore.keyId, signedPreKeyStore.keyPair);
                            //console.log('SIGNED PRE KEY\n:')
                            //console.log(signedPreKey)
                            //console.log('\n')
                        
                            //console.log(parseInt('0xFFFFFF'))
                            
                            var json = {
                                "identityKey": ab2str(identityKeyPair.pubKey, 'base64'),
                                //"registrationId" : registrationId,
                                "lastResortKey": {
                                    "keyId": 16777215,
                                    "publicKey": ab2str(lastResortKey.keyPair.pubKey, 'base64')
                                },
                                "preKeys": preKeysArray,
                                "signedPreKey": {
                                    "keyId": 0,
                                    "publicKey": ab2str(signedPreKey.keyPair.pubKey, 'base64'),
                                    "signature": ab2str(signedPreKey.signature, 'base64')
                                }
                            }
                            resolve(json)
                        })
                    })
                })
            })
        }
        catch(e){reject(e)}
    })
    return(jsonPromise)
}

function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    jsonPromise = new Promise(function(resolve,reject){
    return Promise.all([
      store.getIdentityKeyPair(),
      store.getLocalRegistrationId()
    ]).then(function(result) {
      var identity = result[0];
      //var registrationId = result[1];
  
      return Promise.all([
        signal.KeyHelper.generatePreKey(preKeyId),
        signal.KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
      ]).then(function(keys) {
        var preKey = keys[0];
        var signedPreKey = keys[1];
  
        store.storePreKey(preKeyId, preKey.keyPair);
        store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
        
        resolve( {
          "identityKey" : ab2str(identity.pubKey,'base64'),
          //"registrationId" : registrationId,
          "preKey" :  {
            "keyId"     : preKeyId,
            "publicKey" : ab2str(preKey.keyPair.pubKey,'base64'),
          },
          "signedPreKey" : {
            "keyId"     : signedPreKeyId,
            "publicKey" : ab2str(signedPreKey.keyPair.pubKey,'base64'),
            "signature" : ab2str(signedPreKey.signature,'base64'),
          }
        });
      });
    });
})
return(jsonPromise)
  }


genPreKeysArray=function(preKeysArray,index,store){
    
    var preKeysArrayPromise=new Promise (function(resolve, reject){
        
        if (index==10){
            resolve(preKeysArray)
        }
        else{
            
            signal.KeyHelper.generatePreKey(index)
            .then(function(preKey){
                console.log('STORE PRE KEY')
                console.log(store)
                store.storePreKey(preKey.keyId, preKey.keyPair);
                preKeysArray.push({"keyId": preKey.keyId.toString(), "publicKey": '0x05'+ab2str(preKey.keyPair.pubKey, 'base64'), "identityKey": ab2str(preKey.keyPair.privKey, 'base64')})
                //console.log(preKeysArray[-1].publicKey.length)
                resolve(genPreKeysArray(preKeysArray,index+1,store))
            })
        }
    
    })
    return(preKeysArrayPromise)
}

recoverPreKeysBundleJSON = function(preKeyBundle){

    //console.log(preKeyBundle)
    //console.log(preKeyBundle.devices[0].registrationId)
    //console.log(preKeyBundle.devices[0].signedPreKey)
    //console.log(preKeyBundle.devices[0].preKey)

    let devicesArray=[]
    preKeyBundle.devices.forEach(function(item){
        console.log('PREKEY BUNDLE ITEM')
        console.log(item)
        devicesArray.push(
            {   
                identityKey: str2ab(preKeyBundle.identityKey),
                //deviceId: item.deviceId,
                registrationId: item.registrationId,
                signedPreKey: {
                    keyId: item.signedPreKey.keyId,
                    publicKey: str2ab(item.signedPreKey.publicKey),
                    signature: str2ab(item.signedPreKey.signature)
                },
                preKey: {
                    keyId: item.preKey.keyId,
                    publicKey: str2ab(item.preKey.publicKey).slice(3),
                }
            }
        )
    })

    var json = {
        identityKey: str2ab(preKeyBundle.identityKey),
        devices:  devicesArray
        }
/*
        {
            "identityKey":"BRjd2SiH0K6qAxMS8Pp0g4yEi0fiQIS3U2BGqFXtBFIu",
            "devices":
            [
                {
                    "deviceId":1,
                    "registrationId":2266,
                    "signedPreKey":
                    {
                        "keyId":0,
                        "publicKey":"BZnvp9196jI1vxYE7ODXUuC3XBWnIVG/HIqWdEyABhBS",
                        "signature":"a2G57m/nlfCdPQsHw0hcjbHomG4+R8yNkCFd3u5MsJrfvqTGTyAdA3NLcNdkq+U57vyxnt1WJSfr8ZYMWxvpjQ=="
                    },
                    "preKey":
                    {
                        "keyId":2,
                        "publicKey":"0x05Bd+PxbSrBJKKGkX/PJ9/YbZ7ALC+5RIUP5pbwnxCA1dH"
                    }
                }
            ]
        }
*/
    //console.log('JSON')
  //console.log(json)
    return(json)
}