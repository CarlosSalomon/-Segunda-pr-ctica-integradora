import mongoose from 'mongoose';

const userCollection = 'user';

const userSchema = new mongoose.Schema({
    first_name: { 
        type: String,
    },
    last_name: { 
        type: String,
    },
    email: {
        type: String,
        unique: true
     },
    age: {
        type: Number,
    },
    password: {
        type: String, 
    },
    admin: {
        type: Boolean,
        default: false
     },
    cartId: {
            type: String
        },
    rol: {  
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    },
},
{
    timestamps: true,
    strict:false
}

);

export const userModel = mongoose.model('User', userSchema, userCollection);
