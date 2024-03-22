import { userModel } from "../models/user.model.js";

export default class userManager {

    regUser = async (email, password, first_name, last_name, age ) => {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }
        const newUser = await userModel.create({email,first_name, last_name,age,password});
        console.log(newUser)
        return newUser;
    }
    
    getUsers = async (email) => {
        const user = await userModel.findOne({ email });
        return user;
    }

    logInUser = async (email, password)=> {
        const user = await userModel.findOne({ email, password })
        if(!user){
            throw new Error("Invalid credentials");
        }
        return user;
    }
}