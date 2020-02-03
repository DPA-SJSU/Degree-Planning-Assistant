import mongoose from 'mongoose';
import semesterSchema from '../schemas/semester.schema';

const Semester = mongoose.model('Semester', semesterSchema);
export default Semester;
