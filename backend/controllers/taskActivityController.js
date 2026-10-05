import taskActivityModel from "../models/taskActivity.js";
import taskModel from "../models/task.js";
import projectModel from "../models/project.js";
import organizationModel from "../models/organization.js";

const getTaskActivities = async (req, res) => {
  const { taskId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!taskId) {
    return res.status(400).send("Task ID is required");
  }

  const task = await taskModel.findById(taskId);

  if (!task) {
    return res.status(404).send("Task not found");
  }

  const isDeleted = task.isDeleted;
  const project = await projectModel.findById(task.project);

  if (!project) {
    return res.status(404).send("Project not found");
  }
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    !Number.isInteger(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    return res.status(400).send("Invalid page or limit");
  }
  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isOrganizationMember = organization.members.includes(req.userId);
  const isProjectMember = project.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isOrganizationMember && !isProjectMember) {
    return res.status(403).send("You don't have access to this task");
  }

  const skip = (pageNumber - 1) * limitNumber;

  const activities = await taskActivityModel
    .find({ task: taskId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("user", "name email");

  const totalActivities = await taskActivityModel.countDocuments({
    task: taskId,
  });

  return res.status(200).json({
    success: true,
    isDeleted: isDeleted,
    activities: activities,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalActivities: totalActivities,
      totalPages: Math.ceil(totalActivities / limitNumber),
    },
  });
};

export default {
  getTaskActivities,
};
