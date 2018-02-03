
var jsonfile = require('jsonfile')
const str2ab =require('string-to-arraybuffer')
const signal = require('signal-protocol')

appendObject = function(key,value){
    console.log('PUT STORE')
    try{
        var json=require('./store.json');
        console.log('BEFORE')
        console.log(json)
    }
    catch(e){
        var json={}
        console.log('WARNING: '+e)
    }
    //var json={}
    json[key]=value
    console.log('AFTER')
    console.log(json)
    //jsonfile.writeFile('./config.json', json, {flag: 'a'}, function (err) {
    jsonfile.writeFileSync('./Services/store.json', json, function (err) {
        console.error(err)
      })
}

getJSON = function(){
    console.log('GET STORE')
    var json = require('./store.json');
    //var jsomn = JSON.parse(json);
    return(json)
}

getJSONKey = function(key,defaultValue){
    console.log('GET STORE KEY')
    //console.log(key)
    try{

        var json = require('./store.json');
        //console.log(json)
        //console.log(key=='identityKey')

        if(key=='identityKey' || key=='25519KeysignedKey0'){
            var jsonKeyAB = {
                pubKey: str2ab(json[key].pubKey),
                privKey: str2ab(json[key].privKey)
            }
            console.log('PUBKEY')
            console.log(jsonKeyAB.pubKey)
            console.log(new Uint8Array(jsonKeyAB.pubKey))
            console.log('PRIVKEY')
            console.log(jsonKeyAB.privKey)
            return(jsonKeyAB)
        }
        else{
            return(json[key])
        }
        
    }
    catch(e){return(defaultValue)}
    
}

removeKey = function(key){
    var json = require('./store.json');
    //var config = JSON.parse(configFile);
    delete json[key]; 
    jsonfile.writeFile('./Services/store.json', json, function (err) {
        console.error(err)
      })
}


//function SignalProtocolStore() {
//    this.store = {};
//  }

 
  var SignalProtocolStore = (function(){
  //SignalProtocolStore.prototype = {
    return{
    store : {},

    Direction: {
      SENDING: 1,
      RECEIVING: 2,
    },
  
    getIdentityKeyPair: function() {
        console.log('GET IDENTITY KEY PAIR')
      return Promise.resolve(this.get('identityKey'));
    },
    getLocalRegistrationId: function() {
      return Promise.resolve(this.get('registrationId'));
    },
    put: function(key,value) {
      if (key === undefined || value === undefined || key === null || value === null)
        throw new Error("Tried to store undefined/null");
      this.store[key] = value;
      appendObject(key,value);
    },
    get: function(key, defaultValue) {
        if (key === null || key === undefined)
            throw new Error("Tried to get value for undefined/null key");
        //if (key in this.store) {
            //return this.store[key];
            console.log('GET KEY')
            console.log(getJSONKey(key,defaultValue))
            return getJSONKey(key,defaultValue)
       // } else {
       //     return defaultValue;
      //}
    },
    remove: function(key) {
      if (key === null || key === undefined)
        throw new Error("Tried to remove value for undefined/null key");
      delete this.store[key];
      removeKey(key)
    },
  
    isTrustedIdentity: function(identifier, identityKey, direction) {

        console.log('IS TRUSTED IDENTITY')
      if (identifier === null || identifier === undefined) {
        throw new Error("tried to check identity key for undefined/null key");
      }
      if (!(identityKey instanceof ArrayBuffer)) {
        throw new Error("Expected identityKey to be an ArrayBuffer");
      }
      var trusted = this.get('identityKey' + identifier);
      if (trusted === undefined) {
        return Promise.resolve(true);
      }
      return Promise.resolve(util.toString(identityKey) === util.toString(trusted));
    },
    loadIdentityKey: function(identifier) {
        console.log('LOAD IDENTITY KEY')
      if (identifier === null || identifier === undefined)
        throw new Error("Tried to get identity key for undefined/null key");
      return Promise.resolve(this.get('identityKey' + identifier));
    },
    saveIdentity: function(identifier, identityKey) {
        console.log('SAVE IDENTITY')
        console.log(identifier)
        console.log(typeof(identifier))
      if (identifier === null || identifier === undefined)
        throw new Error("Tried to put identity key for undefined/null key");
  
      var address = new signal.SignalProtocolAddress.fromString(identifier+'.1');
        console.log(address)
      var existing = this.get('identityKey' + address.getName());
      this.put('identityKey' + address.getName(), identityKey)
  
      if (existing && util.toString(identityKey) !== util.toString(existing)) {
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
  
    },
  
    /* Returns a prekeypair object or undefined */
    loadPreKey: function(keyId) {
        console.log('LOAD PREKEY')
      var res = this.get('25519KeypreKey' + keyId);
      if (res !== undefined) {
        res = { pubKey: res.pubKey, privKey: res.privKey };
      }
      return Promise.resolve(res);
    },
    storePreKey: function(keyId, keyPair) {
      return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair));
    },
    removePreKey: function(keyId) {
      return Promise.resolve(this.remove('25519KeypreKey' + keyId));
    },
  
    /* Returns a signed keypair object or undefined */
    loadSignedPreKey: function(keyId) {
        console.log('LOAD SIGNED PREKEY')
      var res = this.get('25519KeysignedKey' + keyId);
      if (res !== undefined) {
        res = { pubKey: res.pubKey, privKey: res.privKey };
      }
      return Promise.resolve(res);
    },
    storeSignedPreKey: function(keyId, keyPair) {
      return Promise.resolve(this.put('25519KeysignedKey'+keyId,keyPair));
    },
    removeSignedPreKey: function(keyId) {
      return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
    },
  
    loadSession: function(identifier) {
        console.log('LOAD SESSION')
      return Promise.resolve(this.get('session' + identifier));
    },
    storeSession: function(identifier, record) {
      return Promise.resolve(this.put('session' + identifier, record));
    },
    removeSession: function(identifier) {
      return Promise.resolve(this.remove('session' + identifier));
    },
    removeAllSessions: function(identifier) {
      for (var id in this.store) {
        if (id.startsWith('session' + identifier)) {
          delete this.store[id];
          removeKey(key)
        }
      }
      return Promise.resolve();
    }
  };
  })
  module.exports.SignalProtocolStore = SignalProtocolStore