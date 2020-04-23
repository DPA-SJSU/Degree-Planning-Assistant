import mongoose from 'mongoose';
import remainingRequirementSchema from '../schemas/remainingRequirement.schema';

const RemainingRequirement = mongoose.model(
  'RemainingRequirement',
  remainingRequirementSchema
);
export default RemainingRequirement;
