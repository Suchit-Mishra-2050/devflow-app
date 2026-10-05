import express from "express";

import taskController from "../controllers/taskController.js";

import authUser from "../middleware/auth.js";

const taskRoute = express.Router();

taskRoute.post("/create", authUser, taskController.createTask);

taskRoute.get("/project/:projectId", authUser, taskController.getProjectTasks);

taskRoute.get(
  "/project/:projectId/deleted",
  authUser,
  taskController.getDeletedProjectTasks,
);

taskRoute.get("/my-tasks", authUser, taskController.getMyTasks);

taskRoute.get("/overdue", authUser, taskController.getOverdueTasks);

taskRoute.get("/stats", authUser, taskController.getTaskStats);

taskRoute.get(
  "/stats/project/:projectId",
  authUser,
  taskController.getProjectTaskStats,
);

taskRoute.get("/:taskId", authUser, taskController.getTask);

taskRoute.put("/:taskId", authUser, taskController.updateTask);

taskRoute.delete("/:taskId", authUser, taskController.deleteTask);

taskRoute.patch("/:taskId/restore", authUser, taskController.restoreTask);

taskRoute.patch("/:taskId/status", authUser, taskController.updateTaskStatus);

export default taskRoute;
