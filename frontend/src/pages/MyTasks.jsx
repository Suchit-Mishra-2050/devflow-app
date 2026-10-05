import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyTasks } from "../api/taskApi";

const MyTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loadTasks = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const data = await getMyTasks(token);

      console.log("My tasks:", data);

      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.log("My tasks error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const isTaskOverdue = (dueDate, status) => {
    if (!dueDate || status === "DONE") {
      return false;
    }

    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs text-slate-500">Total Tasks</p>
          <p className="mt-2 text-2xl font-bold text-white">{tasks.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {tasks.filter((task) => task.status === "IN_PROGRESS").length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {tasks.filter((task) => task.status === "DONE").length}
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-400">Tasks</p>

          <h1 className="mt-1 text-3xl font-bold text-white">My Tasks</h1>

          <p className="mt-2 text-sm text-slate-400">
            Tasks assigned to {user?.name}.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        <button
          type="button"
          onClick={loadTasks}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("ALL");
            setPriorityFilter("ALL");
          }}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
        >
          Clear Filters
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-slate-400">
            {tasks.length === 0
              ? "You don't have any tasks yet."
              : "No tasks match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => navigate(`/tasks/${task._id}`)}
              className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500 hover:bg-slate-800"
            >
              <h2 className="font-semibold text-white">{task.title}</h2>

              <p className="mt-2 text-sm text-slate-400">
                {task.description || "No description"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    task.status === "TODO"
                      ? "bg-slate-800 text-slate-300"
                      : task.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400"
                        : task.status === "REVIEW"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    task.priority === "LOW"
                      ? "bg-slate-800 text-slate-300"
                      : task.priority === "MEDIUM"
                        ? "bg-blue-500/10 text-blue-400"
                        : task.priority === "HIGH"
                          ? "bg-orange-500/10 text-orange-400"
                          : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              {task.createdBy?.name && (
                <p className="mt-4 text-xs text-slate-500">
                  Created by {task.createdBy.name}
                </p>
              )}

              {task.dueDate && (
                <p className="mt-4 text-xs text-slate-500">
                  Due:{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {isTaskOverdue(task.dueDate, task.status) && (
                <p className="mt-2 text-xs font-medium text-red-400">Overdue</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
