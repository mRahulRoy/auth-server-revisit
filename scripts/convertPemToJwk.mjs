/* eslint-disable */
import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';
import crypto from 'crypto';

const privateKey = fs.readFileSync('./certs/private.pem', 'utf8');

// 1. Convert PEM → JWK
const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

// 2. Add `kid` (unique hona chahiye)
jwk.kid = crypto
    .createHash('sha256')
    .update(privateKey) // private key ka hash
    .digest('hex')
    .slice(0, 16); // short id

// 3. Write JWKS file
fs.writeFileSync(
    './public/.well-known/jwks.json',
    JSON.stringify({ keys: [jwk] }, null, 2),
);

console.log('JWKS generated with kid:', jwk.kid);
