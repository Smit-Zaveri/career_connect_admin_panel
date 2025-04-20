import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (showTwoFactor) {
        // In a real app, you would validate the 2FA code here
        // For this demo, we'll just simulate success after a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setShowTwoFactor(false);
      } else {
        // The login function will automatically detect user type and redirect accordingly
        await login(data.email, data.password, undefined, data.rememberMe);
        // No need to navigate here, the AuthContext will handle redirection
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorRequest = () => {
    // In a real app, this would send a 2FA code to the user
    setShowTwoFactor(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-900 sm:px-6 lg:px-8">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <motion.div
            className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <ShieldCheck className="h-6 w-6" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <motion.div
            className="rounded-md bg-error-50 p-4 dark:bg-error-900/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-error-400 dark:text-error-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-error-800 dark:text-error-200">
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <motion.div
            className="space-y-4 rounded-md shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {showTwoFactor ? (
              <div>
                <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <div className="relative">
                    <input
                      id="twoFactorCode"
                      {...register("twoFactorCode", {
                        required: "Verification code is required",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Code must be 6 digits",
                        },
                      })}
                      type="text"
                      autoComplete="one-time-code"
                      className="block w-full rounded-md border-neutral-300 py-3 pl-3 pr-10 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  {errors.twoFactorCode && (
                    <p className="mt-2 text-sm text-error-600 dark:text-error-400">
                      {errors.twoFactorCode.message}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Enter the 6-digit code sent to your device
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                      </div>
                      <input
                        id="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-neutral-300 py-3 pl-10 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-error-600 dark:text-error-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                      </div>
                      <input
                        id="password"
                        {...register("password", {
                          required: "Password is required",
                        })}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="block w-full rounded-md border-neutral-300 py-3 pl-10 pr-10 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-error-600 dark:text-error-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {!showTwoFactor && (
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  {...register("rememberMe")}
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800"
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
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot your password?
                </a>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {showTwoFactor ? (
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-3 text-sm font-medium text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-3 text-sm font-medium text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={handleTwoFactorRequest}
                  className="group relative flex w-full justify-center rounded-md border border-neutral-300 bg-white py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Use two-factor authentication
                </button>
              </div>
            )}
          </motion.div>
        </form>

        <motion.div
          className="mt-6 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <p>Demo credentials:</p>
            <p className="mt-1">
              <span className="font-semibold">Admin:</span> admin@example.com /
              admin123
            </p>
            <p>
              <span className="font-semibold">Counselor:</span>{" "}
              smitzaveri123@gmail.com / smit5364
            </p>
            <p className="mt-2">
              Note: The system automatically detects if you're an admin or a
              counselor
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
