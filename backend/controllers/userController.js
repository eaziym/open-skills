const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Skill = require("../models/skillModel");
const authCheck = require("../middlewares/authCheck");
const jwt = require("jsonwebtoken");
const tokenize = require("../utils/tokenizer");
const { generateUsername } = require("unique-username-generator"); // https://www.npmjs.com/package/unique-username-generator
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure that the "uploads" directory exists.
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function getUniqueUsername() {
  let username, condition;
  do {
    username = generateUsername("", 0, 15);
    condition = await User.findOne({ username });
  } while (condition);
  return username;
}

const login = async (req, res) => {
  try {
    const allSkills = await Skill.find();
    const userExists = await User.findOne({ email: req.body.email });
    if (!userExists) {
      return res.status(404).send("User does not exist");
    }
    const passwordMatches = await bcrypt.compare(
      req.body.password,
      userExists.password
    );
    if (!passwordMatches) {
      return res.status(401).send("wrong password or email address");
    }
    const matchNames = await Promise.all(
      userExists.matches.map(async (element) => {
        const user = await User.findOne({ _id: element });
        return user.username;
      })
    );
    const expiresInMs = 3600000 * 1; // 1 hr = 3600000 ms
    if (userExists && passwordMatches) {
      const token = tokenize(
        userExists.username,
        userExists.email,
        expiresInMs
      );
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: expiresInMs,
        sameSite: "None",
        secure: true,
      });
      // console.log(`token : ${token}`)
      console.log("\nUser logged in successfully.\n");

      // Include _id in the returned profile
      const profile = {
        _id: userExists._id,
        fname: userExists.fname,
        lname: userExists.lname,
        username: userExists.username,
        email: userExists.email,
        skills: userExists.skills.map(
          (element) => allSkills.find((skill) => skill._id.equals(element)).name
        ),
        interests: userExists.interests.map(
          (element) =>
            allSkills.find((interest) => interest._id.equals(element)).name
        ),
        matches: matchNames,
        bio: userExists.bio,
        notifications: userExists.notifications,
      };
      return res.status(200).json(profile);
    } else {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      return res.status(400).json("Invalid user OR wrong username-password ");
    }
  } catch (e) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(500).json({ message: e.message });
  }
};

const registerUser = async (req, res) => {
  const username = await getUniqueUsername();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    if (
      req.body.fname &&
      req.body.fname.length < 20 &&
      req.body.lname &&
      req.body.lname.length < 20 &&
      req.body.email &&
      emailRegex.test(req.body.email) &&
      req.body.password &&
      req.body.password.length > 6 &&
      req.body.password.length < 20
    ) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = await User.create({
        ...req.body,
        password: hashedPassword,
        username: username,
      });
      console.log("User created !!");
      res.status(200).json("User created !");
    } else {
      console.log("\nRejected user creation, input criteria not followed !\n");
      return res.status(401).send({
        message: "Rejected user creation, input criteria not followed !",
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// fetch a profile using ID or username (ONLY FOR LOGGEDIN USER)
const viewProfile = async (req, res) => {
  try {
    // Fetching list of skills
    const allSkills = await Skill.find();

    let query = "";

    if (req.body._id) {
      query = { _id: req.body._id };
    } else if (req.body.username) {
      query = { username: req.body.username };
    }

    let thisUser;
    if (query)
      thisUser = await User.findOne(query)
        .populate("skills")
        .populate("interests");

    if (!thisUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const matchNames = await Promise.all(
      thisUser.matches.map(async (element) => {
        const user = await User.findOne({ _id: element });
        return user.username;
      })
    );

    const profile = {
      _id: thisUser._id,
      fname: thisUser.fname,
      lname: thisUser.lname,
      username: thisUser.username,
      email: thisUser.email,
      skills: thisUser.skills,
      interests: thisUser.interests,
      matches: matchNames,
      bio: thisUser.bio,
      notifications: thisUser.notifications,
      profilePic: thisUser.profilePic,
    };
    res.status(200).json(profile);
  } catch (err) {
    console.log("\nFailed to fetch user details !\n");
    res.status(400).json({ error: err.message });
  }
};

// outputs lists of matchs (fullname + id)
const getMatches = async (req, res) => {
  try {
    const thisUser = await User.findOne({ _id: req.body._id });

    const matchList = await Promise.all(
      thisUser.matches.map((id) => User.findOne({ _id: id }))
    );
    const matches = matchList.map((match) => {
      return {
        name: `${match.fname} ${match.lname}`,
        username: match.username,
      };
    });
    console.log(matches);

    if (matches.length > 0) {
      res.status(200).json(matches);
    } else {
      res.status(201).json("No matches yet :(");
    }
  } catch (err) {
    console.log("\nError finding matches !\n");
    res.status(400).json({ error: err.message });
  }
};

const editUserProfile = async (req, res) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    const { fname, lname, email, username, bio, skills, interests } = req.body;
    const userId = req.user._id;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (username.length > 15 || username < 4) {
      return res.status(400).json({
        message: "Username should be between 3 and 15 characters in length",
      });
    }

    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: userId },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const existingEmail = await User.findOne({
      email: email,
      _id: { $ne: userId },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fname, lname, username, bio, email, skills, interests },
      { new: true }
    );

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    const token = tokenize(username, email);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000 * 1,
      sameSite: "None",
      secure: true,
    });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (e) {
    return res.status(400).json({ message: e });
  }
};

const updateUserSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    let { skills } = req.body;

    if (!userId || !skills) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    if (!Array.isArray(skills)) {
      skills = [skills]; // Convert to array with single element
    }
    const skillObjects = await Promise.all(
      skills.map(async (skillName) => {
        const skill = await Skill.findOne({ name: skillName });
        if (skill) {
          return skill._id; // Return the ObjectId of the existing skill
        }
      })
    );

    // Remove any undefined elements from the array
    const existingSkillIds = skillObjects.filter(Boolean);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { skills: existingSkillIds },
    });

    return res.status(200).send({
      success: true,
      message: "Skills and interests updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

const updateUserInterests = async (req, res) => {
  try {
    const userId = req.user._id;
    let { interests } = req.body;

    if (!userId || !interests) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    if (!Array.isArray(interests)) {
      interests = [interests]; // Convert to array with single element
    }
    console.log(interests);
    const skillObjects = await Promise.all(
      interests.map(async (interestName) => {
        const skill = await Skill.findOne({ name: interestName });
        if (skill) {
          return skill._id; // Return the ObjectId of the existing skill
        }
      })
    );

    // Remove any undefined elements from the array
    const existingInterestIds = skillObjects.filter(Boolean);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { interests: existingInterestIds },
    });

    return res
      .status(200)
      .send({ success: true, message: "Interests updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({ message: "Logged out successfully !" });
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.status(400).json({ message: "Failed to logout !" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = req.user.notifications;
    res.status(200).json({ notifications: notifications });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Use memory storage instead of disk storage.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image file!"), false);
    }
  },
});

// Controller function to upload the user's profile pic into the DB as a Base64 data URL.
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    // Convert the file buffer to a Base64-encoded string.
    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype;
    // Create a data URL string.
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    // Update the user document's profilePic field with the data URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: dataUrl },
      { new: true }
    );
    return res.status(200).json({
      message: "Profile picture updated.",
      profilePic: dataUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in uploadProfilePic:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Mark all notifications as read.
 * This controller expects the authCheck middleware to have attached the user ID to req.user.
 */
const markAllReadNotifications = async (req, res) => {
  try {
    // Retrieve the logged-in user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If there are no notifications, exit early.
    if (!user.notifications || user.notifications.length === 0) {
      return res.status(200).json({ message: "No notifications available." });
    }

    // Mark each notification as read, if not already.
    user.notifications.forEach((notification, index) => {
      if (!notification.read) {
        user.notifications[index].read = true;
      }
    });

    await user.save();

    return res
      .status(200)
      .json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Updated controller to fetch any user's profile by their username.
const getUserProfileById = async (req, res) => {
  try {
    // Use findOne by username instead of findById so you can use the username as the route parameter.
    const user = await User.findOne({ username: req.params.id })
      .select("_id fname lname username email skills interests profilePic")
      .populate("skills", "name") // Add population for skill names
      .populate("interests", "name"); // Add population for interest names
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  registerUser,
  viewProfile,
  getMatches,
  login,
  editUserProfile,
  updateUserSkills,
  updateUserInterests,
  logout,
  getNotifications,
  uploadProfilePic,
  upload,
  markAllReadNotifications,
  getUserProfileById,
};
