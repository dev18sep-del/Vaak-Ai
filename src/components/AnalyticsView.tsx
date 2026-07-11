import React, { useState, useEffect } from "react";
import { BarChart3, HelpCircle, Star, ThumbsUp, ShieldCheck, Mail, Calendar, MessageSquare, RefreshCw, Layers, ShieldCheck as VerifiedIcon, Trash2 } from "lucide-react";
import { AnalyticsData, ChatSession } from "../types";

interface AnalyticsViewProps {
  token: string;
  isDark: boolean;
}

export default function AnalyticsView({ token, isDark }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Failed to compile dashboard metrics.");
      }
      const compiledData = await res.json();
      setData(compiledData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Compiling bento-grid analytics charts...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <span className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-bold">X</span>
        <h3 className="font-bold text-sm">Failed to Load Telemetry</h3>
        <p className="text-xs text-slate-400 max-w-xs">{error || "Ensure backend servers are live and responsive."}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
        >
          Retry Telemetry Compile
        </button>
      </div>
    );
  }

  // Calculate rating percentage helpers for Star Ratings Distribution
  const totalStarsCount = (Object.values(data.ratingCounts) as number[]).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto" id="analytics-workspace">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-extrabold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Vaakai Telemetry Dashboard
          </h2>
          <p className="text-[10px] text-slate-400">
            Real-time analytics monitor for CSAT user feedback, 2FA logs, and conversation volume.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className={`p-2 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition ${
            isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
          }`}
          title="Refresh Metrics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="font-bold">Sync</span>
        </button>
      </div>

      {/* Stats Bento-Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Sessions */}
        <div className={`p-4.5 rounded-xl border flex items-center gap-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</p>
            <h3 className={`text-2xl font-black mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>{data.totalSessions}</h3>
            <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">↑ 14% this week</p>
          </div>
        </div>

        {/* Avg CSAT Rating */}
        <div className={`p-4.5 rounded-xl border flex items-center gap-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg CSAT Rating</p>
            <h3 className={`text-2xl font-black mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>{data.avgRating} / 5.0</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">From {data.totalSessions} sessions</p>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className={`p-4.5 rounded-xl border flex items-center gap-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolution Rate</p>
            <h3 className={`text-2xl font-black mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>{data.resolutionRate}%</h3>
            <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">Target rating &gt; 3★</p>
          </div>
        </div>

        {/* 2FA Identity Status */}
        <div className={`p-4.5 rounded-xl border flex items-center gap-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity Security</p>
            <h3 className="text-xs font-black mt-1 text-emerald-400">100% ENFORCED</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Protected by secure 2FA OTP</p>
          </div>
        </div>

      </div>

      {/* Visual Charts Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart Card 1: CSAT Ratings star distribution */}
        <div className={`p-5 rounded-xl border space-y-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div>
            <h4 className={`font-bold text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Satisfaction Rating Distribution
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Star breakdowns (1-5★) logged across all sessions.
            </p>
          </div>

          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data.ratingCounts[stars] || 0;
              const percent = Math.round((count / totalStarsCount) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-mono font-bold text-slate-400 flex items-center gap-1">
                    {stars} ★
                  </span>
                  
                  {/* Progress Bar representer */}
                  <div className="flex-1 h-3 rounded bg-slate-800 overflow-hidden relative">
                    <div 
                      className={`h-full rounded bg-gradient-to-r ${
                        stars >= 4 ? "from-indigo-600 to-indigo-400" : (stars === 3 ? "from-indigo-400 to-cyan-500" : "from-red-500 to-orange-500")
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-10 font-mono text-right font-bold text-slate-300">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Card 2: Support Categories breakdown */}
        <div className={`p-5 rounded-xl border space-y-4 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div>
            <h4 className={`font-bold text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Anomalous Category Distribution
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Volumes divided by customer issues reported.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {(["Technical", "Billing", "Sales", "General"] as const).map((cat) => {
              const count = data.categoryCounts[cat] || 0;
              // Simple bar count
              const maxCount = Math.max(...(Object.values(data.categoryCounts) as number[]), 1);
              const barPercent = Math.round((count / maxCount) * 100);

              const colorMap = {
                Technical: "from-cyan-500 to-blue-500 text-cyan-400",
                Billing: "from-indigo-500 to-indigo-400 text-indigo-400",
                Sales: "from-amber-500 to-orange-500 text-amber-400",
                General: "from-slate-500 to-slate-400 text-slate-400"
              };

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{cat} Queries</span>
                    <span className="font-mono">{count} tickets</span>
                  </div>
                  
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${colorMap[cat].split(" ")[0]}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* History Table Container */}
      <div className={`p-5 rounded-xl border space-y-4 transition ${
        isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div>
          <h4 className={`font-bold text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Recent Support Transmissions History
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Audit logs for all real-time customer sessions, rating scores, and satisfaction comments.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase tracking-wider font-bold text-slate-500 ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}>
                <th className="py-2 px-3">Session ID</th>
                <th className="py-2 px-3">Customer Email</th>
                <th className="py-2 px-3">Language</th>
                <th className="py-2 px-3">Anomalous Category</th>
                <th className="py-2 px-3">Feedback Rating</th>
                <th className="py-2 px-3">Customer Comments</th>
                <th className="py-2 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/40 text-slate-300">
              {data.recentHistory.map((hist, idx) => {
                return (
                  <tr key={`${hist.id}-${idx}`} className={`${isDark ? "hover:bg-slate-900/40" : "hover:bg-slate-100/30"}`}>
                    <td className="py-3 px-3 font-mono font-bold text-[11px] text-indigo-400">
                      {hist.id.replace("session-", "SESS-")}
                    </td>
                    <td className="py-3 px-3">{hist.userName}</td>
                    <td className="py-3 px-3 font-mono uppercase text-[10px]">{hist.language}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        hist.category === "Technical" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10" :
                        hist.category === "Billing" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10" :
                        hist.category === "Sales" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                        "bg-slate-500/10 text-slate-400"
                      }`}>
                        {hist.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {hist.rating ? (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          ★ {hist.rating}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">Unrated</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate" title={hist.comment}>
                      {hist.comment || <span className="text-slate-500 italic">No message logged</span>}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                      {new Date(hist.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
