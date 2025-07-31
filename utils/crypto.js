
import 'dotenv/config';
import crypto from 'crypto';

const ALG = 'aes-256-gcm';


function getKey() {
  const raw = (process.env.PROFILE_ENC_KEY_BASE64 || '').trim();
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {

    throw new Error(`PROFILE_ENC_KEY_BASE64 must be a 32-byte base64 string; got ${key.length}`);
  }
  return key;
}

export function encrypt(plain) {
  const KEY = getKey();
  const iv = crypto.randomBytes(12);              // GCM 推荐 12 字节 IV
  const cipher = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([
    cipher.update(String(plain ?? ''), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    cipherTextB64: enc.toString('base64'),
    ivB64: iv.toString('base64'),
    tagB64: tag.toString('base64'),
  };
}

export function decrypt(cipherB64, ivB64, tagB64) {
  if (!cipherB64 || !ivB64 || !tagB64) return '';
  const KEY = getKey();
  const decipher = crypto.createDecipheriv(ALG, KEY, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(cipherB64, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}
