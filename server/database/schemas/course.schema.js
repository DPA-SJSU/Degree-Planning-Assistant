import { Schema } from 'mongoose';

const courseSchema = new Schema({
  school: { type: String, required: true, uppercase: true },
  code: { type: String, required: true, uppercase: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  prerequisites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      uppercase: true,
    },
  ],
  corequisites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      uppercase: true,
    },
  ],
  difficulty: { type: Number },
  impaction: { type: Number },
  termsOffered: { type: String, required: true },
});

export default courseSchema;
