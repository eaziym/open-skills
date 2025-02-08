const express = require("express");
const router = express.Router();
const {
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
  markAllReadNotifications,
  upload,
} = require("../controllers/userController");
const { authCheck } = require("../middlewares/authCheck");

router.get("/matches", authCheck, getMatches);
router.get("/notifications", authCheck, getNotifications);
router.get("/profile", authCheck, viewProfile);

router.put("/profile-update", authCheck, editUserProfile);
router.put("/skills-update", authCheck, updateUserSkills);
router.put("/interests-update", authCheck, updateUserInterests);

router.post("/logout", logout);
router.post("/login", login);
router.post("/register", registerUser);

// Route to upload profile pic (protected route)
router.post(
  "/upload-profile-pic",
  authCheck,
  upload.single("profilePic"),
  uploadProfilePic
);

// Route for marking all notifications as read
router.patch("/notifications/markAllRead", authCheck, markAllReadNotifications);

module.exports = router;
