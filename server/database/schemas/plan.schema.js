import mongoose, { Schema } from 'mongoose';

const planSchema = new Schema({
  semesters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }],
});

export default planSchema;
