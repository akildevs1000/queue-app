const crypto = require('crypto');
const fs = require('fs');

function verifySignature(signature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(`App_Unlock_Temp_Name`);
    verify.end();

    return verify.verify(fs.readFileSync('public_key.pem', 'utf8'), Buffer.from(signature, 'base64'));
}

console.log(verifySignature(fs.readFileSync('signature', 'utf8')));


// module.exports = { verifySignature };
