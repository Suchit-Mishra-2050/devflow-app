import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTaskStats } from "../api/dashboardApi";
import { getOverdueTasks, getMyTasks } from "../api/taskApi";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    overdue: 0,
  });

  const [overdueTasks, setOverdueTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [statsData, overdueData, myTasksData] = await Promise.all([
        getTaskStats(token),
        getOverdueTasks(token),
        getMyTasks(token),
      ]);

      console.log("Task stats:", statsData);
      console.log("Overdue tasks:", overdueData);

      if (statsData.success) {
        setStats({
          total: statsData.stats?.totalTasks || 0,
          todo: statsData.stats?.todoTasks || 0,
          inProgress: statsData.stats?.inProgressTasks || 0,
          review: statsData.stats?.reviewTasks || 0,
          done: statsData.stats?.completedTasks || 0,
          overdue: statsData.stats?.overdueTasks || 0,
        });
      }

      if (overdueData.success) {
        setOverdueTasks(overdueData.tasks || []);
      }
      if (myTasksData.success) {
        setMyTasks(myTasksData.tasks || []);
      }
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const todoPercentage = stats.total > 0 ? (stats.todo / stats.total) * 100 : 0;

  const inProgressPercentage =
    stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0;

  const reviewPercentage =
    stats.total > 0 ? (stats.review / stats.total) * 100 : 0;

  const completedPercentage =
    stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      description: "Tasks assigned to you",
    },
    {
      title: "To Do",
      value: stats.todo,
      description: "Tasks waiting to be started",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Tasks currently being worked on",
    },
    {
      title: "Completed",
      value: stats.done,
      description: "Successfully completed tasks",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-400">Dashboard</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Welcome back, {user?.name}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Here's what's happening across your DevFlow workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {statCards.map((stat) => (
              <button
                key={stat.title}
                type="button"
                onClick={() => navigate("/tasks")}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
              >
                <p className="text-sm font-medium text-slate-400">
                  {stat.title}
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {stat.description}
                </p>
              </button>
            ))}

            {/* Overdue Card */}
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="w-full rounded-xl border border-red-900/40 bg-slate-900 p-6 text-left transition hover:border-red-500/60 hover:bg-slate-800"
            >
              <p className="text-sm font-medium text-slate-400">Overdue</p>

              <p className="mt-3 text-3xl font-bold text-red-400">
                {stats.overdue}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Tasks past their due date
              </p>
            </button>
          </div>

          {/* Main Dashboard Content */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Task Overview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Task Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current status of your tasks.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  View Tasks
                </button>
              </div>
              <div className="mt-6 space-y-5">
                {/* TODO */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">To Do</span>

                    <span className="text-white">{stats.todo}</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-slate-500"
                      style={{ width: `${todoPercentage}%` }}
                    />
                  </div>
                </div>

                {/* IN PROGRESS */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">In Progress</span>

                    <span className="text-white">{stats.inProgress}</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${inProgressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* REVIEW */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">Review</span>

                    <span className="text-white">{stats.review}</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-yellow-500"
                      style={{ width: `${reviewPercentage}%` }}
                    />
                  </div>
                </div>

                {/* COMPLETED */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">Completed</span>

                    <span className="text-white">{stats.done}</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${completedPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump directly into your workspace.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/organizations")}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-slate-700"
                >
                  <p className="font-medium text-white">Manage Organizations</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Create and manage your teams.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-slate-700"
                >
                  <p className="font-medium text-white">View Projects</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage your development projects.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-slate-700"
                >
                  <p className="font-medium text-white">View My Tasks</p>

                  <p className="mt-1 text-xs text-slate-500">
                    See tasks assigned to you.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Overdue Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tasks that need your attention.
                </p>
              </div>

              {overdueTasks.length > 0 && (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                  {overdueTasks.length} overdue
                </span>
              )}
            </div>

            {overdueTasks.length === 0 ? (
              <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6 text-center">
                <p className="text-sm font-medium text-green-400">
                  No overdue tasks
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You're all caught up.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {overdueTasks.map((task) => (
                  <button
                    key={task._id}
                    type="button"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-red-500/50 hover:bg-slate-800"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>

                        <p className="mt-1 text-xs text-slate-500">
                          {task.project?.name || "Unknown project"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                          Overdue
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                          {task.status?.replace("_", " ")}
                        </span>

                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {task.dueDate && (
                      <p className="mt-3 text-xs text-red-400">
                        Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* My Tasks */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">My Tasks</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tasks currently assigned to you.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                View All
              </button>
            </div>

            {myTasks.length === 0 ? (
              <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6 text-center">
                <p className="text-sm text-slate-400">
                  You don't have any assigned tasks.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {myTasks.slice(0, 5).map((task) => (
                  <button
                    key={task._id}
                    type="button"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-blue-500/50 hover:bg-slate-800"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>

                        <p className="mt-1 text-xs text-slate-500">
                          {task.project?.name || "Unknown project"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
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
                          {task.status?.replace("_", " ")}
                        </span>

                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
