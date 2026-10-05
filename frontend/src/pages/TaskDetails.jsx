import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  restoreTask,
} from "../api/taskApi";

import { getTaskActivities } from "../api/taskActivityApi";

import { getProjectMembers } from "../api/projectApi";

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [activities, setActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState(null);

  const [editing, setEditing] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  const [updating, setUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const [projectMembers, setProjectMembers] = useState([]);

  const token = localStorage.getItem("token");

  const loadActivities = async (page = 1) => {
    try {
      const activityData = await getTaskActivities(taskId, token, {
        page,
        limit: 10,
      });

      if (activityData.success) {
        setActivities(activityData.activities || []);
        setActivityPagination(activityData.pagination || null);
        setActivityPage(page);
      }
    } catch (error) {
      console.log("Activity history error:", error);
    }
  };

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setMessage("");

        const data = await getTask(taskId, token);

        if (data.success) {
          setTask(data.task);

          const membersData = await getProjectMembers(data.task.project, token);

          if (membersData.success) {
            setProjectMembers(membersData.members || []);
          }
        }

        await loadActivities(1);
      } catch (error) {
        console.log("Task details error:", error);

        setMessage(error.response?.data || "Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    if (taskId && token) {
      loadTask();
    }
  }, [taskId, token]);

  const formatActivityAction = (action) => {
    const actionLabels = {
      CREATED: "Task created",
      UPDATED: "Task updated",
      STATUS_CHANGED: "Status changed",
      ASSIGNED: "Task assigned",
      UNASSIGNED: "Task unassigned",
      DELETED: "Task deleted",
      RESTORED: "Task restored",
    };

    return actionLabels[action] || action;
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    try {
      setUpdatingStatus(true);
      setMessage("");

      const data = await updateTaskStatus(taskId, newStatus, token);

      if (data.success) {
        setTask((currentTask) => ({
          ...currentTask,
          status: newStatus,
        }));

        await loadActivities(1);
      }
    } catch (error) {
      console.log("Update task status error:", error);

      setMessage(error.response?.data || "Failed to update task status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStartEditing = () => {
    setEditing(true);
    setMessage("");

    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "MEDIUM");

    setEditAssignedTo(task.assignedTo?._id || "");

    setEditDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    );
  };

  const handleUpdateTask = async (event) => {
    event.preventDefault();

    if (!editTitle.trim()) {
      setMessage("Task title is required");
      return;
    }

    try {
      setUpdating(true);
      setMessage("");

      const data = await updateTask(
        taskId,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
          dueDate: editDueDate || null,
          assignedTo: editAssignedTo || null,
        },
        token,
      );

      if (data.success) {
        setTask((currentTask) => ({
          ...currentTask,
          ...data.task,
        }));

        setEditing(false);

        await loadActivities(1);
      }
    } catch (error) {
      console.log("Update task error:", error);

      setMessage(error.response?.data || "Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setDeleting(true);
      const data = await deleteTask(taskId, token);

      if (data.success) {
        navigate(-1);
      }
    } catch (error) {
      console.log("Delete task error:", error);

      setMessage(error.response?.data || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivityPrevious = () => {
    if (activityPagination && activityPage > 1) {
      loadActivities(activityPage - 1);
    }
  };

  const handleActivityNext = () => {
    if (activityPagination && activityPage < activityPagination.totalPages) {
      loadActivities(activityPage + 1);
    }
  };

  const handleRestoreTask = async () => {
    try {
      setMessage("");
      setRestoring(true);

      const data = await restoreTask(taskId, token);

      if (data.success) {
        setTask((currentTask) => ({
          ...currentTask,
          isDeleted: false,
        }));

        await loadActivities(1);
      }
    } catch (error) {
      console.log("Restore task error:", error);

      setMessage(error.response?.data || "Failed to restore task");
    } finally {
      setRestoring(false);
    }
  };

  const isTaskOverdue = (dueDate, status) => {
    if (!dueDate || status === "DONE") {
      return false;
    }

    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-sm text-slate-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (message && !task) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
          <p className="text-sm text-red-400">{message}</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-sm text-slate-500">Task not found.</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-medium text-slate-400 hover:text-white"
      >
        ← Back
      </button>

      {message && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4">
          <p className="text-sm text-red-400">{message}</p>
        </div>
      )}

      {/* Task Details */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={handleStatusChange}
              disabled={updatingStatus || task.isDeleted}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="TODO">TODO</option>

              <option value="IN_PROGRESS">IN PROGRESS</option>

              <option value="REVIEW">REVIEW</option>

              <option value="DONE">DONE</option>
            </select>

            <button
              onClick={handleStartEditing}
              disabled={deleting || restoring || task.isDeleted}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit
            </button>

            {task.isDeleted ? (
              <button
                onClick={handleRestoreTask}
                disabled={restoring}
                className="rounded-lg border border-green-900/50 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-950/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restoring ? "Restoring..." : "Restore"}
              </button>
            ) : (
              <button
                onClick={handleDeleteTask}
                disabled={deleting || editing}
                className="rounded-lg border border-red-900/50 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Edit Task */}
        {editing && (
          <form
            onSubmit={handleUpdateTask}
            className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5"
          >
            <h2 className="text-lg font-semibold text-white">Edit Task</h2>

            <div className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm text-slate-400">Title</label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  disabled={updating}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-slate-400">Description</label>

                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows="4"
                  disabled={updating}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Priority + Due Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-400">Priority</label>

                  <select
                    value={editPriority}
                    onChange={(event) => setEditPriority(event.target.value)}
                    disabled={updating}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="LOW">LOW</option>

                    <option value="MEDIUM">MEDIUM</option>

                    <option value="HIGH">HIGH</option>

                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Due Date</label>

                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                    disabled={updating}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="text-sm text-slate-400">Assigned To</label>

                <select
                  value={editAssignedTo}
                  onChange={(event) => setEditAssignedTo(event.target.value)}
                  disabled={updating}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Unassigned</option>

                  {projectMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={updating}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Task Metadata */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Priority</p>

            <p className="mt-1 text-sm font-medium text-white">
              {task.priority}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Assigned To</p>

            <p className="mt-1 text-sm font-medium text-white">
              {task.assignedTo?.name || "Unassigned"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Created By</p>

            <p className="mt-1 text-sm font-medium text-white">
              {task.createdBy?.name || "Unknown"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Due Date</p>

            <p className="mt-1 text-sm font-medium text-white">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No due date"}
            </p>
            {isTaskOverdue(task.dueDate, task.status) && (
              <p className="mt-2 text-xs font-medium text-red-400">Overdue</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Activity History</h2>

          {activityPagination && (
            <p className="text-xs text-slate-500">
              Page {activityPage} of {activityPagination.totalPages}
            </p>
          )}
        </div>

        {activities.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No activity yet.</p>
        ) : (
          <>
            <div className="mt-5 space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex gap-4 border-b border-slate-800 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      {formatActivityAction(activity.action)}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {activity.details || "No additional details"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {activity.user?.name || "Unknown user"} ·{" "}
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Pagination */}
            {activityPagination && activityPagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                <button
                  onClick={handleActivityPrevious}
                  disabled={activityPage === 1}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="text-xs text-slate-500">
                  {activityPagination.totalActivities} activities
                </span>

                <button
                  onClick={handleActivityNext}
                  disabled={activityPage >= activityPagination.totalPages}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
