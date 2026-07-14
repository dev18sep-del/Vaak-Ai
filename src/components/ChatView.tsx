import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, Star, ThumbsUp, HelpCircle, CheckCircle, Flame, MessageSquareText, ShieldAlert, Cpu, Paperclip, X, Image, FileText, Upload } from "lucide-react";
import { VaakaiLogo } from "./VaakaiLogo";
import { motion, AnimatePresence } from "motion/react";
import { ChatSession, Message, SUPPORTED_LANGUAGES, User, Attachment } from "../types";

interface ChatViewProps {
  token: string;
  activeSession: ChatSession | null;
  onSessionUpdated: (session: ChatSession) => void;
  language: string;
  isDark: boolean;
  user: User | null;
}

const CONTEXT_SUGGESTIONS = [
  { text: "Help me resolve invoice overage charges", category: "Billing" },
  { text: "Configure secure production API keys in Node.js", category: "Technical" },
  { text: "How do I clear local session caches?", category: "Technical" },
  { text: "Upgrade client account to an annual tier", category: "Sales" }
];

export default function ChatView({
  token,
  activeSession,
  onSessionUpdated,
  language,
  isDark,
  user
 }: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // File and Attachment States
  const [attachedFile, setAttachedFile] = useState<Attachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<"Technical" | "Billing" | "Sales" | "General">("Technical");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, loading]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if ((!textToSend.trim() && !attachedFile) || loading) return;
    
    setLoading(true);
    setInputText("");
    const currentAttachment = attachedFile;
    setAttachedFile(null);

    const userMsg: Message = {
      role: "user",
      text: textToSend || `Attached a file: ${currentAttachment?.name || "unnamed"}`,
      timestamp: new Date().toISOString(),
      attachment: currentAttachment || undefined
    };

    // Optimistically update the session list and active window
    const optimisticSession: ChatSession = {
      id: activeSession?.id || "temp-session",
      userId: activeSession?.userId || user?.id || "",
      userName: activeSession?.userName || user?.name || "",
      language: language,
      messages: activeSession ? [...activeSession.messages, userMsg] : [userMsg],
      createdAt: activeSession?.createdAt || new Date().toISOString()
    };
    onSessionUpdated(optimisticSession);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: textToSend,
          language: language,
          sessionId: activeSession && activeSession.id !== "temp-session" ? activeSession.id : undefined,
          attachment: currentAttachment || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deliver transmission.");
      }

      // Update parent state with the actual session details returned by the database
      const updatedSession: ChatSession = {
        id: data.sessionId,
        userId: activeSession?.userId || user?.id || "",
        userName: activeSession?.userName || user?.name || "",
        language: language,
        messages: data.messages,
        createdAt: activeSession?.createdAt || new Date().toISOString()
      };
      
      onSessionUpdated(updatedSession);
    } catch (err) {
      console.error("Error communicating with Vaakai Assistant:", err);
      // Append a helpful visual error message in place of silent failure
      const errorMsg: Message = {
        role: "model",
        text: "⚠️ System connection issue. Please check your network or verify your container credentials. You can also re-try sending your prompt.",
        timestamp: new Date().toISOString()
      };
      
      const failedSession: ChatSession = {
        id: activeSession?.id || "temp-session",
        userId: activeSession?.userId || user?.id || "",
        userName: activeSession?.userName || user?.name || "",
        language: language,
        messages: activeSession ? [...activeSession.messages, userMsg, errorMsg] : [userMsg, errorMsg],
        createdAt: activeSession?.createdAt || new Date().toISOString()
      };
      
      onSessionUpdated(failedSession);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          rating,
          comment: feedbackComment,
          category: feedbackCategory
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Feed the updated feedback object back into current session state
        onSessionUpdated(data.session);
        setShowFeedbackModal(false);
        setFeedbackComment("");
      }
    } catch (err) {
      console.error("Failed to submit CSAT feedback:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const hasFeedback = activeSession?.feedback !== undefined;

  return (
    <div className="flex-1 flex flex-col h-full relative" id="chat-workspace">
      
      {/* Active Session Info Header */}
      <div className={`p-4 border-b flex items-center justify-between transition ${
        isDark ? "bg-[#1E293B]/50 border-slate-800/80" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className={`font-bold text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                Vaakai Intelligent Agent
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400">
              Active Session: <span className="font-mono text-slate-300">{activeSession ? activeSession.id : "SESS-PENDING"}</span>
            </p>
          </div>
        </div>

        {activeSession && (
          <div className="flex items-center gap-2">
            {hasFeedback ? (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>CSAT Logged (★ {activeSession.feedback?.rating})</span>
              </span>
            ) : (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1.5 cursor-pointer font-bold shadow-md shadow-amber-500/5"
                id="btn-trigger-feedback"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rate Response</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Messages Scrolling Stage */}
      <div 
        className={`flex-1 overflow-y-auto p-6 space-y-4 relative ${
          isDark ? "bg-[#0F172A]" : "bg-slate-100/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Visual Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-600/10 backdrop-blur-xs border-2 border-dashed border-indigo-500 rounded-2xl flex flex-col items-center justify-center p-8 z-50 pointer-events-none"
            >
              <div className={`p-4 rounded-full ${isDark ? "bg-[#1E293B]" : "bg-white"} shadow-2xl flex flex-col items-center gap-2`}>
                <Upload className="w-10 h-10 text-indigo-500 animate-bounce" />
                <p className="text-xs font-bold">Drop files to attach to Vaakai</p>
                <p className="text-[10px] text-slate-400">Supports images and documents</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {/* Welcome Card if no messages */}
          {(!activeSession || activeSession.messages.length === 0) ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mt-8 text-center space-y-5"
              id="empty-chat-welcome"
            >
              <div className="inline-flex p-3 rounded-full bg-indigo-600/10 border border-indigo-500/20 shadow-xl shadow-indigo-600/5">
                <VaakaiLogo className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
                  {currentLangObj.greeting}
                </h2>
                <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  I am <span className="text-indigo-400 font-semibold">Vaakai</span>, your secure billing and developer operations assistant. Ask me anything about invoice overages, secure API deployment, or annual tier upgrades.
                </p>
              </div>

              {/* Instant Prompt Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
                {CONTEXT_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={`${sug.text}-${idx}`}
                    onClick={() => handleSendMessage(sug.text)}
                    className={`p-3 rounded-xl border text-left transition text-xs hover:border-indigo-500 hover:shadow-lg group flex flex-col justify-between cursor-pointer ${
                      isDark 
                        ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/20"
                    }`}
                  >
                    <span className="font-medium group-hover:text-indigo-400 leading-relaxed">{sug.text}</span>
                    <span className="text-[9px] mt-2 px-1.5 py-0.5 rounded bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 uppercase tracking-widest font-bold self-start font-mono">
                      {sug.category}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Render active conversation chat bubbles */
            activeSession.messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={`${msg.role}-${msg.timestamp || index}-${index}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-lg rounded-2xl p-4 shadow-sm border ${
                    isUser
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20 rounded-tr-none"
                      : (isDark 
                          ? "bg-slate-800 border-slate-700/50 text-slate-100 rounded-tl-none" 
                          : "bg-white border-slate-200 text-slate-800 rounded-tl-none")
                  }`}>
                    {/* Speaker Header */}
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider opacity-65">
                      <span>{isUser ? activeSession.userName : "Vaakai"}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Message Attachment Preview if present */}
                    {msg.attachment && (
                      <div className="mb-3">
                        {msg.attachment.type.startsWith("image/") ? (
                          <div className="relative group max-w-sm rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                            <img
                              src={msg.attachment.dataUrl}
                              alt={msg.attachment.name}
                              className="w-full max-h-60 object-contain bg-black/10 dark:bg-black/30"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white p-1 truncate">
                              {msg.attachment.name} • {((msg.attachment.size || 0) / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                            isUser 
                              ? "bg-white/15 border-white/20 text-white" 
                              : (isDark ? "bg-[#0F172A]/60 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700")
                          }`}>
                            <FileText className="w-5 h-5 flex-shrink-0 opacity-80" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate text-[11px] leading-tight">{msg.attachment.name}</p>
                              <p className="text-[9px] opacity-65">{((msg.attachment.size || 0) / 1024).toFixed(1)} KB</p>
                            </div>
                            <a
                              href={msg.attachment.dataUrl}
                              download={msg.attachment.name}
                              className={`p-1.5 rounded-md transition ${
                                isUser ? "hover:bg-white/20 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-500"
                              }`}
                              title="Download file"
                            >
                              <Send className="w-3.5 h-3.5 rotate-90" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Speech Text Content */}
                    <MarkdownRenderer text={msg.text} isDark={isDark} isUser={isUser} />
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Pending response AI bubble */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
              id="ai-loading-bubble"
            >
              <div className={`max-w-xs rounded-2xl p-4 rounded-bl-none border ${
                isDark ? "bg-slate-800 border-slate-700/50 text-slate-300" : "bg-white border-slate-200 text-slate-700"
              }`}>
                <div className="flex items-center gap-1 mb-1 text-[10px] font-bold uppercase tracking-wider opacity-65">
                  <span>Vaakai</span>
                  <span>•</span>
                  <span>Typing</span>
                </div>
                <div className="flex items-center gap-1 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Support Prompt Bar */}
      <div className={`p-4 border-t ${
        isDark ? "bg-[#1E293B]/30 border-slate-800/80" : "bg-white border-slate-100"
      }`}>
        <div className="flex flex-col gap-2">
          {/* Attached file preview if exists */}
          {attachedFile && (
            <div className={`flex items-center justify-between p-2 rounded-xl border ${
              isDark ? "bg-[#0F172A] border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              <div className="flex items-center gap-2">
                {attachedFile.type.startsWith("image/") ? (
                  <img
                    src={attachedFile.dataUrl}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold truncate max-w-[200px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-400">{(attachedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 rounded-full hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="relative flex items-center gap-2"
            id="chat-input-form"
          >
            {/* Hidden inputs for file / photo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,text/plain,application/json,application/zip"
            />
            <input
              type="file"
              ref={photoInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              capture="environment"
            />

            {/* Attach button */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach File"
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isDark 
                    ? "bg-[#0F172A] border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200" 
                    : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                title="Capture Photo"
                className={`p-2.5 rounded-xl border transition sm:flex hidden cursor-pointer ${
                  isDark 
                    ? "bg-[#0F172A] border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200" 
                    : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                <Image className="w-4 h-4" />
              </button>
            </div>

            {/* Text input container */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={loading ? "Vaakai is processing query..." : "Verify billing anomalies, configure Node environment secrets..."}
                className={`w-full pl-4 pr-12 py-3 rounded-xl text-xs border focus:outline-none focus:ring-1 transition-all ${
                  isDark 
                    ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white placeholder-slate-500" 
                    : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900 placeholder-slate-400"
                }`}
                id="chat-message-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || (!inputText.trim() && !attachedFile)}
                className={`absolute right-3 p-1.5 rounded-lg transition-all ${
                  (inputText.trim() || attachedFile) && !loading
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                    : "bg-slate-800/20 text-slate-500 cursor-not-allowed"
                }`}
                id="chat-submit-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CSAT Customer Satisfaction Rating Modal Overlay */}
      {showFeedbackModal && activeSession && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? "bg-[#1E293B] border-slate-700/80 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
            id="feedback-dialog-panel"
          >
            <div className="text-center mb-5">
              <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
                <Star className="w-6 h-6 fill-current animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <h3 className="text-lg font-bold">Rate Your Support Session</h3>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Help us evaluate Vaakai's performance for transmission <span className="font-mono text-indigo-400">{activeSession.id.substring(0,8)}</span>.
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {/* Rating Star Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Select Star Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${
                        star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Anomalous Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Technical", "Billing", "Sales", "General"] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFeedbackCategory(cat)}
                      className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                        feedbackCategory === cat
                          ? "bg-indigo-600/15 border-indigo-500 text-indigo-400"
                          : `${isDark ? "bg-[#0F172A] border-slate-700 hover:bg-slate-900" : "bg-slate-50 border-slate-300 hover:bg-slate-100"} text-slate-400`
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Description text */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Satisfaction Comments
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Explain whether Vaakai resolved your billing or API inquiry perfectly..."
                  rows={3}
                  className={`w-full p-3 rounded-xl text-xs border focus:outline-none focus:ring-1 transition-all ${
                    isDark 
                      ? "bg-[#0F172A] border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/10 text-white" 
                      : "bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/10 text-slate-900"
                  }`}
                  id="feedback-comment-input"
                  required
                />
              </div>

              {/* Modal control buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isDark 
                      ? "bg-[#0F172A] border-slate-700 hover:bg-slate-900 text-slate-400" 
                      : "bg-white border-slate-300 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1"
                  id="feedback-submit-btn"
                >
                  {submittingFeedback ? "Saving..." : "Submit Satisfaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Custom Markdown parser and visual formatter component for perfectly arranged responses
function MarkdownRenderer({ text, isDark, isUser = false }: { text: string; isDark: boolean; isUser?: boolean }) {
  const parts = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push({ type: "text", content: textBefore });
    }
    parts.push({
      type: "code",
      language: match[1] || "code",
      content: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  const textAfter = text.substring(lastIndex);
  if (textAfter) {
    parts.push({ type: "text", content: textAfter });
  }

  return (
    <div className={`space-y-2.5 text-xs leading-relaxed font-normal ${isUser ? "text-indigo-50" : (isDark ? "text-slate-100" : "text-slate-800")}`}>
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700/50 bg-[#0F172A] shadow-md text-left">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>{part.language || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(part.content)}
                  className="hover:text-indigo-400 transition cursor-pointer text-[10px] font-bold"
                  title="Copy code to clipboard"
                  type="button"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-indigo-200 bg-[#0F172A]">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        const lines = part.content.split("\n");
        return (
          <div key={index} className="space-y-1.5 text-left">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className={`text-sm font-bold mt-3 mb-1 tracking-tight ${isUser ? "text-white" : "text-indigo-400"}`}>
                    {renderInlineStyles(trimmed.substring(4), isUser)}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className={`text-base font-bold mt-4 mb-2 tracking-tight ${isUser ? "text-white" : "text-indigo-400"}`}>
                    {renderInlineStyles(trimmed.substring(3), isUser)}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className={`text-lg font-bold mt-5 mb-2 tracking-tight ${isUser ? "text-white" : "text-indigo-400"}`}>
                    {renderInlineStyles(trimmed.substring(2), isUser)}
                  </h2>
                );
              }

              if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className={`mt-1 flex-shrink-0 text-[10px] ${isUser ? "text-indigo-200" : "text-indigo-400"}`}>●</span>
                    <span className="flex-1">{renderInlineStyles(trimmed.substring(2), isUser)}</span>
                  </div>
                );
              }

              const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
              if (numListMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className={`font-bold font-mono text-[10px] mt-0.5 ${isUser ? "text-indigo-200" : "text-indigo-400"}`}>{numListMatch[1]}.</span>
                    <span className="flex-1">{renderInlineStyles(numListMatch[2], isUser)}</span>
                  </div>
                );
              }

              if (!trimmed) {
                return <div key={lIdx} className="h-1.5" />;
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderInlineStyles(line, isUser)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInlineStyles(text: string, isUser: boolean) {
  if (!text) return "";
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className={`font-extrabold ${isUser ? "text-white" : "text-indigo-400 dark:text-indigo-300"}`}>
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] border ${
          isUser 
            ? "bg-white/15 text-white border-white/20" 
            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/15 dark:bg-slate-900/60 dark:text-indigo-300 dark:border-indigo-500/25"
        }`}>
          {part.substring(1, part.length - 1)}
        </code>
      );
    }
    return part;
  });
}
