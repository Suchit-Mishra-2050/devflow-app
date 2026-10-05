import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/authApi";

const Settings = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const data = await updateProfile(token, {
        name,
        email,
      });

      if (data.success) {
        setUser(data.user);
        setMessage("Profile updated successfully.");
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-blue-400">Account</p>

        <h1 className="mt-1 text-3xl font-bold text-white">Settings</h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage your account information.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Profile Information
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Role
            </label>

            <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-400">
              {user.role || "MEMBER"}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Your role is managed by the system.
            </p>
          </div>

          {message && <p className="text-sm text-green-400">{message}</p>}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
