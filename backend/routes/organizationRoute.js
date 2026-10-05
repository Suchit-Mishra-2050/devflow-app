import express from "express";
import organizationController from "../controllers/organizationController.js";
import authUser from "../middleware/auth.js";

const organizationRoute = express.Router();

organizationRoute.post(
  "/create",
  authUser,
  organizationController.organization,
);

organizationRoute.post(
  "/add-member",
  authUser,
  organizationController.addMember,
);

organizationRoute.get(
  "/my-organizations",
  authUser,
  organizationController.getMyOrganizations,
);

organizationRoute.get(
  "/:organizationId",
  authUser,
  organizationController.getOrganization,
);

organizationRoute.delete(
  "/:organizationId/member",
  authUser,
  organizationController.removeMember,
);

organizationRoute.put(
  "/:organizationId/member-role",
  authUser,
  organizationController.changeMemberRole,
);

export default organizationRoute;
