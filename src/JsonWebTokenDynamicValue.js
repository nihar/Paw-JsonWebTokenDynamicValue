import jsrsasign from 'jsrsasign';

// list from
// https://kjur.github.io/jsrsasign/api/symbols/KJUR.jws.JWS.html#.sign
const SUPPORTED_ALGS = [
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
  'PS256',
  'PS384',
  'PS512'
]
let ALGS_CHOICES = {}
SUPPORTED_ALGS.forEach(alg => {
  ALGS_CHOICES[alg] = alg
})

@registerDynamicValueClass
class JsonWebTokenDynamicValue {
  static identifier = 'de.choffmeister.PawExtensions.JsonWebTokenDynamicValue';
  static title = 'Json Web Token (JWT)';
  static help = 'https://github.com/luckymarmot/Paw-JsonWebTokenDynamicValue';
  static inputs = [
    InputField('alg', 'Algorithm', 'Select', {choices: ALGS_CHOICES, defaultValue: 'HS256'}),
    InputField('header', 'Header', 'JSON', {defaultValue: '{}'}),
    InputField('payload', 'Payload', 'JSON'),
    InputField('addTimeFields', 'Add Time Fields (iat, nbf & exp)', 'Checkbox', {defaultValue: true}),
    InputField('signatureSecret', 'Secret', 'SecureValue'),
    InputField('signatureSecretIsBase64', 'Secret is Base64', 'Checkbox')
  ];

  title() {
    return 'JSON Web Token'
  }

  evaluate() {
    const now = Math.floor((new Date()).getTime() / 1000);
    const header = {
      typ: "JWT",
      alg: "HS512",
      ...this.header
    }

    let payload
    if(this.addTimeFields) {
      payload = {
        alg: this.alg,
        ...this.payload,
        iat: now,
        nbf: now - 1,
        exp: now + 60
      }
    } else {
      payload = { 
        alg: this.alg,
        ...this.payload 
      }
    }

    const secret = this.signatureSecretIsBase64
      ? {b64: jsrsasign.b64utob64(this.signatureSecret)}
      : {utf8: this.signatureSecret}

    console.log(`Sign JWT: Header: ${JSON.stringify(header)} Payload: ${JSON.stringify(payload)} Secret: ${JSON.stringify(secret)}`)
    if (SUPPORTED_ALGS.indexOf(header.alg) < 0) {
      console.error(`Unsupported algorithm '${header.alg}' (supports ${SUPPORTED_ALGS.join(', ')})`)
    }

    return jsrsasign.jws.JWS.sign(null, header, payload, secret);
  }
}
