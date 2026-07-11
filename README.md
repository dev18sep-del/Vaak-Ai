# 🛡️ Vaakai — Secure AI-Powered Customer Support Hub

Vaakai is a modern, enterprise-ready, real-time AI customer support platform. Powered by Google Gemini AI, a robust Express backend, and a highly polished React + Tailwind CSS client, Vaakai delivers smart, multi-lingual answers to common customer questions regarding billing, technical configs, and service plans.

To ensure top-tier enterprise compliance, Vaakai includes a complete, custom **2-Factor Authentication (2FA)** identity verification flow, real-time analytics for support managers, a feedback/CSAT feedback loop, dynamic language swapping, and a collapsing navigation layout designed for maximal workspace efficiency.

---

## ✨ Key Features

- **🧠 Google Gemini Integration**: Leverages the official `@google/genai` SDK and `gemini-3.5-flash` model for intelligent, context-aware customer query responses.
- **🔐 Secure 2FA Identity Verification**: A multi-step authentication process requiring password validation followed by standard 2-step verification (using temporary one-time passwords).
- **📊 Real-time Support Analytics**: A responsive control panel with performance metrics, feedback score distribution, topic categorization, and a comprehensive ticket log history.
- **🌍 Dynamic Multi-lingual Support**: Native conversational language switching (English 🇬🇧, Spanish 🇪🇸, Tamil 🇮🇳, etc.) with both automated translating instructions and high-accuracy deterministic fallbacks.
- **🎨 Premium Responsive UI**: Full dark/light theme options, responsive mobile-first grids, custom-rendered code formatting blocks, and collapsing sidebar navigation to optimize workspace real estate.
- **⚡ Fast Unified Sandbox**: Uses Vite + React for the frontend SPA and TSX + Express for a fast, bundled, single-file compiled backend server.

---

## 📂 Project Architecture

```bash
├── server.ts               # Custom Express server, API proxy, and Gemini connector
├── src/
│   ├── App.tsx             # Main client application entry & global layout
│   ├── main.tsx            # React application renderer
│   ├── index.css           # Global Tailwind CSS imports & custom themes
│   ├── types.ts            # Shared TypeScript type definitions
│   └── components/         # Extracted functional React modules
│       ├── AuthPage.tsx    # Secure multi-step login, registration, and 2FA page
│       ├── Sidebar.tsx     # Session histories, settings toggle, and collapsing panel
│       ├── ChatView.tsx    # Immersive messaging window with custom Markdown formatter
│       ├── AnalyticsView.tsx # Interactive support metrics dashboard
│       └── SettingsView.tsx # Profile updates & container environment credentials
├── .env.example            # Template for required environment variables
├── .gitignore              # Outlines files excluded from Git tracking
├── package.json            # Scripts, dependency libraries, and metadata
└── tsconfig.json           # Compiler rules for high-precision TypeScript typing
```

---

## 🚀 Local Installation & Setup

Follow these steps to run the Vaakai chatbot on your local machine:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/vaakai-chatbot.git
cd vaakai-chatbot
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to a new file named `.env` and provide your Google Gemini API key:
```bash
cp .env.example .env
```
Inside your `.env` file:
```env
# Google Gemini API Key (get yours at https://aistudio.google.com/)
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Public App Url (for references or production redirects)
APP_URL="http://localhost:3000"
```

### 5. Start the Development Server
```bash
npm run dev
```
Once the dev server is live, open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Build Commands

The project contains a set of unified build and utility scripts inside `package.json`:

- **Run Dev**: `npm run dev` — Starts the Express backend server with live file hot-reloads using `tsx`.
- **Compile Build**: `npm run build` — Compiles the client React assets into `dist/`, and bundles the TypeScript backend into a standalone CommonJS file (`dist/server.cjs`) using `esbuild`.
- **Production Start**: `npm run start` — Boots up the compiled, standalone production bundle on your environment.
- **Run Tests**: `npm run test` — Runs automated test suites.
- **Lint Check**: `npm run lint` — Validates code against strict TypeScript type safety standards.

---

## 🛡️ API Endpoints Summary

The server exposes a fully documented, REST-compliant API under `/api/*`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user and generate a unique 2FA secret token. | No |
| `POST` | `/api/auth/login` | Step 1: Validate password credentials. | No |
| `POST` | `/api/auth/verify-2fa` | Step 2: Validate the one-time passcode to issue a session token. | No |
| `POST` | `/api/chat` | Send a support message to Vaakai and receive an AI-powered answer. | Yes (JWT) |
| `GET` | `/api/chat/history` | Retrieve historical support sessions for the active agent. | Yes (JWT) |
| `POST` | `/api/feedback` | Log CSAT scores, helpfulness ratings, and qualitative feedback. | Yes (JWT) |
| `GET` | `/api/analytics` | Fetch cumulative support metrics and tickets for management. | Yes (JWT) |

---

## 🤝 Contributing

We welcome community contributions to make Vaakai even more secure and robust!
1. Fork this repository.
2. Create a new branch: `git checkout -b feature-my-improvement`.
3. Commit your changes: `git commit -m "feat: add beautiful theme variants"`.
4. Push to your branch: `git push origin feature-my-improvement`.
5. Open a **Pull Request** explaining your enhancements.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to adapt and scale!
