import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import axios from "axios"; // ✅ Added axios import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://192.168.100.49:3000/api/auth/login", {
        email, password,});

      if (response.data.success) {
        await login(response.data.user, response.data.token);
        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/customer/dashboard");
        }
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      if(error.response){
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Always wrap everything in one root element */}
      <div className="flex items-center justify-center min-h-screen bg-[#0F1C2B] p-4">
        {/* Login Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Brand Title */}
          <h1 className="text-3xl font-bold text-center text-[#1AD6D0] tracking-wide">
            DARAJA
          </h1>
          <p className="text-center text-sm text-gray-500 -mt-3">
            stock management system
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 text-sm rounded-md text-center">
              {error}
            </div>
          )}

          {/* Form Section */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1AD6D0] focus:border-[#1AD6D0] outline-none transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1AD6D0] focus:border-[#1AD6D0] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-gray-500 text-sm hover:text-[#1AD6D0] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-[#1AD6D0] hover:text-[#14b5af] transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1AD6D0] text-[#0F1C2B] py-2.5 rounded-lg font-semibold hover:bg-[#14b5af] transition-all"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="h-px bg-gray-300 w-1/4"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px bg-gray-300 w-1/4"></div>
          </div>

          {/* Signup Prompt */}
          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a
              href="#"
              className="font-medium text-[#1AD6D0] hover:text-[#14b5af] transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
