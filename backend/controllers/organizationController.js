import organizationModel from "../models/organization.js";
import userModel from "../models/user.js";

const organization = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send("Create an Organization");
  }

  const newOrganization = new organizationModel({
    name: name,
    owner: req.userId,
    admins: [],
    members: [],
  });

  await newOrganization.save();

  return res.status(201).json({
    success: true,
    message: "Organization created successfully",
    organization: newOrganization,
  });
};

const addMember = async (req, res) => {
  const { email, role, organizationId } = req.body;

  if (!email || !role || !organizationId) {
    return res.status(400).send("Email ,role & organization ID are required");
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const organization = await organizationModel.findById(organizationId);

  if (!organization) {
    return res.status(404).send("Organization Id doesn't exist");
  }

  if (!organization.owner.equals(req.userId)) {
    return res.status(403).send("Only the organization owner can add members");
  }

  if (role !== "MEMBER" && role !== "ADMIN") {
    return res.status(400).send("Role must be MEMBER or ADMIN");
  }

  const alreadyMember = organization.members.includes(user._id);
  const alreadyAdmin = organization.admins.includes(user._id);

  if (alreadyMember || alreadyAdmin) {
    return res.status(400).send("User is already in this organization");
  }

  if (role === "MEMBER") {
    organization.members.push(user._id);
  } else if (role === "ADMIN") {
    organization.admins.push(user._id);
  }

  await organization.save();

  return res.status(200).json({
    success: true,
    message: "User added successfully",
    organization: organization,
  });
};

const getOrganization = async (req, res) => {
  const { organizationId } = req.params;

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

  return res.status(200).json({
    success: true,
    organization: organization,
  });
};

const removeMember = async (req, res) => {
  const { organizationId } = req.params;
  const { email } = req.body;

  if (!email || !organizationId) {
    return res.status(400).send("Email and organization ID are required");
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const organization = await organizationModel.findById(organizationId);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  if (!organization.owner.equals(req.userId)) {
    return res
      .status(403)
      .send("Only the organization owner can remove members");
  }

  const isMember = organization.members.includes(user._id);
  const isAdmin = organization.admins.includes(user._id);

  if (!isMember && !isAdmin) {
    return res.status(400).send("User is not part of this organization");
  }

  if (isMember) {
    organization.members = organization.members.filter(
      (memberId) => !memberId.equals(user._id),
    );
  }

  if (isAdmin) {
    organization.admins = organization.admins.filter(
      (adminId) => !adminId.equals(user._id),
    );
  }

  await organization.save();

  return res.status(200).json({
    success: true,
    message: "User removed successfully",
    organization: organization,
  });
};

const changeMemberRole = async (req, res) => {
  const { organizationId } = req.params;
  const { email, role } = req.body;

  if (!organizationId || !email || !role) {
    return res.status(400).send("Organization ID, email and role are required");
  }

  if (role !== "MEMBER" && role !== "ADMIN") {
    return res.status(400).send("Role must be MEMBER or ADMIN");
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const organization = await organizationModel.findById(organizationId);

  if (!organization) {
    return res.status(404).send("Organization not found");
  }

  if (!organization.owner.equals(req.userId)) {
    return res.status(403).send("Only the organization owner can change roles");
  }

  const isMember = organization.members.includes(user._id);
  const isAdmin = organization.admins.includes(user._id);

  if (!isMember && !isAdmin) {
    return res.status(400).send("User is not part of this organization");
  }

  if (role === "ADMIN") {
    if (isAdmin) {
      return res.status(400).send("User is already an ADMIN");
    }

    organization.members = organization.members.filter(
      (memberId) => !memberId.equals(user._id),
    );

    organization.admins.push(user._id);
  }

  if (role === "MEMBER") {
    if (isMember) {
      return res.status(400).send("User is already a MEMBER");
    }

    organization.admins = organization.admins.filter(
      (adminId) => !adminId.equals(user._id),
    );

    organization.members.push(user._id);
  }

  await organization.save();

  return res.status(200).json({
    success: true,
    message: "User role changed successfully",
    organization: organization,
  });
};

const getMyOrganizations = async (req, res) => {
  const organizations = await organizationModel.find({
    $or: [
      { owner: req.userId },
      { admins: req.userId },
      { members: req.userId },
    ],
  });

  return res.status(200).json({
    success: true,
    organizations: organizations,
  });
};

export default {
  organization,
  addMember,
  getOrganization,
  removeMember,
  changeMemberRole,
  getMyOrganizations,
};
