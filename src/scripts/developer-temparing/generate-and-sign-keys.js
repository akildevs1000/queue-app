const crypto = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

fs.writeFileSync('public_key.pem', publicKey);
fs.writeFileSync('private_key.pem', privateKey);


// Generate signature
const sign = crypto.createSign('SHA256');
sign.update(`App_Unlock_Temp_Name`);
sign.end();
const signature = sign.sign(privateKey, 'base64');
fs.writeFileSync('signature', signature);
console.log(signature);