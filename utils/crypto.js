
import crypto from 'crypto';

const ALG = 'aes-256-gcm';
const KEY = Buffer.from(process.env.PROFILE_ENC_KEY_BASE64 || '', 'base64');

if (KEY.length !== 32) {
  throw new Error('PROFILE_ENC_KEY_BASE64 must be a 32-byte base64 string');
}


export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plain || ''), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipherTextB64: enc.toString('base64'),
    ivB64: iv.toString('base64'),
    tagB64: tag.toString('base64'),
  };
}


export function decrypt(cipherB64, ivB64, tagB64) {
  if (!cipherB64 || !ivB64 || !tagB64) return '';
  const decipher = crypto.createDecipheriv(ALG, KEY, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(cipherB64, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}
