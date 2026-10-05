import express from "express";
import userController from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRoute = express.Router();

userRoute.post("/register", userController.registerUser);
userRoute.post("/login", userController.loginUser);
userRoute.get("/profile", authUser, userController.getProfile);
userRoute.put("/profile", authUser, userController.updateProfile);

export default userRoute;
