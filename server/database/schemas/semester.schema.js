import { Schema } from 'mongoose';

const semesterSchema = new Schema(
  {
    term: { type: String, required: true },
    year: { type: Number, required: true },
    difficulty: { type: String },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
    // 0: Taken
    // 1: In Progress
    // 2: Planned
    status: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default semesterSchema;
