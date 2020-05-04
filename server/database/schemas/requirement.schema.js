import mongoose, { Schema } from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    // 0: generalEducation
    // 1: majorRequirement
    // 2: elective
    // 3: otherRequirement
    school: { type: String },
    major: { type: String },
    catalogYear: { type: Number },
    type: { type: Number, required: true },
    area: { type: String, required: true },
    name: { type: String },
    requiredCredit: { type: Number },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: true,
  }
);

export default requirementSchema;
