import React, { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import DiscoverView from "./components/DiscoverView";
import TemplatesView from "./components/TemplatesView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import DevConsoleView from "./components/DevConsoleView";
import HistorySidebar from "./components/HistorySidebar";
import { ActiveTab, ChatSession, User } from "./types";
import { Sparkles, MessageSquare, ShieldAlert, Cpu, ChevronRight, MessageSquarePlus } from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("vaakai_token"));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(288);

  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;
    const handleMouseMove = (e: MouseEvent) => {
      setLeftSidebarWidth(Math.max(200, Math.min(startWidth + (e.clientX - startX), 400)));
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightSidebarWidth;
    const handleMouseMove = (e: MouseEvent) => {
      setRightSidebarWidth(Math.max(200, Math.min(startWidth - (e.clientX - startX), 400)));
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetch("/api/session", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Stale session.");
          const userData = await res.json();
          setUser(userData);
          fetchSessions(token);
        })
        .catch(() => handleLogout());
    }
  }, [token]);

  const fetchSessions = async (authToken: string) => {
    setSessionLoading(true);
    try {
      const res = await fetch("/api/chat/history", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const histories = await res.json();
        setSessions(histories);
        if (histories.length > 0 && !activeSessionId) setActiveSessionId(histories[0].id);
      }
    } catch (err) {} finally { setSessionLoading(false); }
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
    try {
      const { auth } = await import("./lib/firebase");
      await auth.signOut();
    } catch (e) {}
    localStorage.removeItem("vaakai_token");
    setToken(null);
    setUser(null);
    setSessions([]);
    setActiveSessionId(null);
  };

  const handleSessionUpdated = (updatedSession: ChatSession) => {
    setSessions((prevSessions) => {
      const cleaned = prevSessions.filter((s) => s.id !== "temp-session");
      const exists = cleaned.some((s) => s.id === updatedSession.id);
      if (exists) {
        return cleaned.map((s) => (s.id === updatedSession.id ? updatedSession : s));
      } else {
        return [updatedSession, ...cleaned];
      }
    });
    setActiveSessionId(updatedSession.id);
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setActiveTab("chat");
  };

  const activeSessionObj = sessions.find((s) => s.id === activeSessionId) || null;

  if (!token || !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} isDark={isDark} />;
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 custom-gradient-bg">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onNewSession={handleNewSession}
        width={leftSidebarWidth}
      />
      <div 
        className="w-1 cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors z-10" 
        onMouseDown={handleLeftMouseDown}
      />

      <main className="flex-1 flex h-full overflow-hidden relative">
        <div className="flex-1 flex flex-col h-full overflow-hidden px-4 py-6">
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
          {activeTab === "discover" && <DiscoverView onSelectPrompt={() => {}} isDark={isDark} />}
          {activeTab === "templates" && <TemplatesView isDark={isDark} onSelectTemplate={(template) => {
            setActiveTab("chat");
            handleNewSession();
            // We would ideally set the initial prompt here or pass it to chat session
          }} />}
          {activeTab === "analytics" && <AnalyticsView token={token} isDark={isDark} />}
          {activeTab === "settings" && <SettingsView user={user} isDark={isDark} setIsDark={setIsDark} language={language} />}
          {activeTab === "devconsole" && <DevConsoleView token={token} isDark={isDark} user={user} />}
        </div>
      </main>

      {activeTab === "chat" && (
        <>
          <div 
            className="w-1 cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors z-10" 
            onMouseDown={handleRightMouseDown}
          />
          <HistorySidebar 
            sessions={sessions} 
            activeSessionId={activeSessionId} 
            onSelectSession={setActiveSessionId} 
            width={rightSidebarWidth}
          />
        </>
      )}
    </div>
  );
}
