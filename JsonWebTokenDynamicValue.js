// Inspired by https://github.com/LordZardeck/PAW-Auth0TokenDynamicValue
var jsrassign = require('./jsrassign-5.0.5');

var JsonWebToken = function() {
  this.evaluate = function() {
    var now = Math.floor((new Date()).getTime() / 1000);

    var header = {
      typ: "JWT",
      alg: "HS256"
    };
    var payload = this.payload.reduce(function (result, item) {
      if (item[2]) {
        result[item[0]] = item[1];
      }
      return result;
    }, {
      'exp': now + (60 * 60 * 24 * 7),
      'iat': now
    });

    var secret = this.signatureSecretType === 'base64'
      ? {b64: jsrassign.b64utob64(this.signatureSecret)}
      : this.signatureSecret;

    return jsrassign.jws.JWS.sign(null, header, payload, secret);
  }
};

JsonWebToken.identifier = "de.choffmeister.PawExtensions.JsonWebTokenDynamicValue";
JsonWebToken.title = "Json Web Token";
JsonWebToken.inputs = [
  DynamicValueInput("payload", "Payload", "KeyValueList"),
  DynamicValueInput("signatureSecret", "Secret", "SecureValue"),
  DynamicValueInput("signatureSecretType", "Secret type", "Select", {
    "choices": {
      "plain":"Plain",
      "base64":"Base64"
    }
  })
];

registerDynamicValueClass(JsonWebToken);
