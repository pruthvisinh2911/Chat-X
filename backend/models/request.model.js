import mongoose from "mongoose"

const requestSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending",
    },
},{
    timestamps:true
});

const Request = mongoose.model("Request",requestSchema)

export default Request;