import User from "../models/User.model.js";

export const searchUsers = async(req,res)=>{
    try{
        const query = req.query.search;
        const users = await User.find({
            username:{$regex: query , $options:"i"}
        }).select("-password");

        res.json(users)
    }
    catch(error)
    {
        res.status(500).json({
            message:error.message
        })
    }
}