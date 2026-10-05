import express from "express";

import projectController from "../controllers/projectController.js";

import authUser from "../middleware/auth.js";

const projectRoute = express.Router();

projectRoute.post("/create", authUser, projectController.createProject);

projectRoute.get(
  "/organization/:organizationId",
  authUser,
  projectController.getOrganizationProjects,
);

projectRoute.get("/:projectId", authUser, projectController.getProject);

projectRoute.put("/:projectId", authUser, projectController.updateProject);

projectRoute.delete("/:projectId", authUser, projectController.deleteProject);

projectRoute.post(
  "/:projectId/member",
  authUser,
  projectController.addProjectMember,
);

projectRoute.delete(
  "/:projectId/member",
  authUser,
  projectController.removeProjectMember,
);

projectRoute.get(
  "/:projectId/members",
  authUser,
  projectController.getProjectMembers,
);

export default projectRoute;
