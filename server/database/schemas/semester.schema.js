import { Schema } from 'mongoose';

const semesterSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  season: { type: String, required: true },
  year: { type: String, required: true },
  isCompleted: { type: Boolean },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
});

export default semesterSchema;
