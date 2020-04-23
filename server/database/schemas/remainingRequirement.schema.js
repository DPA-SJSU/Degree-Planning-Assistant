import mongoose, { Schema } from 'mongoose';

const remainingRequirementSchema = new mongoose.Schema({
  // 0: generalEducation
  // 1: majorRequirement
  // 2: elective
  // 3: otherRequirement
  type: { type: Number, required: true },
  area: String,
  name: String,
  major: String,
  catalogYear: String,
  creditLeft: Number,
  school: { type: String, uppercase: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

export default remainingRequirementSchema;
