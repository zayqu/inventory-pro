import React, { useState } from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    cons [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {

              const response = await axios.post("https://localhost:5000/api/login", { 
                    email: email});

                    if (response.data.status) {
                    }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            } 
        }
    }

const [showPassword, setShowPassword] = useState(false);


return (
<>
{/* ✅ Always wrap everything in one root element */} <div className="flex items-center justify-center min-h-screen bg-[#0F1C2B] p-4">
{/* Login Card */} <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
{/* Logo Section */} { /*<div className="flex justify-center mb-2">  <img
           src="/assets/daraja-logo.png"
           alt="Daraja Logo"
           className="w-20 h-auto hover:scale-105 transition-transform duration-300" 
         /> </div> */}


      {/* Brand Title */}
      <h1 className="text-3xl font-bold text-center text-[#1AD6D0] tracking-wide">
        DARAJA
      </h1>
      <p className="text-center text-sm text-gray-500 -mt-3">
        stock management system
      </p>

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
            name="email"
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
              name="password"
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

        {/* Forgot Password Link */}
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
          Login
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
}

export default Login;
