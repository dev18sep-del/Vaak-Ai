import React from "react";
import { Plus, Search, Grid, Users, Settings, LogOut, ArrowUpRight } from "lucide-react";
import { VaakaiLogo } from "./VaakaiLogo";

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, onNewSession }: any) {
  return (
    <aside className="w-64 flex flex-col h-full bg-white/20 backdrop-blur-md border-r border-white/40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
          <VaakaiLogo className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-slate-800">Vaakai</span>
      </div>

      <div className="px-4 mt-2">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-blue-500 hover:bg-white/40 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New chat</span>
        </button>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        <button
          onClick={() => setActiveTab("discover")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === "discover" ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"}`}
        >
          <Search className="w-5 h-5" />
          <span>Explore</span>
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === "templates" ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"}`}
        >
          <Grid className="w-5 h-5" />
          <span>Templates</span>
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === "team" ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"}`}
        >
          <Users className="w-5 h-5" />
          <span>Team</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === "settings" ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"}`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </nav>

      <div className="p-4 mb-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-white/40 rounded-xl font-medium transition-colors"
        >
          <Settings className="w-5 h-5 opacity-0" /> {/* Spacer */}
          <span className="flex items-center gap-3 -ml-8"><LogOut className="w-5 h-5" /> Log out</span>
        </button>
      </div>
    </aside>
  );
}
