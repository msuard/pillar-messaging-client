const url = require('url');
const rp = require('request-promise-native');
const keccak256 = require('js-sha3').keccak_256;

// abuse the oauth callback to inject request signing info
rp.Request.prototype.oauth = function(signing_key) {
  let hash;
  if (this.body) {
    hash = new Buffer(keccak256.array(this.body)).toString('base64');
  } else {
    hash = '';
  }
  let timestamp = parseInt(new Date().getTime() / 1000);
  let data =
      this.method.toUpperCase() + "\n" +
      this.uri.path + "\n" +
      timestamp + "\n" +
      hash;
  let sig = signing_key.sign(data);
  
  //console.log("siiiiii" + sig )
  this.setHeader('Token-ID-Address', signing_key.getPublic());
  this.setHeader('Token-Timestamp', timestamp);
  this.setHeader('Token-Signature', sig);
}

function fetch(request ,response) {
  if (typeof request === 'object' && request['sign']) {
    request.oauth = request['sign'];
  }
  return rp(request ,response);
}

module.exports = fetch;