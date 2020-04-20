import { Schema } from 'mongoose';

const courseSchema = new Schema({
  school: { type: String, required: true, uppercase: true, default: 'SJSU' },
  department: { type: String, required: true, uppercase: true },
  code: { type: String, required: true },
  title: { type: String },
  credit: { type: String },
  description: { type: String },
  prerequisites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      uppercase: true,
      default: [],
    },
  ],
  corequisites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      uppercase: true,
      default: [],
    },
  ],
  area: String,
  type: [Number],
  difficulty: { type: Number, default: 0 },
  impaction: { type: Number, default: 0 },
  termsOffered: { type: String },
});

export default courseSchema;
