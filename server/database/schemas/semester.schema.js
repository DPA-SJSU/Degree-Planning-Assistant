import { Schema } from 'mongoose';

const semesterSchema = new Schema({
  term: { type: String, required: true },
  year: { type: Number, required: true },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
  status: { type: Number, required: true },
});

export default semesterSchema;
