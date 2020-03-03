import { Schema } from 'mongoose';
import sha256 from 'sha256';

const userSchema = new Schema({
  hashedPassword: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
  },
  avatarType: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  bio: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    isRequired: true,
  },
  coursesTaken: [
    { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  ],
  gradDate: {
    year: {
      type: Number,
    },
    term: {
      type: String,
    },
  },
  major: {
    type: String,
  },
  minor: {
    type: String,
  },
  catalogYear: {
    type: Number,
  },
  degreePlanId: {
    type: Schema.Types.ObjectId,
    ref: 'program',
  },
});

/**
 * @param {*} password
 */
userSchema.methods.comparePassword = function comparePassword(password) {
  return this.hashedPassword === sha256(password);
};

export default userSchema;
