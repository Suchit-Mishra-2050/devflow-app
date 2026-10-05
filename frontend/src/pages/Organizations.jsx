import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrganization, getMyOrganizations } from "../api/organizationApi";

const Organizations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrganizations(token);

      setOrganizations(data.organizations || []);
    } catch (error) {
      setError(error.response?.data || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrganizations();
    }
  }, [token]);

  const handleCreateOrganization = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const data = await createOrganization({ name: name.trim() }, token);

      setOrganizations((prev) => [...prev, data.organization]);

      setName("");
      setMessage("Organization created successfully");
    } catch (error) {
      setError(error.response?.data || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Workspace</p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Organizations
          </h1>

          <p className="mt-2 text-gray-600">
            Create and manage your organizations.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          {organizations.length} organization
          {organizations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Create Organization */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Create Organization
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create a workspace to organize your projects and team members.
          </p>
        </div>

        <form onSubmit={handleCreateOrganization} className="mt-5 flex gap-4">
          <input
            type="text"
            placeholder="Organization name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}
      </div>

      {/* Organization List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Your Organizations
        </h2>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading organizations...
            </p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No organizations yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Create your first organization to start managing projects and team
              members.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((organization) => (
              <div
                key={organization._id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {organization.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Organization workspace
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>Members: {organization.members?.length || 0}</p>

                  <p>Admins: {organization.admins?.length || 0}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/organizations/${organization._id}`)}
                  className="mt-5 w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  View Organization
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizations;
