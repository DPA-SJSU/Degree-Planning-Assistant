import { Schema } from 'mongoose';

const courseSchema = new Schema({
<<<<<<< HEAD
  school: { type: String, required: true, uppercase: true, default: 'SJSU' },
  department: { type: String, required: true, uppercase: true },
  code: { type: String, required: true },
  title: { type: String, required: true, default: '' },
  credit: { type: String },
  description: { type: String },
=======
  school: { type: String, required: true, uppercase: true },
  code: { type: String, required: true, uppercase: true },
  title: { type: String, required: true, default: null },
  description: { type: String, required: true, default: null },
>>>>>>> [improvement]: upload a file to scan
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
<<<<<<< HEAD
  area: { type: String },
  requirementType: { type: Number },
  difficulty: { type: Number, default: 0 },
  impaction: { type: Number, default: 0 },
  termsOffered: { type: String },
=======
  difficulty: { type: Number, default: 0 },
  impaction: { type: Number, default: 0 },
  termsOffered: { type: String, required: true, default: null },
>>>>>>> [improvement]: upload a file to scan
});

export default courseSchema;
