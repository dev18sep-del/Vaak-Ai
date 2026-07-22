import React, { useState } from "react";
import { VaakaiLogo } from "./VaakaiLogo";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getIdToken } from "firebase/auth";

export interface AuthPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  isDark?: boolean;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const handleAuthResult = async (userCredential: any) => {
    const user = userCredential.user;
    const token = await getIdToken(user);
    onLoginSuccess(token, {
      id: user.uid,
      name: user.displayName || name || user.email?.split("@")[0] || "User",
      email: user.email
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await handleAuthResult(userCredential);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthResult(userCredential);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: string) => {
    if (providerName !== 'Google') {
      setError(`${providerName} login is not configured in this demo environment.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await handleAuthResult(userCredential);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

          {isRegistering ? (
            <form onSubmit={handleRegisterSubmit} className="relative z-10 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
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
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500 font-semibold">
                  Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-blue-600 hover:text-blue-800 transition-colors">Sign In</button>
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
                {loading ? "Initializing..." : "Initialize Session"}
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
                <button onClick={() => handleSocialLogin('Apple')} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-white/50 border border-white/60 hover:bg-white/70 transition-colors text-slate-700 text-sm shadow-sm opacity-50 cursor-not-allowed">
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
          )}
        </div>
      </main>
    </div>
  );
}
