const express = require("express");
const {
  register,
  login,
  getMe,
  listUsers,
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register); // For registering a new user
router.post("/login", login); // For logging a specific user
router.get("/me", authMiddleware, getMe); // For retrieving data of the currently auth user
router.get("/users", authMiddleware, listUsers); // For retrieving all the users

module.exports = router;
