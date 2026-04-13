import Request from "../models/request.model.js"

export const sendRequest = async(req,res)=>{
    try{
        const recieverId = req.body
        const senderId = req.user.userId

        const existing = await Request.findOne({
            senderId,
            recieverId,
        })
        if(existing)
        {
            return res.status(400).json({
                message:"request already sent"
            })
        }
        const request = await Request.create({
            senderId,
            recieverId,
        })
        res.status(201).json({
            request
        })
    }
    catch(error){
            res.status(500).json({
                message:error.message
            })
    }
}

export const acceptRequest = async(req,res)=>
{
    try{
        const request = await Request.findById(req.param.id);

        request.status = "accepted"
        await request.save()

        req.json({
            message:"Request Accepted"
        })
    }
    catch(error)
    {
        res.status(500).json({
            message:error.message
        })
    }
}