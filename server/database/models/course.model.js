import mongoose from 'mongoose';
import courseSchema from '../schemas/course.schema';

const Course = mongoose.model('Course', courseSchema);
export default Course;
