import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrganization } from "../api/organizationApi";

const OrganizationDetails = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadOrganization = async () => {
    try {
      setLoading(true);

      const data = await getOrganization(organizationId, token);

      if (data.success) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.log("Organization details error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && organizationId) {
      loadOrganization();
    }
  }, [organizationId, token]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

        <p className="mt-4 text-sm text-slate-500">Loading organization...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
        <h2 className="text-lg font-semibold text-white">
          Organization not found
        </h2>

        <button
          type="button"
          onClick={() => navigate("/organizations")}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Back to Organizations
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <button
          type="button"
          onClick={() => navigate("/organizations")}
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          ← Back to Organizations
        </button>

        <p className="mt-6 text-sm font-medium text-blue-400">Workspace</p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          {organization.name}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage your organization and team members.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-500">Members</p>

          <p className="mt-2 text-3xl font-bold text-white">
            {organization.members?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-500">Admins</p>

          <p className="mt-2 text-3xl font-bold text-white">
            {organization.admins?.length || 0}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Organization Members
        </h2>

        {organization.members?.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">No members found.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {organization.members?.map((member) => (
              <div
                key={member._id || member}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 p-4"
              >
                <div>
                  <p className="font-medium text-white">
                    {member.name || member.email || "Member"}
                  </p>

                  {member.email && (
                    <p className="mt-1 text-xs text-slate-500">
                      {member.email}
                    </p>
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

export default OrganizationDetails;
