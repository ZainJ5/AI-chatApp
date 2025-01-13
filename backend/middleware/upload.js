import multer from 'multer';
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  },
});


const allowedMimes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];


const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); 
    } else {
      cb(new Error("Invalid file type. Only PDF, Excel, and Word documents are allowed.")); 
    }
  }
});


const protectFileRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { upload, protectFileRoute };
