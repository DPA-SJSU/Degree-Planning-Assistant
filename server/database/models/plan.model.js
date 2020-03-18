import mongoose from 'mongoose';
import planSchema from '../schemas/plan.schema';

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
