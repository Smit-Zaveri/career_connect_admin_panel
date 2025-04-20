import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CounselorLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Login specifically as a counselor
      await login(email, password, "counselor", true);

      // The redirect is now handled in AuthContext
      toast.success("Login successful! Welcome back.");
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Counselor Portal
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Sign in to manage your counseling sessions and appointments
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="rounded-md bg-error-50 p-4 dark:bg-error-900/30">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-error-400 dark:text-error-300"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-error-700 dark:text-error-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 sm:text-sm"
                  placeholder="smitzaveri123@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2 pr-10 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Not a counselor?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Login as admin
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          By signing in, you agree to our{" "}
          <a
            href="#terms"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#privacy"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Privacy Policy
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default CounselorLogin;
