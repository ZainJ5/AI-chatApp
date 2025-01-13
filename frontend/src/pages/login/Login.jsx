import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import useLogin from "../../hooks/useLogin";
import GoogleButton from "../signup/GoogleButton";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const { loading, login } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await login({
        username: inputs.username,
        password: inputs.password
      });
    } catch (error) {
      setError(error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async (googleData) => {
    if (!googleData) {
      setError("Failed to get user data from Google");
      return;
    }
    console.log("Google data is: "+JSON.stringify(googleData))
    try {
      await login({
        googleId: googleData.uid,
        username: googleData.email.split('@')[0],
        fullName: googleData.displayName,
        profilePic: googleData.photoURL,
        gender: googleData.gender || "preferNotToSay" 
      });
    } catch (error) {
      setError(error.message || "Google login failed. Please try again.");
      console.error("Google login error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); 
  };

  return (
    <div className="min-h-screen min-w-[100%] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2 transform transition-all duration-300">
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600">
              <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] mix-blend-overlay opacity-20" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-center px-12 text-white space-y-6">
              <h2 className="text-4xl font-bold leading-tight">
                Welcome back!
              </h2>
              <p className="text-lg text-white/80">
                Sign in to continue your journey with us and reconnect with your community.
              </p>
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span>Access your messages</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span>Secure account access</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back
                </h2>
                <p className="text-gray-600">
                  Please sign in to continue
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div
                  className={`relative transform transition-all duration-200 ${
                    focusedField === 'username' ? 'scale-[1.02]' : ''
                  }`}
                >
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    value={inputs.username}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>

                <div
                  className={`relative transform transition-all duration-200 ${
                    focusedField === 'password' ? 'scale-[1.02]' : ''
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    value={inputs.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign in with google</span>
                </div>
              </div>

              <div className="mb-6">
              <GoogleButton 
  onSuccess={handleGoogleLogin} 
  mode="login"
/>              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;