import React, { useState, useRef, useEffect } from "react";
import { Send, Upload, Share, Bookmark, MoreVertical, Paperclip, Mic, Lightbulb, Globe, Code, Plus, MessageSquare } from "lucide-react";
import { ChatSession, Message, User, Attachment } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatViewProps {
  token: string;
  activeSession: ChatSession | null;
  onSessionUpdated: (session: ChatSession) => void;
  language: string;
  isDark: boolean;
  user: User;
}

export default function ChatView({ token, activeSession, onSessionUpdated, language, isDark, user }: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMicClick = () => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language || "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    setRecognitionInstance(recognition);

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setInputText((prev) => prev ? prev + " " + finalTranscript : finalTranscript);
      }
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition", e);
      setIsListening(false);
    }
  };
  
  // Set messages based on active session
  useEffect(() => {
    if (activeSession) {
      setMessages(activeSession.messages);
    } else {
      setMessages([]);
    }
  }, [activeSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || loading) return;

    const userMessage: Message = {
      role: "user",
      text: inputText,
      timestamp: new Date().toISOString(),
      ...(attachment ? { attachment } : {})
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setAttachment(null);
    setLoading(true);

    try {
      const endpoint = "/api/chat";
      
      const payload: any = {
        message: userMessage.text,
        language,
        sessionId: activeSession?.id,
        ...(attachment ? { attachment } : {})
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to send");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (reader) {
        let aiMessageText = "";
        let finalSessionData: ChatSession | null = null;
        
        // Add a placeholder message for the assistant
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "",
          timestamp: new Date().toISOString()
        }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
             if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim();
                if (dataStr === '[DONE]') break;
                if (!dataStr) continue;
                
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text !== undefined) {
                    aiMessageText += data.text;
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        text: aiMessageText
                      };
                      return updated;
                    });
                  }
                  if (data.done && data.session) {
                    finalSessionData = data.session;
                  }
                } catch (e) {
                  // Ignore parsing errors for incomplete chunks
                }
             }
          }
        }
        
        if (finalSessionData) {
           onSessionUpdated(finalSessionData);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Sorry, there was an error processing your request.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const currentTopic = messages.length > 0 && messages[0].role === "user" 
    ? messages[0].text.length > 30 ? messages[0].text.substring(0, 30) + "..." : messages[0].text 
    : "New conversation";

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl rounded-[32px] shadow-sm border border-white/80 overflow-hidden relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100/50 bg-white/40">
        <h2 className="text-xl font-medium text-slate-800">{currentTopic}</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-medium text-slate-700 shadow-sm border border-slate-100 transition hover:bg-slate-50">
            <Share className="w-4 h-4" /> Share
          </button>
          <button className="bg-white p-2.5 rounded-xl text-slate-700 shadow-sm border border-slate-100 transition hover:bg-slate-50">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="bg-white p-2.5 rounded-xl text-slate-700 shadow-sm border border-slate-100 transition hover:bg-slate-50">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-slate-200 mt-1">
                  {msg.role === 'user' ? (
                     <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
                  ) : (
                     <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs font-bold">V</div>
                  )}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed flex flex-col gap-2 ${
                  msg.role === 'user' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-100/50 rounded-tr-none' 
                    : 'bg-transparent text-slate-800'
                }`}>
                  {msg.attachment && msg.attachment.dataUrl && (
                    <div className="mb-2">
                      {msg.attachment.type.startsWith("image/") ? (
                        <img src={msg.attachment.dataUrl} alt={msg.attachment.name} className="max-w-[200px] rounded-lg border border-slate-200" />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                          <Paperclip className="w-4 h-4 text-slate-500" />
                          <span className="truncate max-w-[150px] font-medium text-slate-700">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.text && <MarkdownRenderer text={msg.text} isUser={msg.role === "user"} />}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] flex gap-3 flex-row">
              <div className="w-8 h-8 shrink-0 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold mt-1">V</div>
              <div className="px-5 py-3.5 rounded-2xl text-[15px] bg-transparent text-slate-500 animate-pulse">
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-white/80 to-transparent">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {/* Action Chips */}
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Brainstorm
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Globe className="w-3.5 h-3.5 text-blue-500" /> Web search
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Code className="w-3.5 h-3.5 text-green-500" /> Code
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-50">
               More
            </button>
          </div>

          {attachment && (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-3">
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.dataUrl} alt={attachment.name} className="w-10 h-10 object-cover rounded-md border border-slate-200" />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200">
                    <Paperclip className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{attachment.name}</div>
                  <div className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-2 flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf,.txt,.json,.csv"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              onClick={handleMicClick}
              className={`p-2 rounded-xl transition ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me something....."
              className="flex-1 bg-transparent border-none focus:outline-none text-[15px] px-2 py-2"
              id="chat-message-input"
            />
            <button 
              type="submit"
              disabled={(!inputText.trim() && !attachment) || loading}
              className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


function MarkdownRenderer({ text, isUser = false }: { text: string; isUser?: boolean }) {
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
    <div className="space-y-2.5">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 text-left">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <span>{part.language || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(part.content)}
                  className="hover:text-blue-500 transition cursor-pointer text-[10px] font-bold"
                  type="button"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[13px] font-mono text-slate-800">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }
        const lines = part.content.split("\n");
        return (
          <div key={index} className="space-y-2 text-left">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold mt-3 mb-1">{renderInlineStyles(trimmed.substring(4))}</h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="text-base font-bold mt-4 mb-2">{renderInlineStyles(trimmed.substring(3))}</h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="text-lg font-bold mt-5 mb-2">{renderInlineStyles(trimmed.substring(2))}</h2>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className="mt-1 flex-shrink-0 text-[10px] text-blue-500">●</span>
                    <span className="flex-1">{renderInlineStyles(trimmed.substring(2))}</span>
                  </div>
                );
              }
              const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
              if (numListMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className="font-bold font-mono text-[10px] mt-0.5 text-blue-500">{numListMatch[1]}.</span>
                    <span className="flex-1">{renderInlineStyles(numListMatch[2])}</span>
                  </div>
                );
              }
              if (!trimmed) {
                return <div key={lIdx} className="h-1.5" />;
              }
              return (
                <p key={lIdx}>
                  {renderInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInlineStyles(text: string) {
  if (!text) return "";
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-slate-900">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded-md font-mono text-[11px] border bg-slate-100 border-slate-200 text-slate-700">
          {part.substring(1, part.length - 1)}
        </code>
      );
    }
    return part;
  });
}
