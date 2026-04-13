import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        default:true,
    },
    profilePic:{
        type:String,
        default:"",
    },
    isVerified:{
        type:String,
        default:true,
    },
    otp:{
        type:String,
    },
    otpExpiry:{
        type:Date
    }
},{
    timestamps:true
})

const User = mongoose.model("User",userSchema)

export default User;