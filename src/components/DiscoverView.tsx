import React, { useState } from "react";
import { Compass, Search, ArrowRight, ShieldCheck, Cpu, HardDrive, CircleDollarSign, Zap, Activity, Info, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface DiscoverViewProps {
  onSelectPrompt: (promptText: string) => void;
  isDark: boolean;
}

const NEURAL_AGENTS = [
  {
    title: "Billing Audit Bot v2.4",
    desc: "Cross-checks container scale logs against invoice tier rules to prevent overages.",
    status: "Active",
    efficiency: "99.2%",
    tier: "Standard",
    icon: CircleDollarSign,
    color: "text-emerald-400 bg-emerald-500/10"
  },
  {
    title: "Node.js Container Optimizer",
    desc: "Monitors express garbage collection cycles and memory leak profiles dynamically.",
    status: "Standby",
    efficiency: "96.4%",
    tier: "Developer",
    icon: Cpu,
    color: "text-indigo-400 bg-indigo-500/10"
  },
  {
    title: "2FA Security Auditor",
    desc: "Validates active user sessions, session tokens, and multifactor identity configurations.",
    status: "Monitoring",
    efficiency: "100.0%",
    tier: "Enterprise",
    icon: ShieldCheck,
    color: "text-cyan-400 bg-cyan-500/10"
  }
];

const QUICK_WORKFLOW_PROMPTS = [
  "Run security audit on active Express.js cookies",
  "Waive temporary overage fees on billing invoice",
  "Write clean mock testing configuration for Vitest",
  "Draft bilingual auto-responses in Tamil and Spanish"
];

export default function DiscoverView({ onSelectPrompt, isDark }: DiscoverViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = NEURAL_AGENTS.filter(
    agent => agent.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             agent.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto" id="discover-workspace">
      
      {/* Immersive Welcome Search Header */}
      <div className={`p-8 rounded-2xl border text-center space-y-5 relative overflow-hidden transition ${
        isDark 
          ? "bg-[#1E293B] border-slate-800/80" 
          : "bg-white border-slate-200"
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Compass className="w-48 h-48 animate-spin" style={{ animationDuration: "120s" }} />
        </div>

        <div className="max-w-xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Support Intelligence Hub</span>
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Discover Neural Agents & Workflows
          </h2>
          <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Select from preconfigured AI diagnostic templates to automate customer billing reviews, code audits, or multilungual chat routing instantly.
          </p>

          {/* Interactive Search Input */}
          <div className="relative mt-5 max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit tools, container optimizers, workflows..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 transition-all ${
                isDark 
                  ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white placeholder-slate-500" 
                  : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900 placeholder-slate-400"
              }`}
              id="discover-search-input"
            />
          </div>
        </div>
      </div>

      {/* Suggested Quick Workflow Prompts */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Suggested Auditing Prompts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_WORKFLOW_PROMPTS.map((promptText, idx) => (
            <button
              key={`${promptText}-${idx}`}
              onClick={() => onSelectPrompt(promptText)}
              className={`p-3.5 rounded-xl border text-left text-xs font-semibold hover:border-indigo-500 transition group flex items-center justify-between cursor-pointer ${
                isDark 
                  ? "bg-[#1E293B]/40 border-slate-800/80 text-slate-200 hover:bg-[#1E293B]/80" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="truncate group-hover:text-indigo-400">{promptText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 transition group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Neural Agents Templates Grid */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Deployable Support Nodes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredAgents.map((agent, idx) => {
            const IconComponent = agent.icon;
            return (
              <motion.div
                key={`${agent.title}-${idx}`}
                whileHover={{ y: -3 }}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isDark 
                    ? "bg-[#1E293B]/45 border-slate-800/80" 
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  <div className={`p-2.5 rounded-lg w-10 h-10 flex items-center justify-center ${agent.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                      {agent.title}
                    </h3>
                    <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {agent.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/10 dark:border-slate-800/50 flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    Efficiency: <strong className="text-white">{agent.efficiency}</strong>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/40 border border-slate-800 text-[9px] uppercase tracking-wider font-bold">
                    {agent.tier}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Credits, Storage, and System Status Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Support Token Credits */}
        <div className={`p-4 rounded-xl border space-y-3 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active API Credits</span>
            <span className="text-[10px] font-mono font-bold text-indigo-400">750 / 1000 Used</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: "75%" }} />
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed">
            API credits allocate container token generations for active Vaakai chat histories.
          </p>
        </div>

        {/* Database capacity log */}
        <div className={`p-4 rounded-xl border space-y-3 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure SQL Node Space</span>
            <span className="text-[10px] font-mono font-bold text-cyan-400">412 MB / 1 GB</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" style={{ width: "40%" }} />
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed">
            Storage holds encrypted passwords, verified 2FA keys, and serialized session state files.
          </p>
        </div>

        {/* Real-time Telemetry Status */}
        <div className={`p-4 rounded-xl border space-y-3 transition ${
          isDark ? "bg-[#1E293B]/45 border-slate-800/80" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Container Cluster</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase font-mono tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Healthy</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-[10px]">CPU Load: 0.12% | Latency: 12ms</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed">
            Deployed behind safe HTTPS gateways on port 3000, monitored by automatic heartbeats.
          </p>
        </div>

      </div>

    </div>
  );
}
