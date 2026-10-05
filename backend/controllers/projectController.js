import projectModel from "../models/project.js";
import organizationModel from "../models/organization.js";
import userModel from "../models/user.js";

const createProject = async (req, res) => {
  const { name, description, organizationId } = req.body;

  if (!name || !description || !organizationId) {
    return res
      .status(400)
      .send("Name, description, and organizationId are required");
  }

  const existorg = await organizationModel.findById(organizationId);

  if (!existorg) {
    return res.status(404).send("Organization doesn't exist");
  }

  const isOwner = existorg.owner.equals(req.userId);
  const isAdmin = existorg.admins.includes(req.userId);
  const isMember = existorg.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  const newProject = new projectModel({
    name: name,
    description: description,
    organization: organizationId,
    createdBy: req.userId,
  });

  await newProject.save();

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    project: newProject,
  });
};

const getOrganizationProjects = async (req, res) => {
  const { organizationId } = req.params;

  if (!organizationId) {
    return res.status(400).send("Organization ID is required");
  }

  const organization = await organizationModel.findById(organizationId);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isMember = organization.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  const projects = await projectModel.find({
    organization: organizationId,
  });

  return res.status(200).json({
    success: true,
    projects: projects,
  });
};

const getProject = async (req, res) => {
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
  const isMember = organization.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  return res.status(200).json({
    success: true,
    project: project,
  });
};

const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  if (!projectId) {
    return res.status(400).send("Project ID is required");
  }

  if (!name && !description) {
    return res.status(400).send("Name or description is required");
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
  const isMember = organization.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  if (name) {
    project.name = name;
  }

  if (description) {
    project.description = description;
  }

  await project.save();

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project: project,
  });
};

const deleteProject = async (req, res) => {
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

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .send("Only the organization owner or admin can delete a project");
  }

  await projectModel.findByIdAndDelete(projectId);

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
};

const addProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  if (!projectId || !email) {
    return res.status(400).send("Project ID and email are required");
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    return res.status(404).send("User not found");
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

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .send("Only the organization owner or admin can add project members");
  }

  const isOrganizationMember =
    organization.owner.equals(user._id) ||
    organization.admins.includes(user._id) ||
    organization.members.includes(user._id);

  if (!isOrganizationMember) {
    return res.status(400).send("User is not a member of this organization");
  }

  const alreadyMember = project.members.includes(user._id);

  if (alreadyMember) {
    return res.status(400).send("User is already a project member");
  }

  project.members.push(user._id);

  await project.save();

  return res.status(200).json({
    success: true,
    message: "Project member added successfully",
    project: project,
  });
};

const removeProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  if (!projectId || !email) {
    return res.status(400).send("Project ID and email are required");
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    return res.status(404).send("User not found");
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

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .send("Only the organization owner or admin can remove project members");
  }

  const isProjectMember = project.members.includes(user._id);

  if (!isProjectMember) {
    return res.status(400).send("User is not a project member");
  }

  project.members = project.members.filter(
    (memberId) => !memberId.equals(user._id),
  );

  await project.save();

  return res.status(200).json({
    success: true,
    message: "Project member removed successfully",
    project: project,
  });
};

const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("Project ID is required");
  }

  const project = await projectModel
    .findById(projectId)
    .populate("members", "-password");

  if (!project) {
    return res.status(404).send("Project not found");
  }

  const organization = await organizationModel.findById(project.organization);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  const isOwner = organization.owner.equals(req.userId);
  const isAdmin = organization.admins.includes(req.userId);
  const isMember = organization.members.includes(req.userId);

  if (!isOwner && !isAdmin && !isMember) {
    return res.status(403).send("You are not a member of this organization");
  }

  return res.status(200).json({
    success: true,
    members: project.members,
  });
};

export default {
  createProject,
  getOrganizationProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
};
