import {
  getProjectTasks,
  getDeletedProjectTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  restoreTask,
} from "../api/taskApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  updateProject,
  deleteProject,
} from "../api/projectApi";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState("");
  const [memberMessage, setMemberMessage] = useState("");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");

  const [deletedTasks, setDeletedTasks] = useState([]);
  const [deletedTaskLoading, setDeletedTaskLoading] = useState(false);
  const [deletedTaskMessage, setDeletedTaskMessage] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState("");
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("MEDIUM");
  const [editTaskAssignedTo, setEditTaskAssignedTo] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [updatingTask, setUpdatingTask] = useState(false);
  const [restoringTask, setRestoringTask] = useState("");

  const token = localStorage.getItem("token");

  const loadDeletedTasks = async () => {
    try {
      setDeletedTaskLoading(true);
      setDeletedTaskMessage("");

      const data = await getDeletedProjectTasks(projectId, token);

      if (data.success) {
        setDeletedTasks(data.tasks || []);
      }
    } catch (error) {
      console.log("Deleted tasks error:", error);

      setDeletedTaskMessage(
        error.response?.data || "Failed to load deleted tasks",
      );
    } finally {
      setDeletedTaskLoading(false);
    }
  };

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        setLoading(true);
        setMessage("");
        setTaskLoading(true);
        setTaskMessage("");

        const projectData = await getProject(projectId, token);

        if (projectData.success) {
          setProject(projectData.project);
        }

        const membersData = await getProjectMembers(projectId, token);

        if (membersData.success) {
          setMembers(membersData.members || []);
        }

        const tasksData = await getProjectTasks(projectId, token);

        if (tasksData.success) {
          setTasks(tasksData.tasks || []);
        }
        await loadDeletedTasks();
      } catch (error) {
        console.log("Project details error:", error);

        setMessage(error.response?.data || "Failed to load project details");
      } finally {
        setLoading(false);
        setTaskLoading(false);
      }
    };

    if (projectId && token) {
      loadProjectDetails();
    }
  }, [projectId, token]);

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setMemberMessage("Member email is required");
      return;
    }

    try {
      setAddingMember(true);
      setMemberMessage("");

      const data = await addProjectMember(projectId, email.trim(), token);

      if (data.success) {
        setMemberMessage("Member added successfully");
        setEmail("");

        const membersData = await getProjectMembers(projectId, token);

        if (membersData.success) {
          setMembers(membersData.members || []);
        }
      }
    } catch (error) {
      console.log("Add member error:", error);

      setMemberMessage(error.response?.data || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      setRemovingMember(email);
      setMemberMessage("");

      const data = await removeProjectMember(projectId, email, token);

      if (data.success) {
        setMemberMessage("Member removed successfully");

        const membersData = await getProjectMembers(projectId, token);

        if (membersData.success) {
          setMembers(membersData.members || []);
        }
      }
    } catch (error) {
      console.log("Remove member error:", error);

      setMemberMessage(error.response?.data || "Failed to remove member");
    } finally {
      setRemovingMember("");
    }
  };

  const handleEditClick = () => {
    setEditName(project.name || "");
    setEditDescription(project.description || "");
    setEditing(true);
    setMessage("");
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();

    if (!editName.trim()) {
      setMessage("Project name is required");
      return;
    }

    try {
      setUpdating(true);
      setMessage("");

      const data = await updateProject(
        projectId,
        {
          name: editName.trim(),
          description: editDescription.trim(),
        },
        token,
      );

      if (data.success) {
        setProject(data.project);
        setEditing(false);
      }
    } catch (error) {
      console.log("Update project error:", error);

      setMessage(error.response?.data || "Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const data = await deleteProject(projectId, token);

      if (data.success) {
        navigate("/projects");
      }
    } catch (error) {
      console.log("Delete project error:", error);

      setMessage(error.response?.data || "Failed to delete project");
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!taskTitle.trim()) {
      setTaskMessage("Task title is required");
      return;
    }

    try {
      setCreatingTask(true);
      setTaskMessage("");

      const data = await createTask(
        {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          projectId,
          assignedTo: taskAssignedTo || null,
          priority: taskPriority,
          dueDate: taskDueDate || null,
        },
        token,
      );

      if (data.success) {
        setTaskTitle("");
        setTaskDescription("");
        setTaskAssignedTo("");
        setTaskPriority("MEDIUM");
        setTaskDueDate("");

        const tasksData = await getProjectTasks(projectId, token);

        if (tasksData.success) {
          setTasks(tasksData.tasks || []);
        }

        setTaskMessage("Task created successfully");
      }
    } catch (error) {
      console.log("Create task error:", error);

      setTaskMessage(error.response?.data || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      setTaskMessage("");

      const data = await updateTaskStatus(taskId, status, token);

      if (data.success) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === taskId ? { ...task, status } : task,
          ),
        );
      }
    } catch (error) {
      console.log("Update task status error:", error);

      setTaskMessage(error.response?.data || "Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setTaskMessage("");

      const data = await deleteTask(taskId, token);

      if (data.success) {
        setTasks((currentTasks) =>
          currentTasks.filter((task) => task._id !== taskId),
        );
        await loadDeletedTasks();
      }
    } catch (error) {
      console.log("Delete task error:", error);

      setTaskMessage(error.response?.data || "Failed to delete task");
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      setRestoringTask(taskId);
      setTaskMessage("");

      const data = await restoreTask(taskId, token);

      if (data.success) {
        const tasksData = await getProjectTasks(projectId, token);

        if (tasksData.success) {
          setTasks(tasksData.tasks || []);
        }
        await loadDeletedTasks();
        setTaskMessage("Task restored successfully");
      }
    } catch (error) {
      console.log("Restore task error:", error);

      setTaskMessage(error.response?.data || "Failed to restore task");
    } finally {
      setRestoringTask("");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
          <p className="text-sm text-red-400">{message}</p>

          <button
            onClick={() => navigate("/projects")}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-sm text-slate-500">Project not found.</p>

          <button
            onClick={() => navigate("/projects")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className="mb-6 text-sm font-medium text-slate-400 hover:text-white"
      >
        ← Back to Projects
      </button>

      {/* Project information */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        {editing ? (
          <form onSubmit={handleUpdateProject}>
            <h2 className="text-xl font-semibold text-white">Edit Project</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Project Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                rows="4"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setMessage("");
                }}
                disabled={updating}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10 text-lg font-bold text-blue-400">
                {project.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleEditClick}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Edit Project
                </button>

                <button
                  onClick={handleDeleteProject}
                  className="rounded-lg border border-red-900/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30"
                >
                  Delete Project
                </button>
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              {project.name}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {project.description || "No description provided."}
            </p>
          </>
        )}
      </div>

      {/* Project members */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        {/* Members header */}
        <div>
          <h2 className="text-lg font-semibold text-white">Project Members</h2>

          <p className="mt-1 text-sm text-slate-500">
            {members.length} member
            {members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Add member form */}
        <form
          onSubmit={handleAddMember}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter member email"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={addingMember}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addingMember ? "Adding..." : "Add Member"}
          </button>
        </form>

        {/* Member message */}
        {memberMessage && (
          <p className="mt-3 text-sm text-slate-400">{memberMessage}</p>
        )}

        {/* Members list */}
        {members.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500">No project members found.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{member.name}</p>

                  <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                </div>

                <button
                  onClick={() => handleRemoveMember(member.email)}
                  disabled={removingMember === member.email}
                  className="rounded-lg border border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingMember === member.email ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Tasks */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Project Tasks</h2>

          <p className="mt-1 text-sm text-slate-500">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>

        <form
          onSubmit={handleCreateTask}
          className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-5"
        >
          <h3 className="text-base font-semibold text-white">
            Create New Task
          </h3>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Task Title
            </label>

            <input
              type="text"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Enter task title"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Enter task description"
              rows="3"
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Assign To
              </label>

              <select
                value={taskAssignedTo}
                onChange={(event) => setTaskAssignedTo(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>

                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Priority
              </label>

              <select
                value={taskPriority}
                onChange={(event) => setTaskPriority(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Due Date
              </label>

              <input
                type="date"
                value={taskDueDate}
                onChange={(event) => setTaskDueDate(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={creatingTask}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingTask ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>

        {taskMessage && (
          <p className="mt-4 text-sm text-red-400">{taskMessage}</p>
        )}

        {taskLoading ? (
          <div className="mt-6 rounded-lg border border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500">
              No tasks found for this project.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-white">{task.title}</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {task.description || "No description"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(event) =>
                        handleTaskStatusChange(task._id, event.target.value)
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="DONE">DONE</option>
                    </select>

                    <button
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditingTaskId(task._id);
                        setEditTaskTitle(task.title || "");
                        setEditTaskDescription(task.description || "");
                        setEditTaskPriority(task.priority || "MEDIUM");
                        setEditTaskAssignedTo(task.assignedTo?._id || "");
                        setEditTaskDueDate(
                          task.dueDate
                            ? new Date(task.dueDate).toISOString().split("T")[0]
                            : "",
                        );
                      }}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="rounded-lg border border-red-900/50 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editingTaskId === task._id && (
                  <form
                    onSubmit={async (event) => {
                      event.preventDefault();

                      try {
                        setUpdatingTask(true);
                        setTaskMessage("");

                        const data = await updateTask(
                          task._id,
                          {
                            title: editTaskTitle.trim(),
                            description: editTaskDescription.trim(),
                            priority: editTaskPriority,
                            assignedTo: editTaskAssignedTo || null,
                            dueDate: editTaskDueDate || null,
                          },
                          token,
                        );

                        if (data.success) {
                          setTasks((currentTasks) =>
                            currentTasks.map((currentTask) =>
                              currentTask._id === task._id
                                ? {
                                    ...currentTask,
                                    ...data.task,
                                  }
                                : currentTask,
                            ),
                          );

                          setEditingTaskId("");
                        }
                      } catch (error) {
                        console.log("Update task error:", error);

                        setTaskMessage(
                          error.response?.data || "Failed to update task",
                        );
                      } finally {
                        setUpdatingTask(false);
                      }
                    }}
                    className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-4"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Task Title
                      </label>

                      <input
                        type="text"
                        value={editTaskTitle}
                        onChange={(event) =>
                          setEditTaskTitle(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Description
                      </label>

                      <textarea
                        value={editTaskDescription}
                        onChange={(event) =>
                          setEditTaskDescription(event.target.value)
                        }
                        rows="3"
                        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <select
                        value={editTaskAssignedTo}
                        onChange={(event) =>
                          setEditTaskAssignedTo(event.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="">Unassigned</option>

                        {members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={editTaskPriority}
                        onChange={(event) =>
                          setEditTaskPriority(event.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>

                      <input
                        type="date"
                        value={editTaskDueDate}
                        onChange={(event) =>
                          setEditTaskDueDate(event.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                      />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        disabled={updatingTask}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        {updatingTask ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingTaskId("")}
                        disabled={updatingTask}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Priority: {task.priority}</span>

                  <span>
                    Assigned to: {task.assignedTo?.name || "Unassigned"}
                  </span>

                  {task.dueDate && (
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Project Trash */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Trash</h2>

          <p className="mt-1 text-sm text-slate-500">
            {deletedTasks.length} deleted task
            {deletedTasks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {deletedTaskMessage && (
          <p className="mt-4 text-sm text-red-400">{deletedTaskMessage}</p>
        )}

        {deletedTaskLoading ? (
          <div className="mt-6 rounded-lg border border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500">Loading deleted tasks...</p>
          </div>
        ) : deletedTasks.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500">No deleted tasks.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {deletedTasks.map((task) => (
              <div
                key={task._id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-white">{task.title}</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {task.description || "No description"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestoreTask(task._id)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"
                  >
                    {restoringTask === task._id ? "Restoring..." : "Restore"}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Priority: {task.priority}</span>

                  <span>
                    Assigned to: {task.assignedTo?.name || "Unassigned"}
                  </span>

                  {task.deletedAt && (
                    <span>
                      Deleted: {new Date(task.deletedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
