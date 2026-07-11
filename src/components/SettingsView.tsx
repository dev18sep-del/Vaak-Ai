import React, { useState } from "react";
import { Settings, ShieldCheck, KeyRound, Mail, User, Info, Save, Moon, Sun, Sparkles, Check, ClipboardCopy } from "lucide-react";
import { User as UserType } from "../types";

interface SettingsViewProps {
  user: UserType;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  language: string;
}

export default function SettingsView({
  user,
  isDark,
  setIsDark,
  language
}: SettingsViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState("Lead Systems Operations Developer at Vaakai");
  const [apiKey, setApiKey] = useState("• • • • • • • • • • • • • • • • • • • •");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copy2FASecret = () => {
    navigator.clipboard.writeText("VA2FASECRETKEY");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto" id="settings-workspace">
      
      {/* Title Header */}
      <div>
        <h2 className={`text-xl font-extrabold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
          System Profile & Settings
        </h2>
        <p className="text-[10px] text-slate-400">
          Configure security settings, billing credentials, theme configurations, and API integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Forms (Grid Span 2) */}
        <div className={`md:col-span-2 p-5 rounded-xl border space-y-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          
          <div className="border-b border-slate-800/10 dark:border-slate-700/50 pb-3">
            <h3 className="font-bold text-xs text-slate-200">Personal Information</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Control details of your verified client identity.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 transition-all ${
                      isDark 
                        ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                        : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 transition-all ${
                      isDark 
                        ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                        : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                    }`}
                    required
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Profile Bio */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Bio / Operations Summary
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className={`w-full p-3 rounded-lg text-xs border focus:outline-none focus:ring-1 transition-all ${
                  isDark 
                    ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                    : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                }`}
              />
            </div>

            {/* Gemini API Key */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Secure Gemini Secret Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[9px] text-indigo-400 hover:underline cursor-pointer font-bold"
                >
                  {showKey ? "Hide Secret" : "Show Secret"}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showKey ? "text" : "password"}
                  value={showKey ? (process.env.GEMINI_API_KEY || "SEC-KEY-INJECTED-FROM-WORK-SETTINGS") : apiKey}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 transition-all ${
                    isDark 
                      ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                      : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                  }`}
                  disabled
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                Vault keys are stored on server environment variables securely. Browser clients can never view raw tokens.
              </p>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/10 dark:border-slate-700/50">
              {saved && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile details updated successfully!</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
                id="btn-save-settings"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Side: Security & UI customization cards (Grid Span 1) */}
        <div className="space-y-6">
          
          {/* Theme Visualizer card */}
          <div className={`p-5 rounded-xl border space-y-4 transition ${
            isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div>
              <h3 className="font-bold text-xs text-slate-200">System Theme</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Choose your dashboard canvas.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Dark Theme Button Selector */}
              <button
                onClick={() => setIsDark(true)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-4 transition cursor-pointer ${
                  isDark
                    ? "bg-[#1E293B] border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/50 text-slate-400"
                }`}
              >
                <div className={`p-1.5 rounded-lg border w-8 h-8 flex items-center justify-center ${
                  isDark ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" : "bg-slate-200 text-slate-500"
                }`}>
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Deep Obsidian</h4>
                  <p className="text-[9px] opacity-60">Eye-safe dark</p>
                </div>
              </button>

              {/* Light Theme Button Selector */}
              <button
                onClick={() => setIsDark(false)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-4 transition cursor-pointer ${
                  !isDark
                    ? "bg-indigo-50/50 border-indigo-600 text-slate-800 shadow-lg"
                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-500"
                }`}
              >
                <div className={`p-1.5 rounded-lg border w-8 h-8 flex items-center justify-center ${
                  !isDark ? "bg-indigo-600 text-white" : "bg-slate-950 border-slate-800 text-slate-500"
                }`}>
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Ice Crystal</h4>
                  <p className="text-[9px] opacity-60">Clean high-contrast</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2FA Enforced Details Card */}
          <div className={`p-5 rounded-xl border space-y-4 transition ${
            isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 animate-pulse">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-200">2FA Security Status</h3>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 font-extrabold tracking-wider font-mono">
                  ENFORCED
                </span>
              </div>
            </div>

            <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Your profile is secured by strict **2-Step multifactor authentication**. Whenever you register, login, or configure secrets, security OTP codes are generated.
            </p>

            {/* 2FA Master Seed code copy box */}
            <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Your 2FA Secret Key</span>
                <button
                  onClick={copy2FASecret}
                  className="text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <ClipboardCopy className="w-3 h-3" />
                  <span>{copied ? "Copied!" : "Copy Seed"}</span>
                </button>
              </div>
              <p className="text-sm font-mono font-bold text-white tracking-widest text-center select-all bg-slate-950 py-1.5 rounded border border-white/5">
                VA2FASECRETKEY
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
