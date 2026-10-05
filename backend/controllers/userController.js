import usermodel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Missing the data");
  }

  const existingUser = await usermodel.findOne({
    email: email,
  });

  if (existingUser) {
    return res.status(400).send("user already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new usermodel({
    name: name,
    email: email,
    password: hashedPassword,
  });

  await newUser.save();
  return res.status(201).send("Successfully saved");
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("write email or password");
  }

  const existUser = await usermodel.findOne({
    email: email,
  });

  if (!existUser) {
    return res.status(400).send("Please Register first");
  }

  const hashPassword = await bcrypt.compare(password, existUser.password);

  if (!hashPassword) {
    return res.status(400).send("Enter correct password");
  }

  const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET);

  return res.status(200).json({
    success: true,
    token: token,
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await usermodel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existingUser = await usermodel.findOne({
      email,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const user = await usermodel
      .findByIdAndUpdate(
        req.userId,
        {
          name,
          email,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
