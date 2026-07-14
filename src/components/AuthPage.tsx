import React, { useState } from "react";
import { Shield, KeyRound, Mail, User, ArrowRight, Lock, Sparkles, Languages } from "lucide-react";
import { VaakaiLogo } from "./VaakaiLogo";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

interface AuthPageProps {
  onLoginSuccess: (token: string, user: { id: string; name: string; email: string }) => void;
  isDark: boolean;
}

export default function AuthPage({ onLoginSuccess, isDark }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("alex@company.com"); // Prepopulate default credentials for quick-access convenience
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // 2FA login state
  const [step2FA, setStep2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register.");
      }
      setMessage("Account registered successfully! You can now log in with your credentials.");
      setIsRegister(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }
      
      // Step into 2FA verification
      setStep2FA(true);
      if (data.debugOtpCode) {
        setDebugOtp(data.debugOtpCode);
      }
      setMessage("Step 1 Complete: Credentials verified. Please enter your 2FA OTP.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otpCode) {
      setError("Please enter the 6-digit 2FA code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid 2FA security code.");
      }

      // Fully logged in! Notify parent component
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (!auth) {
      setError(`Unable to connect. Firebase configuration is missing.`);
      return;
    }

    setLoading(true);
    setError("");
    setMessage(`Connecting to ${provider}...`);
    try {
      let authProvider;
      if (provider === 'Google') {
        authProvider = new GoogleAuthProvider();
      } else {
        authProvider = new OAuthProvider('apple.com');
      }

      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      const res = await fetch("/api/auth/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider,
          email: user.email,
          name: user.displayName,
          uid: user.uid
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to authenticate via backend`);
      }
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Authentication popup was closed or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isDark ? "bg-[#0F172A]" : "bg-slate-50"}`}>
      {/* Decorative ambient glowing grids */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 ${isDark ? "bg-indigo-600" : "bg-indigo-300"}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15 ${isDark ? "bg-cyan-600" : "bg-cyan-200"}`} />
      </div>

      <div className={`relative w-full max-w-md rounded-2xl border backdrop-blur-md p-8 shadow-2xl transition-all duration-300 ${
        isDark ? "bg-[#1E293B]/90 border-slate-800/80 text-slate-100" : "bg-white/90 border-slate-200 text-slate-800"
      }`}>
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white mb-3 shadow-lg shadow-indigo-500/20">
            <VaakaiLogo className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            VAAKAI
          </h1>
          <p className={`text-xs mt-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Vaakai Secure Customer Identity Manager
          </p>
        </div>

        {/* Error / Success feedback */}
        {error && (
          <div className="mb-6 p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2 animate-pulse" id="auth-error">
            <span className="font-bold text-red-500">Error:</span> {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-3 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-2" id="auth-msg">
            <span className="font-bold text-emerald-500">Status:</span> {message}
          </div>
        )}

        {!step2FA ? (
          <>
            {/* Tab selection */}
            <div className={`flex rounded-lg p-1 mb-6 text-sm font-medium ${isDark ? "bg-[#0F172A]" : "bg-slate-100"}`}>
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(""); setMessage(""); }}
                className={`flex-1 py-2 rounded-md transition-all ${
                  !isRegister 
                    ? (isDark ? "bg-[#1E293B] text-white shadow" : "bg-white text-slate-900 shadow") 
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="tab-signin"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(""); setMessage(""); }}
                className={`flex-1 py-2 rounded-md transition-all ${
                  isRegister 
                    ? (isDark ? "bg-[#1E293B] text-white shadow" : "bg-white text-slate-900 shadow") 
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="tab-register"
              >
                Create Account
              </button>
            </div>

            {/* Standard Sign In Form */}
            {!isRegister ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4" id="signin-form">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-all ${
                        isDark 
                          ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                          : "bg-white border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                      }`}
                      id="email-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-all ${
                        isDark 
                          ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                          : "bg-white border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                      }`}
                      id="password-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-login-submit"
                >
                  {loading ? "Verifying Credentials..." : "Request 2FA Code"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Create Account Form */
              <form onSubmit={handleRegister} className="space-y-4" id="register-form">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Sterling"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-all ${
                        isDark 
                          ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                          : "bg-white border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                      }`}
                      id="name-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-all ${
                        isDark 
                          ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                          : "bg-white border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                      }`}
                      id="register-email-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Choose Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-all ${
                        isDark 
                          ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                          : "bg-white border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                      }`}
                      id="register-password-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-register-submit"
                >
                  {loading ? "Registering Account..." : "Create Free Account"}
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Social Login Separator */}
            <div className="mt-6 flex items-center justify-between">
              <span className={`w-1/5 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}></span>
              <span className={`text-xs uppercase font-semibold tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Or continue with</span>
              <span className={`w-1/5 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}></span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className={`w-full py-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#0F172A] border-slate-700/80 hover:bg-slate-800 text-white"
                    : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                disabled={loading}
                className={`w-full py-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#0F172A] border-slate-700/80 hover:bg-slate-800 text-white"
                    : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                Apple
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Two-Factor Authentication Input screen */
          <form onSubmit={handleVerify2FA} className="space-y-6" id="2fa-form">
            <div className="text-center">
              <div className="inline-flex p-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2">
                <Lock className="w-5 h-5 animate-bounce" />
              </div>
              <h2 className="text-lg font-bold">2-Step Verification</h2>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Please enter the secure 6-digit verification code.
              </p>
            </div>

            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`w-full py-3 rounded-xl text-center text-2xl font-bold tracking-widest border focus:outline-none focus:ring-1 transition-all ${
                  isDark 
                    ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                    : "bg-white border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                }`}
                id="otp-input"
                required
                autoFocus
              />
            </div>

            {/* Simulated 2FA notice - beautiful helper card displaying the code dynamically */}
            {debugOtp && (
              <div className="p-3.5 rounded-lg border text-xs leading-relaxed bg-[#1E293B]/60 border-indigo-500/30 text-indigo-300" id="otp-debug-panel">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2FA Security Simulator</span>
                </div>
                Your temporary security OTP is <span className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded border border-white/10 text-sm font-bold tracking-widest select-all">{debugOtp}</span>.
                In a production system, this is dispatched securely via workspace TOTP/email tokens.
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setStep2FA(false); setOtpCode(""); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  isDark 
                    ? "bg-[#0F172A] border-slate-800/80 hover:bg-slate-800 text-slate-300" 
                    : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
                }`}
                id="btn-2fa-back"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                id="btn-2fa-verify"
              >
                {loading ? "Verifying..." : "Verify Identity"}
              </button>
            </div>
          </form>
        )}

        {/* Demo Credentials Hint */}
        {!step2FA && (
          <div className={`mt-8 text-center text-xs p-3 rounded-lg border ${
            isDark ? "bg-[#0F172A]/40 border-slate-800/60 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            <span className="font-semibold">Demo Login:</span> alex@company.com / password123
          </div>
        )}

      </div>
    </div>
  );
}
