import React, { useState } from "react";
import { VaakaiLogo } from "./VaakaiLogo";

export interface AuthPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  isDark?: boolean;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState("alex@company.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // 2FA login state
  const [step2FA, setStep2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [debugOtp, setDebugOtp] = useState("");

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      setMessage("Registration successful. Please log in.");
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      setStep2FA(true);
      if (data.debugOtpCode) {
        setDebugOtp(data.debugOtpCode);
      }
      setMessage("Step 1 Complete: Credentials verified.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessage("If an account exists, a reset link was sent.");
      setIsForgotPassword(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError(`${provider} login is not configured in this demo environment.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-body-md text-surface p-4 md:p-10" style={{ background: "linear-gradient(135deg, #e0dcf4 0%, #d4e4f7 50%, #dcf0e7 100%)" }}>
      <main className="w-full max-w-md">
        <div className="rounded-[8px] p-8 md:p-12 relative overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.2)" }}>
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-4 shadow-sm text-white">
               <VaakaiLogo className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Vaakai</h1>
            <p className="text-base text-slate-500 mt-2 text-center">Enter your credentials to access the workspace.</p>
          </div>

          {error && (
            <div className="relative z-10 mb-6 p-3 rounded text-sm bg-red-100 text-red-600 border border-red-200 flex items-start gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
          {message && (
            <div className="relative z-10 mb-6 p-3 rounded text-sm bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-start gap-2">
              <span className="font-semibold">Status:</span> {message}
            </div>
          )}

          {!step2FA ? (
            isForgotPassword ? (
              <form onSubmit={handleForgotPasswordSubmit} className="relative z-10 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full rounded-[8px] px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[8px] px-4 py-3.5 text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm mt-6"
                  style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <div className="mt-6 text-center">
                  <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : isRegistering ? (
              <form onSubmit={handleRegisterSubmit} className="relative z-10 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Sterling"
                    required
                    className="w-full rounded-[8px] px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full rounded-[8px] px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-[8px] px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[8px] px-4 py-3.5 text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm mt-6"
                  style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 font-semibold">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setIsRegistering(false)} className="text-blue-600 hover:text-blue-800 transition-colors">
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="relative z-10 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full rounded-[8px] px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setError(""); setMessage(""); }} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-[8px] px-4 py-3 text-slate-800 placeholder-slate-400 transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[8px] px-4 py-3.5 text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm mt-6"
                  style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }}
                >
                  {loading ? "Initializing..." : "Initialize Session"}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>

                <div className="relative z-10 mt-8 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 text-slate-500 text-xs font-semibold" style={{ background: "transparent" }}>Or continue with</span>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4">
                  <button onClick={() => handleSocialLogin('Google')} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-white/50 border border-white/60 hover:bg-white/70 transition-colors text-slate-700 text-sm shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button onClick={() => handleSocialLogin('Apple')} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-white/50 border border-white/60 hover:bg-white/70 transition-colors text-slate-700 text-sm shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-1.15 2.14-.39 3.96.48 4.97 1.83-4.14 2.22-3.3 7.82 1.05 9.4-1.11 2.76-3.14 3.63-4.6 2.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                  </button>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-xs text-slate-500 font-semibold">
                    Don't have an account? <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-600 hover:text-blue-800 transition-colors">Create Account</button>
                  </p>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleVerify2FA} className="relative z-10 space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800">2-Step Verification</h2>
                <p className="text-xs mt-1 text-slate-500">
                  Please enter the secure 6-digit verification code.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-center text-slate-600">
                  OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="w-full py-3 rounded-xl text-center text-2xl font-bold tracking-widest border focus:outline-none transition-all"
                  style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}
                />
              </div>
              
              {debugOtp && (
                <div className="p-3.5 rounded-lg border text-xs leading-relaxed bg-white/50 border-indigo-200 text-indigo-700">
                  <div className="font-bold mb-1">2FA Security Simulator</div>
                  Your temporary OTP is <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100 font-bold">{debugOtp}</span>.
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep2FA(false); setOtpCode(""); setError(""); }}
                  className="flex-1 py-3 rounded-[8px] text-xs font-semibold border transition-all bg-white/50 border-white/60 hover:bg-white/70 text-slate-700"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-[8px] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }}
                >
                  {loading ? "Verifying..." : "Verify Identity"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
