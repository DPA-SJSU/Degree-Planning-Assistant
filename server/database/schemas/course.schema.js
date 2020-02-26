import { Schema } from 'mongoose';

const courseSchema = new Schema({
  school: { type: String, required: true, uppercase: true },
  code: { type: String, required: true, uppercase: true },
  title: { type: String, required: true, default: null },
  description: { type: String, required: true, default: null },
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
  difficulty: { type: Number, default: 0 },
  impaction: { type: Number, default: 0 },
  termsOffered: { type: String, required: true, default: null },
});

export default courseSchema;
