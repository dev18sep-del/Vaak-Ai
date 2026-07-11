export interface Attachment {
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // Base64 data url for viewing and sending
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
  attachment?: Attachment;
}

export interface Feedback {
  rating: number;
  comment: string;
  category: "Technical" | "Billing" | "Sales" | "General";
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  language: string;
  messages: Message[];
  feedback?: Feedback;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AnalyticsData {
  totalSessions: number;
  avgRating: number;
  resolutionRate: number;
  storageUsed: number;
  storageLimit: number;
  storagePercent: number;
  categoryCounts: Record<string, number>;
  ratingCounts: Record<number, number>;
  recentHistory: Array<{
    id: string;
    userName: string;
    language: string;
    messagesCount: number;
    category: string;
    rating: number | null;
    comment: string;
    createdAt: string;
  }>;
}

export type ActiveTab = "chat" | "discover" | "analytics" | "settings";

export interface Language {
  code: string;
  name: string;
  flag: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸", greeting: "How can I assist your workflow?" },
  { code: "es", name: "Español", flag: "🇪🇸", greeting: "¿Cómo puedo ayudarle hoy?" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳", greeting: "நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", greeting: "मैं आपकी क्या मदद कर सकता हूँ?" },
  { code: "fr", name: "Français", flag: "🇫🇷", greeting: "Comment puis-je vous aider ?" }
];
