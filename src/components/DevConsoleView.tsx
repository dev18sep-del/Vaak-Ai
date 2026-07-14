import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, CheckCircle, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";
import { User } from "../types";

interface DevConsoleViewProps {
  token: string | null;
  isDark: boolean;
  user: User;
}

export default function DevConsoleView({ token, isDark, user }: DevConsoleViewProps) {
  const [code, setCode] = useState<string>("function calculateSum(a, b) {\n  return a + b;\n}");
  const [errorText, setErrorText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>("");
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean>(false);

  const handleDiagnose = async () => {
    if (!code || !errorText) return;
    setLoading(true);
    setDiagnosis(null);
    setQuizSubmitted(false);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code, errorText, language: "javascript" })
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data);
      } else {
        console.error("Diagnosis failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!diagnosis || !diagnosis.quiz) return;
    const isCorrect = quizAnswer.toLowerCase().trim() === diagnosis.quiz.answer.toLowerCase().trim();
    setQuizCorrect(isCorrect);
    setQuizSubmitted(true);
  };

  return (
    <div className={`flex h-full flex-col ${isDark ? "bg-[#0F172A]" : "bg-slate-50"}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Debugging Companion</h1>
            <p className="text-xs opacity-70">Paste your code and error to diagnose issues</p>
          </div>
        </div>
        <button
          onClick={handleDiagnose}
          disabled={loading || !code || !errorText}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 font-semibold text-sm transition disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Diagnose Bug
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Code Editor */}
        <div className={`w-1/2 flex flex-col border-r ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "bg-[#1E293B] text-slate-400" : "bg-slate-100 text-slate-500"}`}>
            Source Code
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              theme={isDark ? "vs-dark" : "light"}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Right: Error & Diagnosis */}
        <div className="w-1/2 flex flex-col h-full overflow-y-auto">
          <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "bg-[#1E293B] text-slate-400" : "bg-slate-100 text-slate-500"}`}>
            Error / Stack Trace
          </div>
          <textarea
            value={errorText}
            onChange={(e) => setErrorText(e.target.value)}
            placeholder="Paste your error message or stack trace here..."
            className={`w-full p-4 h-40 resize-none outline-none font-mono text-sm ${
              isDark ? "bg-slate-900 text-slate-300 placeholder-slate-600" : "bg-white text-slate-800 placeholder-slate-400"
            }`}
          />
          
          <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-y ${isDark ? "bg-[#1E293B] border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
            Diagnosis & Learning
          </div>
          <div className="flex-1 p-4 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-indigo-400 animate-pulse font-medium">Diagnosing issue...</p>
              </div>
            ) : diagnosis ? (
              <>
                {/* Confidence Badge */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Root Cause</h3>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold uppercase bg-slate-800 text-slate-300">
                      Tag: <span className="text-indigo-400">{diagnosis.conceptTag}</span>
                    </div>
                  </div>
                  {diagnosis.confidence === "high" ? (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-md border border-green-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> High Confidence
                    </span>
                  ) : diagnosis.confidence === "medium" ? (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" /> Medium Confidence
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
                      <ShieldAlert className="w-3.5 h-3.5" /> Low Confidence (Verify)
                    </span>
                  )}
                </div>

                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {diagnosis.rootCause}
                </p>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Suggested Fix</h3>
                  <div className={`p-4 rounded-xl font-mono text-sm overflow-x-auto ${isDark ? "bg-slate-900 border border-slate-800" : "bg-slate-100 border border-slate-200"}`}>
                    <pre><code>{diagnosis.fix}</code></pre>
                  </div>
                  <p className={`text-sm mt-2 font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                    Why it works: <span className="font-normal">{diagnosis.whyItWorks}</span>
                  </p>
                </div>

                {/* Understanding Check */}
                {diagnosis.quiz && (
                  <div className={`mt-6 p-5 rounded-2xl border ${isDark ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-300"}`}>
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Understanding Check
                    </h3>
                    <p className="text-sm mb-4">{diagnosis.quiz.question}</p>
                    
                    {diagnosis.quiz.options && diagnosis.quiz.options.length > 0 ? (
                      <div className="space-y-2">
                        {diagnosis.quiz.options.map((opt: string, i: number) => (
                          <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}>
                            <input 
                              type="radio" 
                              name="quiz" 
                              value={opt} 
                              onChange={(e) => setQuizAnswer(e.target.value)}
                              disabled={quizSubmitted}
                              className="accent-indigo-500"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input 
                        type="text"
                        value={quizAnswer}
                        onChange={(e) => setQuizAnswer(e.target.value)}
                        disabled={quizSubmitted}
                        placeholder="Type your answer..."
                        className={`w-full p-3 rounded-lg border text-sm outline-none focus:border-indigo-500 ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                      />
                    )}

                    {!quizSubmitted ? (
                      <button 
                        onClick={submitQuiz}
                        disabled={!quizAnswer}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${quizCorrect ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}>
                        {quizCorrect ? (
                          <><CheckCircle className="w-4 h-4" /> Correct! Concept mastered.</>
                        ) : (
                          <><AlertTriangle className="w-4 h-4" /> Incorrect. The correct answer was: {diagnosis.quiz.answer}</>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Cpu className="w-12 h-12 mb-3 text-slate-500" />
                <p>Paste code and error to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
