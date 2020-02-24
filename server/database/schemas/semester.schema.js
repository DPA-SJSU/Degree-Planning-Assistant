import { Schema } from 'mongoose';

const semesterSchema = new Schema({
  term: { type: String, required: true },
  year: { type: String, required: true },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
});

export default semesterSchema;
