import React from "react";
import { ShoppingBag, Wrench, CreditCard, User, HelpCircle, Package, ArrowRight, Star } from "lucide-react";

export default function TemplatesView({ isDark, onSelectTemplate }: { isDark: boolean, onSelectTemplate?: (template: string) => void }) {
  const templates = [
    {
      id: "returns",
      title: "Returns & Refunds",
      description: "Handle customer return requests, refund status, and exchange policies automatically.",
      icon: <ShoppingBag className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-100",
      darkColor: "bg-blue-900/40",
      prompts: ["How do I return an item?", "Where is my refund?", "What is your exchange policy?"]
    },
    {
      id: "tech-support",
      title: "Technical Support",
      description: "Troubleshoot common issues, software bugs, and hardware problems step-by-step.",
      icon: <Wrench className="w-6 h-6 text-emerald-500" />,
      color: "bg-emerald-100",
      darkColor: "bg-emerald-900/40",
      prompts: ["My app keeps crashing", "How do I reset my password?", "Device won't turn on"]
    },
    {
      id: "billing",
      title: "Billing & Subscriptions",
      description: "Manage subscription upgrades, payment failures, and invoice inquiries.",
      icon: <CreditCard className="w-6 h-6 text-purple-500" />,
      color: "bg-purple-100",
      darkColor: "bg-purple-900/40",
      prompts: ["Why was I charged twice?", "How do I cancel my subscription?", "Update payment method"]
    },
    {
      id: "account",
      title: "Account Management",
      description: "Assist users with profile updates, privacy settings, and account deletion.",
      icon: <User className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-100",
      darkColor: "bg-amber-900/40",
      prompts: ["How do I delete my account?", "Change email address", "Setup two-factor authentication"]
    },
    {
      id: "tracking",
      title: "Order Tracking",
      description: "Provide real-time updates on shipping status and delivery times.",
      icon: <Package className="w-6 h-6 text-indigo-500" />,
      color: "bg-indigo-100",
      darkColor: "bg-indigo-900/40",
      prompts: ["Where is my order?", "Track package", "My delivery is late"]
    },
    {
      id: "general",
      title: "General Inquiries",
      description: "Answer FAQs about company policies, business hours, and contact info.",
      icon: <HelpCircle className="w-6 h-6 text-rose-500" />,
      color: "bg-rose-100",
      darkColor: "bg-rose-900/40",
      prompts: ["What are your business hours?", "How can I contact support?", "Where are you located?"]
    }
  ];

  return (
    <div className={`h-full overflow-y-auto ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support Templates</h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Ready-to-use conversational flows for common customer support scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isDark ? template.darkColor : template.color}`}>
                  {template.icon}
                </div>
                <div className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Popular
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{template.title}</h3>
              <p className={`text-sm mb-6 h-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {template.description}
              </p>
              
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Example Prompts</p>
                {template.prompts.map((prompt, idx) => (
                  <div key={idx} className={`text-sm p-2 rounded-lg ${
                    isDark ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}>
                    "{prompt}"
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => onSelectTemplate && onSelectTemplate(template.title)}
                className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Use Template
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
