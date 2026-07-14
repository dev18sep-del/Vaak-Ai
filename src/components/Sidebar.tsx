import React from "react";
import { MessageSquarePlus, Compass, BarChart3, Settings, Moon, Sun, LogOut, ShieldAlert, Sparkles, ChevronLeft, Cpu } from "lucide-react";
import { VaakaiLogo } from "./VaakaiLogo";
import { ActiveTab, ChatSession, Language, SUPPORTED_LANGUAGES, User } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  user: User;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  language,
  setLanguage,
  isDark,
  setIsDark,
  user,
  onLogout,
  sidebarOpen,
  setSidebarOpen
}: SidebarProps) {
  
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <aside className={`shrink-0 border-r flex flex-col justify-between transition-all duration-300 ${
      sidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden border-none pointer-events-none"
    } ${
      isDark ? "bg-[#1E293B] border-slate-800/80 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
    }`} id="sidebar-container">
      
      {/* Top Brand Logo Panel */}
      <div className="p-4 border-b flex items-center justify-between border-slate-800/10 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <VaakaiLogo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-white uppercase">VAAKAI</h2>
            <p className="text-[10px] text-slate-400 font-mono">Real-time Support</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Dynamic active language flag button */}
          <div className="relative group">
            <button className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition ${
              isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
            }`} title="Select Conversational Language">
              <span>{currentLangObj.flag}</span>
              <span className="font-semibold text-[10px] uppercase">{currentLangObj.code}</span>
            </button>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 top-full mt-1.5 w-40 rounded-xl shadow-xl border p-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 ${
              isDark ? "bg-[#1E293B] border-slate-700/60 text-slate-200" : "bg-white border-slate-200 text-slate-700"
            }`}>
              <p className="text-[9px] font-bold tracking-wider uppercase text-slate-400 px-2 py-1 border-b border-slate-800/10 dark:border-slate-700/30">
                Change Language
              </p>
              {SUPPORTED_LANGUAGES.map((lang, idx) => (
                <button
                  key={`${lang.code}-${idx}`}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition cursor-pointer ${
                    language === lang.code ? (isDark ? "bg-slate-800 text-indigo-400 font-bold" : "bg-indigo-50 text-indigo-600 font-bold") : ""
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Collapse Sidebar button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-lg border cursor-pointer transition ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            title="Hide Sidebar"
            id="btn-collapse-sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Navigation Options */}
      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Prominent New Chat Button */}
        <button
          onClick={onNewSession}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold hover:bg-indigo-600/10 hover:border-indigo-500/50 hover:text-indigo-400 transition cursor-pointer bg-indigo-600/5 border-indigo-500/20 shadow-xs"
          id="btn-sidebar-prominent-new-chat"
        >
          <MessageSquarePlus className="w-4 h-4 text-indigo-400" />
          <span>New Chat Session</span>
        </button>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-2">Workspace</p>
          
          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "chat" 
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/5" 
                : `${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"} text-slate-400 border border-transparent`
            }`}
            id="tab-btn-chat"
          >
            <div className="flex items-center gap-2.5">
              <VaakaiLogo className="w-4 h-4" />
              <span>Vaakai Customer Chat</span>
            </div>
            <span className="bg-emerald-500/25 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">LIVE</span>
          </button>

          <button
            onClick={() => setActiveTab("discover")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "discover" 
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/5" 
                : `${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"} text-slate-400 border border-transparent`
            }`}
            id="tab-btn-discover"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "analytics" 
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/5" 
                : `${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"} text-slate-400 border border-transparent`
            }`}
            id="tab-btn-analytics"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Support Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "settings" 
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/5" 
                : `${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"} text-slate-400 border border-transparent`
            }`}
            id="tab-btn-settings"
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("devconsole")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "devconsole" 
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/5" 
                : `${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"} text-slate-400 border border-transparent`
            }`}
            id="tab-btn-devconsole"
          >
            <Cpu className="w-4 h-4" />
            <span>Dev Console</span>
          </button>
        </div>

        {/* Support Transmissions History / Sessions List */}
        <div className="flex flex-col h-56">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Transmissions</p>
            <button
              onClick={onNewSession}
              className={`p-1 rounded-md border text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer ${
                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-400" : "bg-white border-slate-200 hover:bg-slate-50 text-indigo-600"
              }`}
              title="Initiate New Support Chat Session"
              id="btn-new-chat"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>NEW</span>
            </button>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-[10px] text-slate-500">No previous sessions found.</p>
              </div>
            ) : (
              sessions.map((session, idx) => {
                const isSelected = activeSessionId === session.id;
                const feedbackRating = session.feedback?.rating;
                const firstUserMsg = session.messages.find(m => m.role === "user")?.text;
                const topic = firstUserMsg ? firstUserMsg : session.id.replace("session-", "SESS-");
                const lastMsg = session.messages[session.messages.length - 1]?.text || "New support channel";
                
                return (
                  <button
                    key={`${session.id}-${idx}`}
                    onClick={() => {
                      onSelectSession(session.id);
                      setActiveTab("chat");
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                      isSelected 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white" 
                        : `${isDark ? "bg-slate-950/60 border-slate-800/40 hover:bg-slate-800/40" : "bg-white border-slate-200 hover:bg-slate-100/50"} text-slate-400`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[120px]" title={topic}>
                        {topic}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {feedbackRating && (
                          <span className="text-[9px] px-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/20">
                            ★ {feedbackRating}
                          </span>
                        )}
                        <span className="text-[9px] font-mono opacity-65">
                          {new Date(session.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate leading-relaxed">
                      {lastMsg}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Section (Account Profile + Toggle Theme) */}
      <div className={`p-4 border-t space-y-3.5 ${isDark ? "bg-[#1E293B]/90 border-slate-800/60" : "bg-white border-slate-100"}`}>
        
        {/* Dark Mode toggle & Swagger docs link */}
        <div className="flex items-center justify-between gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer transition ${
              isDark ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
            title={isDark ? "Switch to Light Canvas" : "Switch to Dark Canvas"}
            id="toggle-dark-mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Swagger Endpoint Quick Link */}
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400 hover:from-indigo-500/30 hover:to-cyan-500/30 transition flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>OpenAPI Docs</span>
          </a>
        </div>

        {/* User Account Badge */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/10 dark:border-slate-800/40">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate text-slate-200">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`p-2 rounded-lg text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer`}
            title="Log Out of Session"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
