import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { apiClient, DEFAULT_PRODUCTION_API } from "../services/apiClient";
import {
  SECURITY_QUESTIONS,
  validateSecurityQuestionsSelection,
  validatePasswordResetInput,
} from "../utils/securityQuestions";

type AuthViewMode = "login" | "reset" | "setup-questions" | "first-time-setup";

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthViewMode>("login");
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend status state
  const [initialized, setInitialized] = useState(true);
  const [securityQuestionsConfigured, setSecurityQuestionsConfigured] = useState(false);
  const [configuredQuestions, setConfiguredQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([
    ...SECURITY_QUESTIONS,
  ]);

  // Security questions selection (Pick 2 of 5)
  const [question1, setQuestion1] = useState<string>(SECURITY_QUESTIONS[0]);
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState<string>(SECURITY_QUESTIONS[1]);
  const [answer2, setAnswer2] = useState("");
  const [currentPasswordForSetup, setCurrentPasswordForSetup] = useState("");

  // Password reset via 2 security questions
  const [resetAnswer1, setResetAnswer1] = useState("");
  const [resetAnswer2, setResetAnswer2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const navigate = useNavigate();

  const refreshAuthStatus = async () => {
    try {
      const status = await apiClient.getAuthStatus();
      if (status?.success) {
        setInitialized(status.initialized);
        if (status.masterUsername) {
          setUsername(status.masterUsername);
        }
        setSecurityQuestionsConfigured(status.securityQuestionsConfigured);
        setConfiguredQuestions(status.configuredQuestions || []);
        if (
          Array.isArray(status.availableQuestions) &&
          status.availableQuestions.length === 5
        ) {
          setAvailableQuestions(status.availableQuestions);
        }
        if (!status.initialized) {
          setMode("first-time-setup");
        }
      }
    } catch {
      // Keep default login view if status check is still warming up
    }
  };

  useEffect(() => {
    refreshAuthStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");
    setLoading(true);

    const cleanUsername = username.trim();

    try {
      const result = await apiClient.login(cleanUsername, password);
      if (result?.success && result?.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem(
          "auth_user",
          JSON.stringify(result.user || { username: cleanUsername })
        );
        navigate("/");
      } else {
        setError(result?.error || "Authentication failed.");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (
        err.code === "ERR_NETWORK" ||
        err.message?.includes("Network Error")
      ) {
        setError(
          `Cannot reach production backend (${DEFAULT_PRODUCTION_API}). Please wait a moment and try again.`
        );
      } else {
        setError(err.message || "Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");

    const qValidation = validateSecurityQuestionsSelection({
      question1,
      answer1,
      question2,
      answer2,
    });
    if (!qValidation.valid) {
      setError(qValidation.error || "Invalid security questions selection.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.register(username.trim(), password, {
        question1,
        answer1,
        question2,
        answer2,
      });
      if (res?.success && res?.token) {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem(
          "auth_user",
          JSON.stringify(res.user || { username: username.trim() })
        );
        navigate("/");
      } else {
        setError(res?.error || "Failed to initialize master account.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to initialize master account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurityQuestionsFromLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");

    const validation = validateSecurityQuestionsSelection({
      question1,
      answer1,
      question2,
      answer2,
    });
    if (!validation.valid) {
      setError(validation.error || "Please check your security questions.");
      return;
    }

    if (!currentPasswordForSetup) {
      setError("Please enter your current master password to save your 2 security questions.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.saveSecurityQuestions({
        username: username.trim(),
        currentPassword: currentPasswordForSetup,
        question1,
        answer1,
        question2,
        answer2,
      });
      if (res?.success) {
        setSecurityQuestionsConfigured(true);
        setConfiguredQuestions(res.configuredQuestions || [question1, question2]);
        setAnswer1("");
        setAnswer2("");
        setCurrentPasswordForSetup("");
        setSuccessNotice(
          "2 Security Questions saved! You can now reset your password anytime by answering these 2 questions."
        );
        setMode("reset");
      } else {
        setError(res?.error || "Could not save security questions.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Could not save security questions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");

    const validation = validatePasswordResetInput({
      username,
      answer1: resetAnswer1,
      answer2: resetAnswer2,
      newPassword,
      confirmPassword: confirmNewPassword,
    });

    if (!validation.valid) {
      setError(validation.error || "Please check your reset details.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.resetPasswordWithQuestions({
        username: username.trim(),
        answer1: resetAnswer1,
        answer2: resetAnswer2,
        newPassword,
      });

      if (res?.success && res?.token) {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem(
          "auth_user",
          JSON.stringify(res.user || { username: username.trim() })
        );
        navigate("/");
      } else {
        setError(res?.error || "Password reset failed.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Incorrect security question answers. Password reset denied."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden relative px-4 py-8">
      {/* Chromatic Refraction Backdrop Orbs */}
      <div className="absolute top-[15%] left-[18%] w-80 h-80 bg-amber-300/50 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute top-[25%] right-[18%] w-80 h-80 bg-rose-400/45 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[18%] left-[35%] w-80 h-80 bg-cyan-400/45 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg p-7 sm:p-10 liquid-glass rounded-[2.25rem] relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-3xl liquid-glass-droplet p-2 flex items-center justify-center mb-3.5">
            <img
              src="/favicon.svg"
              alt="Device Manager Logo"
              className="w-16 h-16 rounded-2xl drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight text-center">
            Device Manager
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full liquid-glass-droplet mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
              {mode === "login"
                ? "Master Account Sign In"
                : mode === "reset"
                ? "2-Question Security Password Reset"
                : mode === "setup-questions"
                ? "Configure 2 of 5 Security Questions"
                : "1st-Time Master Account Setup"}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-400/60 text-red-950 text-xs sm:text-sm font-bold text-center backdrop-blur-md"
          >
            {error}
          </div>
        )}

        {successNotice && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/60 text-emerald-950 text-xs sm:text-sm font-bold text-center backdrop-blur-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* MODE 1: SIGN IN */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-700 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.3] z-10 pointer-events-none" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-full liquid-glass-input pl-11 pr-4 py-3.5 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Enter master username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-700 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.3] z-10 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full liquid-glass-input pl-11 pr-4 py-3.5 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-full liquid-glass-droplet text-slate-950 font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <span>
                {loading ? "Signing In..." : "Sign In to Dashboard"}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.6]" />
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-white/50 text-xs">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-slate-900 font-extrabold hover:text-slate-950 underline underline-offset-4"
                onClick={() => {
                  setError("");
                  setSuccessNotice("");
                  if (securityQuestionsConfigured) {
                    setMode("reset");
                  } else {
                    setMode("setup-questions");
                  }
                }}
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Forgot Password? Reset via Security Questions</span>
              </button>

              {!securityQuestionsConfigured && initialized && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-slate-700 font-bold hover:text-slate-950"
                  onClick={() => {
                    setError("");
                    setSuccessNotice("");
                    setMode("setup-questions");
                  }}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Set 2 Security Questions</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* MODE 2: PASSWORD RESET VIA 2 CHOSEN SECURITY QUESTIONS */}
        {mode === "reset" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/45 border border-white/70 text-xs text-slate-800 font-semibold">
              Answer your <strong>2 chosen security questions</strong> below to verify your identity and set a new master password.
            </div>

            {!securityQuestionsConfigured || configuredQuestions.length < 2 ? (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  You have not selected your 2 security questions from the 5-question pool yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("setup-questions");
                  }}
                  className="w-full py-3 px-5 rounded-full liquid-glass-droplet text-slate-950 font-black text-xs sm:text-sm"
                >
                  Select 2 of 5 Security Questions Now
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label
                    htmlFor="reset-username"
                    className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
                  >
                    Master Username
                  </label>
                  <input
                    id="reset-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-full liquid-glass-input px-4 py-3 text-slate-950 font-semibold text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reset-answer-1"
                    className="block text-xs font-extrabold text-slate-900 pl-2"
                  >
                    Q1: {configuredQuestions[0]}
                  </label>
                  <input
                    id="reset-answer-1"
                    type="text"
                    value={resetAnswer1}
                    onChange={(e) => setResetAnswer1(e.target.value)}
                    className="w-full rounded-full liquid-glass-input px-4 py-3 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none"
                    placeholder="Enter Answer 1"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reset-answer-2"
                    className="block text-xs font-extrabold text-slate-900 pl-2"
                  >
                    Q2: {configuredQuestions[1]}
                  </label>
                  <input
                    id="reset-answer-2"
                    type="text"
                    value={resetAnswer2}
                    onChange={(e) => setResetAnswer2(e.target.value)}
                    className="w-full rounded-full liquid-glass-input px-4 py-3 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none"
                    placeholder="Enter Answer 2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="reset-new-password"
                      className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
                    >
                      New Password
                    </label>
                    <input
                      id="reset-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-full liquid-glass-input px-4 py-3 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none"
                      placeholder="New password"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="reset-confirm-password"
                      className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="reset-confirm-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-full liquid-glass-input px-4 py-3 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-full liquid-glass-droplet text-slate-950 font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? "Verifying Security Answers..."
                      : "Verify Answers & Reset Password"}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.6]" />
                </button>
              </>
            )}

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessNotice("");
                  setMode("login");
                }}
                className="inline-flex items-center gap-1 text-slate-800 font-extrabold hover:text-slate-950"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessNotice("");
                  setMode("setup-questions");
                }}
                className="text-slate-700 font-bold hover:text-slate-950 underline underline-offset-4"
              >
                Update Security Questions
              </button>
            </div>
          </form>
        )}

        {/* MODE 3: CONFIGURE 2 OF 5 SECURITY QUESTIONS */}
        {mode === "setup-questions" && (
          <form onSubmit={handleSaveSecurityQuestionsFromLogin} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/45 border border-white/70 text-xs text-slate-800 font-semibold">
              Select <strong>any 2 questions</strong> from the 5 security questions below and save your answers. You will use these 2 questions whenever you need to reset your password.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="setup-username"
                  className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
                >
                  Master Username
                </label>
                <input
                  id="setup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="setup-current-password"
                  className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
                >
                  Current Password
                </label>
                <input
                  id="setup-current-password"
                  type="password"
                  value={currentPasswordForSetup}
                  onChange={(e) => setCurrentPasswordForSetup(e.target.value)}
                  className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none"
                  placeholder="Verify current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="setup-q1"
                className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
              >
                Security Question 1 (Select from 5)
              </label>
              <select
                id="setup-q1"
                value={question1}
                onChange={(e) => setQuestion1(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
              >
                {availableQuestions.map((q) => (
                  <option key={`q1-${q}`} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                id="setup-a1"
                type="text"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none mt-1.5"
                placeholder="Enter your answer for Question 1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="setup-q2"
                className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2"
              >
                Security Question 2 (Select from 5)
              </label>
              <select
                id="setup-q2"
                value={question2}
                onChange={(e) => setQuestion2(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
              >
                {availableQuestions.map((q) => (
                  <option key={`q2-${q}`} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                id="setup-a2"
                type="text"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none mt-1.5"
                placeholder="Enter your answer for Question 2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-full liquid-glass-droplet text-slate-950 font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Saving Security Questions..."
                  : "Save 2 Security Questions"}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.6]" />
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessNotice("");
                  setMode("login");
                }}
                className="inline-flex items-center gap-1 text-slate-800 font-extrabold hover:text-slate-950"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              {securityQuestionsConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("reset");
                  }}
                  className="text-slate-800 font-bold hover:text-slate-950 underline underline-offset-4"
                >
                  Proceed to Password Reset
                </button>
              )}
            </div>
          </form>
        )}

        {/* MODE 4: 1ST-TIME MASTER SETUP (ONLY IF DB HAS 0 USERS) */}
        {mode === "first-time-setup" && (
          <form onSubmit={handleFirstTimeSetup} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/45 border border-white/70 text-xs text-slate-800 font-semibold">
              First-time setup: Create your Master Account and select <strong>2 of the 5 security questions</strong> for future password recovery.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2 mb-1">
                  Master Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2">
                Security Question 1 (Select from 5)
              </label>
              <select
                value={question1}
                onChange={(e) => setQuestion1(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-bold text-xs sm:text-sm"
              >
                {availableQuestions.map((q) => (
                  <option key={`ft-q1-${q}`} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-xs sm:text-sm mt-1.5"
                placeholder="Answer for Question 1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2">
                Security Question 2 (Select from 5)
              </label>
              <select
                value={question2}
                onChange={(e) => setQuestion2(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-bold text-xs sm:text-sm"
              >
                {availableQuestions.map((q) => (
                  <option key={`ft-q2-${q}`} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                className="w-full rounded-full liquid-glass-input px-4 py-2.5 text-slate-950 font-semibold text-xs sm:text-sm mt-1.5"
                placeholder="Answer for Question 2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-full liquid-glass-droplet text-slate-950 font-black text-sm"
            >
              <span>
                {loading
                  ? "Creating Master Account..."
                  : "Create Master Account & Save Questions"}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.6]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
