import mongoose, { Schema } from 'mongoose';

const requirementSchema = new mongoose.Schema({
  // 0: generalEducation
  // 1: majorRequirement
  // 2: elective
  // 3: otherRequirement
  type: { type: Number, required: true },
  area: { type: String },
  name: { type: String },
  school: { type: String, uppercase: true },
  major: { type: String },
  requiredCredit: { type: Number },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  catalogYear: { type: String, required: true },
});

export default requirementSchema;
