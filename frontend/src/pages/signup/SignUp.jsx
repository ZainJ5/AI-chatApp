import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ChevronRight, User, Mail, Lock } from "lucide-react";
import useSignup from "../../hooks/useSignup";
import GoogleButton from "./GoogleButton";
import toast from "react-hot-toast";

export default function SignUp() {
  const [inputs, setInputs] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { loading, signup } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputs.acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    await signup({
      fullName: inputs.fullName,
      username: inputs.username,
      password: inputs.password,
      confirmPassword: inputs.confirmPassword,
      gender: inputs.gender,
      googleId: ""
    });
  };

  const handleGoogleSignup = async (userData) => {
    if (!userData) {
      toast.error("Failed to get user data from Google");
      return;
    }

    try {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      const signupData = {
        fullName: userData.displayName || "Google User",
        username: userData.email.split("@")[0],
        password: randomPassword,
        confirmPassword: randomPassword,
        gender: userData.gender || "preferNotToSay",
        googleId: userData.uid,
      };

      await signup(signupData);
    } catch (error) {
      toast.error("Failed to complete Google signup. Please try again.");
      console.error("Google signup error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2 transform transition-all duration-300">
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600">
              <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] mix-blend-overlay opacity-20"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-center p-8">
              <h2 className="text-3xl font-bold leading-tight text-white mb-4">
                Join our community
              </h2>
              <p className="text-base text-white/80 mb-6">
                Connect with friends and family, share moments, and discover new perspectives.
              </p>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white">Create your unique profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white">Connect with friends globally</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white">Secure & private messaging</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Create Account
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Start your journey with us today
              </p>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <div
                    className={`relative transform transition-all duration-200 ${focusedField === 'fullName' ? 'scale-[1.02]' : ''
                      }`}
                  >
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      value={inputs.fullName}
                      onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>

                  <div
                    className={`relative transform transition-all duration-200 ${focusedField === 'username' ? 'scale-[1.02]' : ''
                      }`}
                  >
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      value={inputs.username}
                      onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>

                  <div
                    className={`relative transform transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.02]' : ''
                      }`}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      value={inputs.password}
                      onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div
                    className={`relative transform transition-all duration-200 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''
                      }`}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      value={inputs.confirmPassword}
                      onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <div className="flex gap-4">
                      {['male', 'female'].map((gender) => (
                        <label
                          key={gender}
                          className="relative flex items-center justify-center group"
                        >
                          <input
                            type="radio"
                            className="peer sr-only"
                            name="gender"
                            value={gender}
                            checked={inputs.gender === gender}
                            onChange={(e) => setInputs({ ...inputs, gender: e.target.value })}
                          />
                          <div className="p-1.5 px-3 rounded-lg border-2 border-gray-200 cursor-pointer transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:bg-gray-50">
                            <span className="capitalize text-sm text-gray-600 peer-checked:text-indigo-600">
                              {gender}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 group cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={inputs.acceptTerms}
                        onChange={(e) => setInputs({ ...inputs, acceptTerms: e.target.checked })}
                        required
                      />
                      <div className="w-4 h-4 border-2 border-gray-200 rounded transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-500 group-hover:border-indigo-400">
                        <svg
                          className={`w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 stroke-white transition-all ${inputs.acceptTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                            }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-gray-900">
                      I accept the terms & conditions
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !inputs.acceptTerms}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-gray-500">or continue with google</span>
                  </div>
                </div>

                <GoogleButton
                  onSuccess={handleGoogleSignup}
                  mode="signup"
                />
                <p className="text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}