import mongoose from "mongoose";    

const userSchema = new mongoose.Schema({
    name: { type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
}
)

const User = mongoose.model('User', userSchema);
export default User;