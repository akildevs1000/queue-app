// license-generator-static.js
const crypto = require('crypto');

// Secret key (must match desktop)
const SECRET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Base32 helper
function toBase32(bytes) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let output = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    for (let i = 0; i + 5 <= bits.length; i += 5) {
        output += alphabet[parseInt(bits.slice(i, i + 5), 2)];
    }
    return output;
}

// Static nonce
const STATIC_NONCE = 'TEST';

// Generate license key
function generateLicense(machineId, expiryDate) {
    const raw = `${machineId}|${expiryDate}|${STATIC_NONCE}|${SECRET}`;
    const hash = crypto.createHash('sha256').update(raw).digest();
    const hashBase32 = toBase32([...hash]).slice(0, 16);

    return `LIC-${STATIC_NONCE}-${hashBase32.match(/.{1,4}/g).join('-')}`;
}

// Example usage
const machineId = '02f578a54b5ba54b321c50677a8855fa07760f6e8c2153db5b194eb9de2578ce';
const expiryDate = '2025-12-31';

const licenseKey = generateLicense(machineId, expiryDate);
console.log('Generated License Key:');
console.log(licenseKey);
