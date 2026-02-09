<div align="center">

# 🌐 Open Ground 共鸣场

### *Open Happiness, Spark Resonance*

**Hackathon Track: 🧠 Marathon Agent**

[![Made with Gemini](https://img.shields.io/badge/Made%20with-Gemini%203%20Pro-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 🎯 What is Open Ground?

An **autonomous urban mission orchestrator** that transforms everyday observations into **collaborative micro-missions** between strangers. Unlike simple prompt wrappers, Open Ground demonstrates true **agentic capabilities**:

| Feature | Description |
|---------|-------------|
| 🔧 **Multi-step Tool Orchestration** | Agent chains: location → weather → time → nearby search |
| 📸 **Photo Verification Loops** | Gemini Vision analyzes completion photos & provides feedback |
| 🔄 **Self-Correction** | Adapts missions when conditions change (weather, time) |
| 💭 **Agent Transparency** | Real-time thought streaming visible in UI |

---

## 🚀 Demo Flow

```
1. User observes → "There's a faded bulletin board near the cafe"
2. Agent gathers context → 📍 Location → 🌤️ Weather → ⏰ Time → 🔍 Nearby
3. Agent reasons → Plans adaptive multi-step mission
4. Mission generated → With verification criteria & secret code
5. Photo verification → Gemini analyzes completion
6. Self-correction → Adapts if conditions change
```

---

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Open Ground App                    │
├─────────────────────────────────────────────────────┤
│  AgentMission.tsx     │  Real-time thought streaming │
│  agentOrchestrator.ts │  Multi-step tool execution   │
│  tools.ts             │  Location/Weather/Time APIs  │
│  geminiService.ts     │  Gemini 3 Flash integration  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Gemini 3 Flash API    │
              │  • JSON Schema output   │
              │  • Vision analysis      │
              │  • System instructions  │
              └─────────────────────────┘
```

---

## 📦 Key Files

| File | Purpose |
|------|---------|
| `services/agentOrchestrator.ts` | Core agent with tool calls, verification, adaptation |
| `services/agentTypes.ts` | TypeScript types for agent state |
| `services/tools.ts` | Real APIs: Browser Geolocation, Open-Meteo weather, OpenStreetMap |
| `components/AgentMission.tsx` | Agent transparency UI with thought streaming |

---

## 🏃 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key in .env.local
VITE_GEMINI_API_KEY=your_api_key_here

# 3. Run the app
npm run dev
```

## ☁️ Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variable: `VITE_GEMINI_API_KEY`
4. Deploy!

---

## 🎪 Why Marathon Agent Track?

| Criteria | Our Implementation |
|----------|-------------------|
| **Multi-step tool calls** | ✅ 4+ chained tools per mission |
| **Agentic loop** | ✅ Plan → Execute → Verify → Adapt |
| **Self-correction** | ✅ Weather/time adaptation |
| **Long-running state** | ✅ Mission state persisted across steps |
| **Visible reasoning** | ✅ Thoughts streamed to UI |

---

## 🌟 Inspired By

- **Coca-Cola's "Open Happiness"** philosophy
- **PERMA model** of positive psychology
- **Urban acupuncture** design methodology

---

<div align="center">

*Every micro-collision makes our city less of an island. Let's create joy together.*

</div>
