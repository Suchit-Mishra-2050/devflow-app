import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createProject, getOrganizationProjects } from "../api/projectApi";
import { getMyOrganizations } from "../api/organizationApi";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizationId: "",
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadOrganizations = async () => {
    try {
      const data = await getMyOrganizations(token);

      if (data.success) {
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.log("Organizations error:", error);

      setMessage(error.response?.data || "Failed to load organizations");
    }
  };

  const loadProjects = async (organizationId) => {
    if (!organizationId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await getOrganizationProjects(organizationId, token);

      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.log("Projects error:", error);

      setMessage(error.response?.data || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrganizations();
    }
  }, [token]);

  useEffect(() => {
    if (formData.organizationId) {
      loadProjects(formData.organizationId);
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [formData.organizationId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;

    setFormData({
      ...formData,
      organizationId,
    });

    setLoading(true);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.organizationId) {
      setMessage("Please select an organization");
      return;
    }

    if (!formData.name.trim()) {
      setMessage("Project name is required");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const data = await createProject(
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          organizationId: formData.organizationId,
        },
        token,
      );

      if (data.success) {
        setMessage("Project created successfully");

        const selectedOrganizationId = formData.organizationId;

        setFormData({
          name: "",
          description: "",
          organizationId: selectedOrganizationId,
        });

        setShowForm(false);

        await loadProjects(selectedOrganizationId);
      }
    } catch (error) {
      console.log("Create project error:", error);

      setMessage(error.response?.data || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-400">Workspace</p>

          <h1 className="mt-1 text-3xl font-bold text-white">Projects</h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage projects across your organizations.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          {showForm ? "Cancel" : "+ Create Project"}
        </button>
      </div>

      {message && (
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      {showForm && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Create project</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Organization
              </label>

              <select
                name="organizationId"
                value={formData.organizationId}
                onChange={handleOrganizationChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Select organization</option>

                {organizations.map((organization) => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Project name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. DevFlow Website"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project..."
                rows="4"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8">
        {!formData.organizationId ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-xl text-slate-400">
              P
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Select an organization
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Select an organization from the create project form to view its
              projects.
            </p>
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-xl text-slate-400">
              +
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              No projects yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              This organization doesn't have any projects yet.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => {
                  console.log("Project clicked:", project._id);
                  navigate(`/projects/${project._id}`);
                }}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600/10 font-bold text-blue-400">
                  {project.name?.charAt(0).toUpperCase()}
                </div>

                <h2 className="mt-5 text-lg font-semibold text-white">
                  {project.name}
                </h2>

                <p className="mt-2 min-h-[60px] line-clamp-3 text-sm leading-5 text-slate-500">
                  {project.description || "No description provided."}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-xs text-slate-500">Members</span>

                  <span className="text-sm font-medium text-slate-300">
                    {project.members?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
