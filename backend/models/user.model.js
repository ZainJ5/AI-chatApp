import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "preferNotToSay"], 
    },
    profilePic: {
      type: String,
      default: "",
    },
    googleId: {
      type: String, 
      unique: true, 
      sparse: true, 
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
