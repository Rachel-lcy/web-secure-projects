// models/User.js
import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto.js';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, trim: true, maxlength: 50 },


    bioCipher: { type: String },
    bioIv: { type: String },
    bioTag: { type: String },


    role: { type: String, default: 'user' },
    department: { type: String, default: 'general' },
  },
  { timestamps: true }
);


UserSchema.methods.setBioPlain = function (plainBio) {
  const e = encrypt(String(plainBio || ''));
  this.bioCipher = e.cipherTextB64;
  this.bioIv = e.ivB64;
  this.bioTag = e.tagB64;
};
UserSchema.methods.getBioPlain = function () {
  if (!this.bioCipher || !this.bioIv || !this.bioTag) return '';
  return decrypt(this.bioCipher, this.bioIv, this.bioTag);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
