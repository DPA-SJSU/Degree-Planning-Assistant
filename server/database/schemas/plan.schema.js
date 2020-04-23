import mongoose, { Schema } from 'mongoose';

const planSchema = new Schema({
  semesters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }],
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remainingRequirements: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  ],
});

export default planSchema;
