// src/components/Auth/RegisterForm.jsx
import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom";

const RegisterForm = ({ role }) => {

    const navigate = useNavigate();

    const { registerUser, error } = useAuthContext();
    const [form, setForm] = useState({
        fullname: "",
        email: "",
        password: "",
        specialties: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                fullname: form.fullname,
                email: form.email,
                password: form.password,
                role,
            };
            if (role === "agent") {
                payload.specialties = form.specialties.split(",").map((s) => s.trim());
            }
            await registerUser(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[92vh] flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-50 p-8 rounded-xl shadow-sm w-full max-w-sm mx-auto"
            >
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                    Register as {role.charAt(0).toUpperCase() + role.slice(1)}
                </h2>

                <div className="mb-4">
                    <label className="block text-gray-600 text-sm mb-1" htmlFor="fullname">
                        Full Name
                    </label>
                    <input
                        id="fullname"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                        value={form.fullname}
                        onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-600 text-sm mb-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </div>

                {role === "agent" && (
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm mb-1" htmlFor="specialties">
                            Specialties (comma-separated)
                        </label>
                        <input
                            id="specialties"
                            type="text"
                            placeholder="Support, Networking, Sales"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                            value={form.specialties}
                            onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                        />
                    </div>
                )}

                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg shadow-sm transition"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                    Already have an account?{" "}
                    <button onClick={()=>{navigate('/auth/login')}} className="text-green-600 hover:underline cursor-pointer">
                        Login
                    </button>
                </p>
            </form>

        </div>
    )
};

export default RegisterForm;
