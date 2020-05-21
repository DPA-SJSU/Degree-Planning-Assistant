import { Schema } from 'mongoose';
import sha256 from 'sha256';

const userSchema = new Schema(
  {
    hashedPassword: String,
    email: String,
    avatarUrl: String,
    avatarType: String,
    firstName: String,
    lastName: String,
    bio: String,
    isAdmin: Boolean,
    gradDate: { year: Number, term: String },
    school: String,
    major: String,
    minor: String,
    catalogYear: Number,
    degreePlan: { type: Schema.Types.ObjectId, ref: 'Plan' },
    coursesTaken: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    emailConfirmed: { type: Boolean, default: false },
    token: String,
    // Google Login
    googleId: String,
    googleObj: {
      fullName: String,
      email: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @param {*} password
 */
userSchema.methods.comparePassword = function comparePassword(password) {
  return this.hashedPassword === sha256(password);
};

export default userSchema;
