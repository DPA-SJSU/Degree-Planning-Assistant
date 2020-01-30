import { Schema } from 'mongoose';
import sha256 from 'sha256';

const userSchema = new Schema({
  hashedPassword: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: { type: String },
  avatarType: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  dob: { type: Date },
  bio: { type: String },
  address: { type: String },
  phone: { type: String },
  gender: { type: Number },
  addedInfo: { type: [Object] }
});

/**
 * @param {*} password
 */
userSchema.methods.comparePassword = function comparePassword(password) {
  return this.hashedPassword === sha256(password);
};

export default userSchema;
