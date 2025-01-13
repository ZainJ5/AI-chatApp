import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender, googleId } = req.body;

    if (googleId) {
      const googleUser = await User.findOne({ googleId });
      if (googleUser) {
        generateTokenAndSetCookie(googleUser._id, res);
        const isAdmin = googleUser.admin || false;
        
        console.log('Received profile URL:', googleUser.profilePic);
        console.log('URL length:', googleUser.profilePic?.length);

        return res.status(200).json({
          _id: googleUser._id,
          fullName: googleUser.fullName,
          username: googleUser.username,
          profilePic: googleUser.profilePic,
          isAdmin,
          googleId: googleUser.googleId
        });
      }
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    let hashedPassword = null;
    if (!googleId) {
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords don't match" });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } else {
      hashedPassword = "google-authenticated-user";
    }

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
      googleId: googleId || null,
    });

    try {
      await createAIUser();
    } catch (error) {
      console.log("Error creating AI user:", error.message);
    }

    if (newUser) {
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic,
        googleId: newUser.googleId,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export async function createAIUser() {
  try {
    const aiUser = await User.findOne({ username: "chatgpt" });
    if (!aiUser) {
      const salt = await bcrypt.genSalt(10);
      const aiPassword = await bcrypt.hash("Pakistan1", salt);
      const AI = new User({
        fullName: "ChatGPT",
        username: "chatgpt",
        password: aiPassword,
        gender: "male",
        profilePic:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyIS_GMENyqoWukYofDbpdwLZQoI5s0DmQiw&s",
      });
      await AI.save();
      console.log("AI user created successfully");
    } else {
      console.log("AI user already exists");
    }
  } catch (error) {
    console.error("Error creating AI user:", error.message);
    throw error;
  }
}



export const login = async (req, res) => {
	try {
		const { username, password, googleId } = req.body;

		if (googleId) {
			let user = await User.findOne({ googleId });

      if (!user) {
        user = new User({
          fullName: req.body.fullName || "Google User",
          username: req.body.username,
          password: "google-authenticated-user", 
          googleId: googleId,
          gender: req.body.gender, 
          profilePic: req.body.profilePic || "", 
        });
        
        try {
          await createAIUser();
        } catch (error) {
          console.log("Error creating AI user during Google login:", error.message);
        }
        
        await user.save();
      }

			generateTokenAndSetCookie(user._id, res);

			const isAdmin = user.admin || false;

			return res.status(200).json({
				_id: user._id,
				fullName: user.fullName,
				username: user.username,
				profilePic: user.profilePic,
				isAdmin,
			});
		}

		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		const isAdmin = user.admin || false;

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
			isAdmin,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};