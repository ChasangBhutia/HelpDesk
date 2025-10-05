// src/components/Auth/LoginForm.jsx
import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";

const LoginForm = ({ role }) => {
  const { loginUser, error } = useAuthContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser({ email: form.email, password: form.password });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[92vh] flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-8 rounded-xl shadow-sm w-full max-w-sm mx-auto"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Login as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Don’t have an account?{" "}
          <span className="text-blue-600 hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </form>
    </div>
  );

};

export default LoginForm;
