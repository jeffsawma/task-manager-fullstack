const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (id, email) => {
  // Generating a specific token for jwtSecret by id and email
  const jwtSecret = "abcdefghijk";

  return jwt.sign({ id, email }, jwtSecret, { expiresIn: "1d" }); // Server signs the token with also id, email and jwtSecret // Expires in 24 hr
};

const serializeUser = (user) => ({
  id: user._id, // id: user._id from the db
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res) => {
  try {
    // Register a new user with name, email and password
    console.log(req.body); // Displaying the requested registration body

    const { name, email, password } = req.body; // Those attributes are part of the requested body
    console.log(name, email, password); // Displaying the values of the attributes

    if (!name || !email || !password) {
      // If there is one input that is still missing
      return res.status(400).json({
        // 400
        message: "Name, Email and Password are required!",
      });
    }

    const existingUser = await User.findOne({
      // Checking by email if the user being registered with, already exists in the db
      email: String(email).toLowerCase(),
    });

    if (existingUser) {
      // If the user already exists
      return res.status(409).json({
        // 409
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hashing the password provided by the user using bcrypt
    // Before creating a 'user' inside the table User in the database

    const user = await User.create({
      // Creating the new user by name, email and the hashed password
      name,
      email,
      password: hashedPassword, // Hashed password
    });

    console.log(user);

    return res.status(201).json({
      // 201 or success
      message: "User registered successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    // If any error occured while in the registration proccess
    console.log(error);
    return res.status(500).json({
      // 500
      message: "Error while registering user.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body; // The user will need to input the email and password in user interface

    if (!email || !password) {
      // If any of the input are missing
      return res.status(400).json({
        // 400
        message: "Email and Password are required!",
      });
    }

    const user = await User.findOne({
      // Using findOne() to retrieve a user from the db by its email
      email: String(email).toLowerCase(), // Convertion to String
    });

    if (!user) {
      // If there's no user with the exact
      return res.status(401).json({
        // 401
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password); // Comparing the password input with the one in the db

    if (!isValidPassword) {
      // If it's not valid
      return res.status(401).json({
        // 401
        message: "Password is not valid",
      });
    }

    const token = generateToken(String(user._id), user.email); // Generating a token to the user // Converting user's id to String

    return res.status(200).json({
      // 200
      message: "Login successful",
      data: {
        token, // We add the token in the response
        user: {
          id: user._id, // We also displa the id,
          name: user.name, // name
          email: user.email, // email
          createdAt: user.createdAt, // We also add created/updated
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    // Catching an error if so
    console.log(error);
    return res.status(500).json({
      // 500
      message: "Error while logging in user.",
    });
  }
};

const getMe = async (req, res) => {
  try {
    // This ensures middleware works
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        // 401
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.user.id).select("-password"); // Fetching user from DB // Excluding the password for security purposes

    if (!user) {
      // If user doesn't exist
      return res.status(404).json({
        // 404
        message: "User not found",
      });
    }

    return res.json({
      // Returning the information about user in JSON excluding its password
      message: "Authenticated user fetched successfully.", // Displaying a message of success
      data: {
        user, // Returning everything related to the user except for its password
      },
    });
  } catch (error) {
    // General error
    console.log(error);
    return res.status(500).json({
      // 500
      message: "Error while fetching user.",
    });
  }
};

const listUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const users = await User.find({ _id: { $ne: req.user.id } }) // $ne => not equals
      .select("-password") // Don't return a password for security reasons
      .sort({ name: 1 }); // Alphabetic order // 1=croissant et -1=décroissant

    return res.status(200).json({
      message: "Users fetched successfully",
      data: {
        users: users.map(serializeUser),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      // General server error
      message: "Error while fetching users",
    });
  }
};

module.exports = { register, login, getMe, listUsers }; // Exporting
