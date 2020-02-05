import mongoose from 'mongoose';
import planSchema from '../schemas.js/plan.schema';

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
