import mongoose from 'mongoose';
import programSchema from '../schemas/program.schema';

const Program = mongoose.model('Program', programSchema);
export default Program;
