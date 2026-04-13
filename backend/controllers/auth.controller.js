import User from "../models/User.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const registerUser = async(req,res)=>{
    try{
        const{firstName , lastName , username , email , password} = req.body;

        if(!firstName || !lastName || !username || !email || !password){
            return res.status(400).json({
                message:"All Fields Are Required"
            })
        }

        const emailExists = await User.findOne({email});
        if(emailExists)
        {
            return res.status(400).json({
                message:"Email is Already Exists"
            })
        }

        const usernameExists = await User.findOne({username})

        if(usernameExists){
            return res.status(400).json({
                message:"User Already Exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

        const otpExpiry = new Date(Date.now()+10*60*10000)

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password:hashedPassword,
            otp,
            otpExpiry
        });

        console.log(`opt for ${email}:${otp}`)

        res.status(201).json({
                message:"User registred successfully",
                userId:user._id
        });
    }
    catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}

export const verifyOtp = async(req,res)=>{
    try{
        const { email , otp } = req.body;
        if(!email || !otp){
            return res.status(400).json({
                message:"Email ans Otp are Required"
            })
        }
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message:"User not found"
            })
        }
        if(user.otp !==otp)
        {
            return res.status(400).json({
                message:"Invalid OTP"
            })
        }

        if(user.otpExpiry<new Date())
        {
            return res.status(400).json({
                message:"OTP expired"
            })
        }
        user.isVerified=true;
        user.otp=null;
        user.otpExpiry=null
        
        await user.save();

        res.status(200).json({
            message:"Email is verified successfully"
        });
    }
    catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}

export const loginUser = async (req,res)=>{
    try{
        const{email,password}=req.body;

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({
                message:"Invalid Credentials"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid Credentails"
            })
        }
        const token = jwt.sign({
            userId:user._id
        },
    process.env.JWT_SECRET,
{
    expiresIn:"7d"
});
res.json({
    token,
    userId:user._id
});
 }
    catch(error)
    {
        res.status(500).json({
            message:error.message
        })
    }
}