import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
		},
		path:{
			type:String,
		},
		isAIMessage: {
			type: Boolean,
			default: false
		},
		name:{
			type:String,
		},
		downloadContent:{
			type:Number,
			default:0
		}
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;