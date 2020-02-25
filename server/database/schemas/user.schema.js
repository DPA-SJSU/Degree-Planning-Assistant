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
  avatar_url: {
    type: String,
  },
  avatar_type: {
    type: String,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  bio: {
    type: String,
  },
  is_admin: {
    type: Boolean,
    isRequired: true,
  },
  courses_taken: {
    type: Array,
  },
  grad_date: {
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
  catalog_year: {
    type: Number,
  },
  degree_plan_id: {
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
