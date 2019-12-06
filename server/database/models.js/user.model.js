import mongoose from 'mongoose';
import userSchema from '../schemas.js/user.schema';

const User = mongoose.model('User', userSchema);
export default User;
