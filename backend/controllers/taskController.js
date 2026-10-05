import taskModel from "../models/task.js";
import projectModel from "../models/project.js";
import organizationModel from "../models/organization.js";
import taskActivityModel from "../models/taskActivity.js";

const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, priority, dueDate } =
    req.body;

  if (!title || !projectId) {
    return res.status(400).send("Title and project ID are required");
  }

  const project = await projectModel.findById(projectId);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isOrganizationMember = organization.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isOrganizationMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  const isProjectMember = project.members.includes(req.userId);

  if (!isProjectMember && !isOwner && !isAdmin) {
    return res.status(403).send("You are not a member of this project");
  }

  if (assignedTo) {
    const isMember = project.members.includes(assignedTo);

    if (!isMember) {
      return res
        .status(400)
        .send("Assigned user is not a member of this project");
    }
  }

  const newTask = new taskModel({
    title: title,
    description: description || "",
    project: projectId,
    createdBy: req.userId,
    assignedTo: assignedTo || null,
    priority: priority || "MEDIUM",
    dueDate: dueDate || null,
  });

  await newTask.save();

  await taskActivityModel.create({
    task: newTask._id,
    user: req.userId,
    action: "CREATED",
    details: "Task created",
  });

  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    task: newTask,
  });
};

const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("Project ID is required");
  }

  const project = await projectModel.findById(projectId);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isOrganizationMember = organization.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isOrganizationMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  const isProjectMember = project.members.includes(req.userId);

  if (!isProjectMember && !isOwner && !isAdmin) {
    return res.status(403).send("You are not a member of this project");
  }

  const {
    status,
    assignedTo,
    search,
    page = 1,
    limit = 10,
    sort = "newest",
  } = req.query;

  const filter = {
    project: projectId,
    isDeleted: false,
  };

  if (status) {
    const allowedStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid task status");
    }

    filter.status = status;
  }

  if (assignedTo) {
    const isMember = project.members.includes(assignedTo);

    if (!isMember) {
      return res
        .status(400)
        .send("Assigned user is not a member of this project");
    }

    filter.assignedTo = assignedTo;
  }

  if (search) {
    filter.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    !Number.isInteger(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1
  ) {
    return res.status(400).send("Invalid page or limit");
  }

  const skip = (pageNumber - 1) * limitNumber;

  let sortOption;

  if (sort === "newest") {
    sortOption = { createdAt: -1 };
  } else if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "dueDate") {
    sortOption = { dueDate: 1 };
  } else if (sort === "priority") {
    sortOption = { priority: -1 };
  } else {
    return res.status(400).send("Invalid sort option");
  }

  const tasks = await taskModel
    .find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  const totalTasks = await taskModel.countDocuments(filter);

  return res.status(200).json({
    success: true,
    tasks: tasks,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalTasks: totalTasks,
      totalPages: Math.ceil(totalTasks / limitNumber),
    },
  });
};

const getDeletedProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("Project ID is required");
  }

  const project = await projectModel.findById(projectId);

  if (!project) {
    return res.status(404).send("Project not found");
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
    return res.status(403).send("You don't have access to this project");
  }

  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    !Number.isInteger(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1
  ) {
    return res.status(400).send("Invalid page or limit");
  }

  const filter = {
    project: projectId,
    isDeleted: true,
  };

  const skip = (pageNumber - 1) * limitNumber;

  const tasks = await taskModel
    .find(filter)
    .sort({ deletedAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  const totalTasks = await taskModel.countDocuments(filter);

  return res.status(200).json({
    success: true,
    tasks: tasks,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalTasks: totalTasks,
      totalPages: Math.ceil(totalTasks / limitNumber),
    },
  });
};

const getTask = async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).send("Task ID is required");
  }

  const task = await taskModel
    .findOne({
      _id: taskId,
      isDeleted: false,
    })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  if (!task) {
    return res.status(404).send("Task not found");
  }

  const project = await projectModel.findById(task.project);

  if (!project) {
    return res.status(404).send("Project not found");
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

  return res.status(200).json({
    success: true,
    task: task,
  });
};

const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;

  if (!taskId) {
    return res.status(400).send("Task ID is required");
  }

  const task = await taskModel.findOne({
    _id: taskId,
    isDeleted: false,
  });

  if (!task) {
    return res.status(404).send("Task not found");
  }

  const project = await projectModel.findById(task.project);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isProjectMember = project.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isProjectMember) {
    return res
      .status(403)
      .send("You don't have permission to update this task");
  }
  const oldAssignedTo = task.assignedTo;
  const changedFields = [];

  if (title !== undefined) {
    if (task.title !== title) {
      changedFields.push("title");
    }

    task.title = title;
  }

  if (description !== undefined) {
    if (task.description !== description) {
      changedFields.push("description");
    }

    task.description = description;
  }

  if (priority !== undefined) {
    if (task.priority !== priority) {
      changedFields.push("priority");
    }

    task.priority = priority;
  }

  if (dueDate !== undefined) {
    if (String(task.dueDate) !== String(dueDate)) {
      changedFields.push("due date");
    }

    task.dueDate = dueDate;
  }

  if (assignedTo !== undefined) {
    if (assignedTo === null || assignedTo === "") {
      task.assignedTo = null;
    } else {
      const isMember = project.members.includes(assignedTo);

      if (!isMember) {
        return res
          .status(400)
          .send("Assigned user is not a member of this project");
      }

      task.assignedTo = assignedTo;
    }
  }

  await task.save();

  if (changedFields.length > 0) {
    await taskActivityModel.create({
      task: task._id,
      user: req.userId,
      action: "UPDATED",
      details: `Updated: ${changedFields.join(", ")}`,
    });
  }

  if (assignedTo !== undefined) {
    if (!oldAssignedTo && task.assignedTo) {
      await taskActivityModel.create({
        task: task._id,
        user: req.userId,
        action: "ASSIGNED",
        details: `Task assigned to ${task.assignedTo}`,
      });
    } else if (oldAssignedTo && !task.assignedTo) {
      await taskActivityModel.create({
        task: task._id,
        user: req.userId,
        action: "UNASSIGNED",
        details: "Task unassigned",
      });
    } else if (
      oldAssignedTo &&
      task.assignedTo &&
      !oldAssignedTo.equals(task.assignedTo)
    ) {
      await taskActivityModel.create({
        task: task._id,
        user: req.userId,
        action: "ASSIGNED",
        details: `Task reassigned to ${task.assignedTo}`,
      });
    }
  }

  const updatedTask = await taskModel
    .findById(task._id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  return res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task: updatedTask,
  });
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).send("Task ID is required");
  }

  const task = await taskModel.findOne({
    _id: taskId,
    isDeleted: false,
  });

  if (!task) {
    return res.status(404).send("Task not found");
  }

  const project = await projectModel.findById(task.project);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isProjectMember = project.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isProjectMember) {
    return res
      .status(403)
      .send("You don't have permission to delete this task");
  }

  await taskActivityModel.create({
    task: task._id,
    user: req.userId,
    action: "DELETED",
    details: "Task deleted",
  });

  task.isDeleted = true;
  task.deletedAt = new Date();

  await task.save();

  return res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};

const restoreTask = async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).send("Task ID is required");
  }

  const task = await taskModel.findOne({
    _id: taskId,
    isDeleted: true,
  });

  if (!task) {
    return res.status(404).send("Deleted task not found");
  }

  const project = await projectModel.findById(task.project);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isProjectMember = project.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isProjectMember) {
    return res
      .status(403)
      .send("You don't have permission to restore this task");
  }

  task.isDeleted = false;
  task.deletedAt = null;

  await task.save();

  await taskActivityModel.create({
    task: task._id,
    user: req.userId,
    action: "RESTORED",
    details: "Task restored",
  });

  return res.status(200).json({
    success: true,
    message: "Task restored successfully",
    task: task,
  });
};

const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!taskId) {
    return res.status(400).send("Task ID is required");
  }

  if (!status) {
    return res.status(400).send("Task status is required");
  }

  const allowedStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).send("Invalid task status");
  }

  const task = await taskModel.findOne({
    _id: taskId,
    isDeleted: false,
  });

  if (!task) {
    return res.status(404).send("Task not found");
  }

  const project = await projectModel.findById(task.project);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isProjectMember = project.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isProjectMember) {
    return res
      .status(403)
      .send("You don't have permission to update this task");
  }

  if (task.status === status) {
    return res.status(400).send("Task is already in this status");
  }
  const oldStatus = task.status;

  task.status = status;

  await task.save();

  await taskActivityModel.create({
    task: task._id,
    user: req.userId,
    action: "STATUS_CHANGED",
    details: `Status changed from ${oldStatus} to ${status}`,
  });

  const updatedTask = await taskModel
    .findById(task._id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  return res.status(200).json({
    success: true,
    message: "Task status updated successfully",
    task: updatedTask,
  });
};

const getMyTasks = async (req, res) => {
  const tasks = await taskModel
    .find({
      assignedTo: req.userId,
      isDeleted: false,
    })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("project", "name");

  return res.status(200).json({
    success: true,
    tasks: tasks,
  });
};

const getOverdueTasks = async (req, res) => {
  const currentDate = new Date();

  const tasks = await taskModel
    .find({
      assignedTo: req.userId,
      isDeleted: false,
      dueDate: { $lt: currentDate },
      status: { $ne: "DONE" },
    })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("project", "name");

  return res.status(200).json({
    success: true,
    tasks: tasks,
  });
};

const getTaskStats = async (req, res) => {
  const currentDate = new Date();

  const totalTasks = await taskModel.countDocuments({
    assignedTo: req.userId,
    isDeleted: false,
  });

  const todoTasks = await taskModel.countDocuments({
    assignedTo: req.userId,
    status: "TODO",
    isDeleted: false,
  });

  const inProgressTasks = await taskModel.countDocuments({
    assignedTo: req.userId,
    status: "IN_PROGRESS",
    isDeleted: false,
  });

  const reviewTasks = await taskModel.countDocuments({
    assignedTo: req.userId,
    status: "REVIEW",
    isDeleted: false,
  });

  const completedTasks = await taskModel.countDocuments({
    assignedTo: req.userId,
    status: "DONE",
    isDeleted: false,
  });

  const overdueTasks = await taskModel.countDocuments({
    assignedTo: req.userId,
    dueDate: { $lt: currentDate },
    status: { $ne: "DONE" },
    isDeleted: false,
  });

  return res.status(200).json({
    success: true,
    stats: {
      totalTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      completedTasks,
      overdueTasks,
    },
  });
};

const getProjectTaskStats = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("Project ID is required");
  }

  const project = await projectModel.findById(projectId);

  if (!project) {
    return res.status(404).send("Project not found");
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
    return res.status(403).send("You don't have access to this project");
  }

  const currentDate = new Date();

  const totalTasks = await taskModel.countDocuments({
    project: projectId,
    isDeleted: false,
  });

  const todoTasks = await taskModel.countDocuments({
    project: projectId,
    status: "TODO",
    isDeleted: false,
  });

  const inProgressTasks = await taskModel.countDocuments({
    project: projectId,
    status: "IN_PROGRESS",
    isDeleted: false,
  });

  const reviewTasks = await taskModel.countDocuments({
    project: projectId,
    status: "REVIEW",
    isDeleted: false,
  });

  const completedTasks = await taskModel.countDocuments({
    project: projectId,
    status: "DONE",
    isDeleted: false,
  });

  const overdueTasks = await taskModel.countDocuments({
    project: projectId,
    dueDate: { $lt: currentDate },
    status: { $ne: "DONE" },
    isDeleted: false,
  });

  return res.status(200).json({
    success: true,
    stats: {
      totalTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      completedTasks,
      overdueTasks,
    },
  });
};

export default {
  createTask,
  getProjectTasks,
  getDeletedProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  restoreTask,
  updateTaskStatus,
  getMyTasks,
  getOverdueTasks,
  getTaskStats,
  getProjectTaskStats,
};
