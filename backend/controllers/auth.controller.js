import User from "../models/User.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input format" });
    }


    firstName = firstName.trim();
    lastName = lastName.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiry,
      isVerified: false,
    });

    console.log(`OTP for ${email}: ${rawOtp}`);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

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
        const{email,username,password}=req.body;


        if((!email && !username) || !password){
                return res.status(400).json({
                    message:"email/username and password is required"
                })
        }

        const user = await User.findOne({
            $or:[{
                email,
            },{
                    username,
                }
            ],
        })

        if(!user){
            return res.status(400).json({
                message:"user not found"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid Credentails"
            })
        }

        if(!user.isVerified){
            return res.status(400).json({
                message:"Please verify your email first"
            })
        
        }
        const token = jwt.sign({
            id:user._id
        },
    process.env.JWT_SECRET,
{
    expiresIn:"1d"
});
res.json({
    message:"Login successfully",
    token,
    user:{
        id:user._id,
        username:user.username,
        email:user.email,
    },
});
 }
    catch(error)
    {
        res.status(500).json({
            message:error.message
        })
    }
}