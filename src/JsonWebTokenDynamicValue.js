import jsrsasign from 'jsrsasign';

@registerDynamicValueClass
class JsonWebTokenDynamicValue {
  static identifier = 'de.choffmeister.PawExtensions.JsonWebTokenDynamicValue';
  static title = 'Json Web Token';
  static help = 'https://github.com/choffmeister/Paw-JsonWebTokenDynamicValue';

  static inputs = [
    DynamicValueInput('isExpired', 'Expired', 'Checkbox'),
    DynamicValueInput('payload', 'Payload', 'JSON'),
    DynamicValueInput('signatureSecret', 'Secret', 'SecureValue'),
    DynamicValueInput('signatureSecretIsBase64', 'Secret is Base64', 'Checkbox')
  ];

  evaluate() {
    const now = Math.floor((new Date()).getTime() / 1000);
    const oneHour = 60 * 60;

    const header = {
      typ: 'JWT',
      alg: 'HS256'
    };
    const payload = {
      ...this.payload,
      exp: !this.isExpired ? now + oneHour : now - oneHour,
      iat: !this.isExpired ? now           : now - 2*oneHour
    };

    const secret = this.signatureSecretIsBase64
      ? {b64: jsrsasign.b64utob64(this.signatureSecret)}
      : this.signatureSecret;

    return jsrsasign.jws.JWS.sign(null, header, payload, secret);
  }
}
