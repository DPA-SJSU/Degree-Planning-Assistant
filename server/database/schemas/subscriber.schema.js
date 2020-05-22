import { Schema } from 'mongoose';

const subscriberSchema = new Schema({
  phase: Number,
  email: String,
});

export default subscriberSchema;
