import React from "react";
import { Folder, Trash2 } from "lucide-react";
import { ChatSession } from "../types";

export default function HistorySidebar({ sessions, activeSessionId, onSelectSession }: {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}) {
  return (
    <aside className="w-72 flex flex-col h-full bg-white/10 backdrop-blur-sm border-l border-white/20 p-6">
      <h2 className="text-xl font-medium text-slate-800 mb-6">History</h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No chat history yet.</p>
        ) : (
          sessions.map((session, idx) => {
            const firstUserMsg = session.messages.find(m => m.role === "user")?.text;
            const topic = firstUserMsg ? firstUserMsg : "New conversation";
            const lastMsg = session.messages[session.messages.length - 1]?.text || "...";
            
            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="w-full text-left flex gap-3 group"
              >
                <Folder className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
                <div className="overflow-hidden">
                  <h4 className="text-sm font-medium text-slate-800 truncate">{topic}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMsg}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4">
        <button className="w-full bg-white/60 hover:bg-white/80 transition-colors text-red-500 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm">
          <Trash2 className="w-4 h-4" />
          Delete history
        </button>
      </div>
    </aside>
  );
}
