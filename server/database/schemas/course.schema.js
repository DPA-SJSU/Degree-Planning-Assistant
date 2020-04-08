import { Schema } from 'mongoose';

const courseSchema = new Schema({
  school: { type: String, required: true, uppercase: true, default: 'SJSU' },
  department: { type: String, required: true, uppercase: true },
  code: { type: String, required: true },
  title: { type: String, required: true, default: '' },
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
  area: { type: String },
  type: { type: Number },
  difficulty: { type: Number, default: 0 },
  impaction: { type: Number, default: 0 },
  termsOffered: { type: String },
});

export default courseSchema;
