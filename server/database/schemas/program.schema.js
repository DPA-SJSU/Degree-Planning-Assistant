import mongoose, { Schema } from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    school: { type: String, required: true },
    major: { type: String, required: true },
    catalogYear: { type: String, required: true },
    requirements: [{ type: Schema.Types.ObjectId, ref: 'Requirement' }],
  },
  {
    timestamps: true,
  }
);

export default programSchema;
