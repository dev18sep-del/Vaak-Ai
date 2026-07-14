import React, { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import DiscoverView from "./components/DiscoverView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import DevConsoleView from "./components/DevConsoleView";
import { ActiveTab, ChatSession, User } from "./types";
import { Sparkles, MessageSquare, ShieldAlert, Cpu, ChevronRight, MessageSquarePlus } from "lucide-react";

export default function App() {
  // Global Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem("vaakai_token"));
  const [user, setUser] = useState<User | null>(null);
  
  // App navigation & Theme states
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("en");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Chat Sessions histories state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Validate active login session on mount
  useEffect(() => {
    if (token) {
      fetch("/api/session", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Stale session.");
          }
          const userData = await res.json();
          setUser(userData);
          fetchSessions(token);
        })
        .catch(() => {
          // Token is stale or invalid, clean up local cache
          handleLogout();
        });
    }
  }, [token]);

  // Load session histories from Express server
  const fetchSessions = async (authToken: string) => {
    setSessionLoading(true);
    try {
      const res = await fetch("/api/chat/history", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const histories = await res.json();
        setSessions(histories);
        if (histories.length > 0 && !activeSessionId) {
          // Default to most recent session
          setActiveSessionId(histories[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load active transmissions list:", err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    localStorage.setItem("vaakai_token", newToken);
    setToken(newToken);
    setUser(loggedUser);
    fetchSessions(newToken);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem("vaakai_token");
    setToken(null);
    setUser(null);
    setSessions([]);
    setActiveSessionId(null);
  };

  // Callback to synchronize modified session data inside our local arrays
  const handleSessionUpdated = (updatedSession: ChatSession) => {
    setSessions((prevSessions) => {
      // Clean up temporary sessions to avoid visual duplicates in sidebar
      const cleaned = prevSessions.filter((s) => s.id !== "temp-session");
      const exists = cleaned.some((s) => s.id === updatedSession.id);
      if (exists) {
        return cleaned.map((s) => (s.id === updatedSession.id ? updatedSession : s));
      } else {
        // Prepend new session
        return [updatedSession, ...cleaned];
      }
    });
    setActiveSessionId(updatedSession.id);
  };

  // Clear current active session pointer to prepare for a fresh support chat
  const handleNewSession = () => {
    setActiveSessionId(null);
    setActiveTab("chat");
  };

  // Find the selected session object from active list
  const activeSessionObj = sessions.find((s) => s.id === activeSessionId) || null;

  // Toggle visual theme states on HTML body element for global styled inputs
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // If unauthorized, redirect immediately to secure login
  if (!token || !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} isDark={isDark} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-[#0F172A] text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        setIsDark={setIsDark}
        user={user}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Vertical toggle bar when collapsed */}
      {!sidebarOpen && (
        <div className={`w-14 shrink-0 border-r flex flex-col items-center py-4 transition-all duration-300 ${
          isDark ? "bg-[#1E293B] border-slate-800/80 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
        }`}>
          {/* Expand Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-xl border shadow-md hover:scale-105 transition duration-200 cursor-pointer ${
              isDark 
                ? "bg-[#0F172A] border-slate-700/80 text-indigo-400 hover:bg-slate-800 hover:text-white" 
                : "bg-white border-slate-300 text-indigo-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title="Show Sidebar"
            id="btn-expand-sidebar-rail"
          >
            <ChevronRight className="w-4 h-4 animate-pulse" />
          </button>
          
          {/* Quick New Session Button */}
          <button
            onClick={handleNewSession}
            className={`mt-4 p-2 rounded-xl border shadow-xs hover:scale-105 transition duration-200 cursor-pointer ${
              isDark 
                ? "bg-[#0F172A] border-slate-700/80 text-indigo-400 hover:bg-slate-800 hover:text-white" 
                : "bg-white border-slate-300 text-indigo-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title="Start New Chat"
            id="btn-new-chat-rail"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Render Tab Views dynamically based on active selected nav state */}
        {activeTab === "chat" && (
          <ChatView
            token={token}
            activeSession={activeSessionObj}
            onSessionUpdated={handleSessionUpdated}
            language={language}
            isDark={isDark}
            user={user}
          />
        )}

        {activeTab === "discover" && (
          <DiscoverView
            onSelectPrompt={(promptText) => {
              // Trigger a new support session with the selected template prompt pre-filled and sent!
              handleNewSession();
              // Give the state a tiny delay to reset properly
              setTimeout(() => {
                const chatInput = document.getElementById("chat-message-input") as HTMLInputElement;
                if (chatInput) {
                  chatInput.value = promptText;
                  // Dispatch enter key press or focus
                  chatInput.focus();
                }
              }, 50);
            }}
            isDark={isDark}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            token={token}
            isDark={isDark}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            user={user}
            isDark={isDark}
            setIsDark={setIsDark}
            language={language}
          />
        )}

        {activeTab === "devconsole" && (
          <DevConsoleView
            token={token}
            isDark={isDark}
            user={user}
          />
        )}

      </main>
    </div>
  );
}
