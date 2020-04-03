import mongoose from 'mongoose';
import requirementSchema from '../schemas/requirement.schema';

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;
