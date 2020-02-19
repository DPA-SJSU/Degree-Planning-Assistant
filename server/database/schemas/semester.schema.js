import { Schema } from 'mongoose';

const semesterSchema = new Schema({
  term: { type: String, required: true },
  year: { type: Number, required: true },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
<<<<<<< HEAD
  status: { type: Number, required: true },
=======
>>>>>>> able to call OCR and getting result for parsing
});

export default semesterSchema;
