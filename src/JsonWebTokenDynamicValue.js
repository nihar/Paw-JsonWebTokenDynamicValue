import jsrsasign from 'jsrsasign';

@registerDynamicValueClass
class JsonWebTokenDynamicValue {
  static identifier = 'de.choffmeister.PawExtensions.JsonWebTokenDynamicValue';
  static title = 'Json Web Token';
  static help = 'https://github.com/choffmeister/Paw-JsonWebTokenDynamicValue';

  static inputs = [
    InputField('header', 'Header', 'JSON', {persisted: true, defaultValue: '{"typ": "JWT", "alg": "HS256"}'}),
    DynamicValueInput('payload', 'Payload', 'JSON'),
    DynamicValueInput('addTimeFields', 'Add Time Fields (iat & exp)', 'Checkbox', {defaultValue: true}),
    DynamicValueInput('signatureSecret', 'Secret', 'SecureValue'),
    DynamicValueInput('signatureSecretIsBase64', 'Secret is Base64', 'Checkbox')
  ];

  evaluate() {
    const now = Math.floor((new Date()).getTime() / 1000);

    const header = {
      typ: "JWT",
      alg: "HS256",
      ...this.header
    }
    let payload
    if(this.addTimeFields) {
      payload = {
        iat: now,
        exp: now + 60,
        ...this.payload,
      }
    } 
    else {
      payload = this.payload
    }

    const secret = this.signatureSecretIsBase64
      ? {b64: jsrsasign.b64utob64(this.signatureSecret)}
      : {rstr: this.signatureSecret};

    return jsrsasign.jws.JWS.sign(null, header, payload, secret);
  }
}
