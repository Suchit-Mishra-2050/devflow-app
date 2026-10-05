import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getProfile } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      if (!data.success) {
        setMessage("Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      const profileData = await getProfile(data.token);

      if (profileData.success) {
        setUser(profileData.user);
      }

      navigate("/dashboard");
    } catch (error) {
      console.log("Login error:", error);
      console.log("Response:", error.response);

      setMessage(error.response?.data || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white text-xl font-bold mb-4">
            D
          </div>

          <h1 className="text-3xl font-bold text-white">Welcome back</h1>

          <p className="mt-2 text-slate-400">
            Sign in to continue to your DevFlow workspace.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create account
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 DevFlow. Built for modern teams.
        </p>
      </div>
    </div>
  );
};

export default Login;
