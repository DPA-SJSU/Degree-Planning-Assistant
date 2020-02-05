import mongoose, { Schema } from 'mongoose';

const planSchema = new Schema({
  semesters: [
    {
      type: mongoose.Schema.Types.Semester,
      ref: 'Semester',
      required: true,
    },
  ],
});

export default planSchema;
