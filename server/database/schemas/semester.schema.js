import { Schema } from 'mongoose';

const semesterSchema = new Schema({
<<<<<<< HEAD
  term: { type: String, required: true },
  year: { type: String, required: true },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
=======
  season: { type: String, required: true },
  year: { type: String, required: true },
  isCompleted: { type: Boolean },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
>>>>>>> code skeleton for text scanner
});

export default semesterSchema;
