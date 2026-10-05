import express from "express";

import taskActivityController from "../controllers/taskActivityController.js";

import authUser from "../middleware/auth.js";

const taskActivityRoute = express.Router();

taskActivityRoute.get(
  "/task/:taskId",
  authUser,
  taskActivityController.getTaskActivities,
);

export default taskActivityRoute;
