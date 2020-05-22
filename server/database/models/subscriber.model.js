import mongoose from 'mongoose';
import subscriberSchema from '../schemas/subscriber.schema';

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
