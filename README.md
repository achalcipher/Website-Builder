<div align="center">

<img src="client/src/assets/logo.svg" alt="AchalCipher Logo" width="80" />

# AchalCipher — AI Website Builder

**Describe your idea. Get a fully functional website in seconds.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com)

</div>

---

## What is AchalCipher?

AchalCipher is a full-stack AI-powered website builder. Users type a prompt, and the platform generates a complete, styled, standalone HTML website using AI. Projects can be revised via chat, rolled back to previous versions, published to a community gallery, and previewed live — all in the browser.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│   React 19 + TypeScript + Vite + TailwindCSS v4                 │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Home    │  │ Projects │  │Community │  │   Pricing     │  │
│  │ (Prompt) │  │(Editor + │  │(Gallery) │  │ (Stripe Plans)│  │
│  │          │  │ Sidebar) │  │          │  │               │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / REST API (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Express + Node)                     │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Auth Layer │  │  User Routes │  │    Project Routes      │ │
│  │ (Better Auth│  │  /api/user/* │  │    /api/project/*      │ │
│  │  + Sessions)│  │              │  │                        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              OpenAI-Compatible AI Layer                  │  │
│  │         (kwaipilot/kat-coder-pro via OpenRouter)         │  │
│  │   Prompt Enhancement  →  Code Generation (HTML+Tailwind) │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Prisma ORM + PostgreSQL                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow

```
┌─────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User   │────▶│  Sign In /   │────▶│  Enter Prompt   │────▶│  AI Generates│
│ Visits  │     │  Sign Up     │     │  on Home Page   │     │  Website Code│
└─────────┘     └──────────────┘     └─────────────────┘     └──────┬───────┘
                                                                     │
                    ┌────────────────────────────────────────────────┘
                    ▼
             ┌─────────────┐
             │  Project    │
             │  Editor     │◀──────────────────────────────────────┐
             │  Opens      │                                       │
             └──────┬──────┘                                       │
                    │                                              │
        ┌───────────┼───────────────┐                             │
        ▼           ▼               ▼                             │
  ┌──────────┐ ┌─────────┐  ┌────────────┐                       │
  │  Live    │ │  Chat   │  │  Version   │                       │
  │ Preview  │ │Revision │  │  History / │                       │
  │(iframe)  │ │(AI Edit)│  │  Rollback  │───────────────────────┘
  └──────────┘ └────┬────┘  └────────────┘
                    │
                    ▼
             ┌─────────────┐     ┌──────────────┐
             │  Publish to │────▶│  Community   │
             │  Community  │     │  Gallery     │
             └─────────────┘     └──────────────┘
```

---

## AI Generation Pipeline

```
User Prompt
    │
    ▼
┌───────────────────────────────────────────┐
│  Step 1: Prompt Enhancement               │
│                                           │
│  System: "You are a prompt enhancement   │
│  specialist..."                           │
│                                           │
│  Input:  Raw user message                 │
│  Output: Specific, technical prompt       │
└───────────────────┬───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│  Step 2: Code Generation                  │
│                                           │
│  System: "You are an expert web dev..."  │
│                                           │
│  Input:  Enhanced prompt + current code   │
│  Output: Complete HTML + Tailwind CSS     │
│          standalone document              │
└───────────────────┬───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│  Step 3: Sanitize & Save                  │
│                                           │
│  - Strip markdown code fences             │
│  - Save as new Version in DB              │
│  - Update WebsiteProject.current_code     │
│  - Deduct 5 credits from user             │
└───────────────────────────────────────────┘
```

---

## Database Schema

```
┌──────────────────────┐         ┌──────────────────────────┐
│         User         │         │      WebsiteProject       │
├──────────────────────┤         ├──────────────────────────┤
│ id (String PK)       │◀──┐     │ id (UUID PK)             │
│ email                │   │     │ name                     │
│ name                 │   │     │ initial_prompt           │
│ credits (default:20) │   └─────│ userId (FK)              │
│ totalCreation        │         │ current_code             │
│ emailVerified        │         │ current_version_index    │
│ createdAt            │         │ isPublished (bool)       │
│ updatedAt            │         │ createdAt / updatedAt    │
└──────────────────────┘         └────────────┬─────────────┘
         │                                    │
         │  ┌─────────────────────────────────┤
         │  │                                 │
         ▼  ▼                                 ▼
┌──────────────────┐              ┌──────────────────────┐
│   Transaction    │              │      Version         │
├──────────────────┤              ├──────────────────────┤
│ id (UUID PK)     │              │ id (UUID PK)         │
│ planId           │              │ code (full HTML)     │
│ amount           │              │ description          │
│ credits          │              │ timestamp            │
│ isPaid           │              │ projectId (FK)       │
│ userId (FK)      │              └──────────────────────┘
└──────────────────┘
                                  ┌──────────────────────┐
                                  │    Conversation      │
                                  ├──────────────────────┤
                                  │ id (UUID PK)         │
                                  │ role (user/assistant)│
                                  │ content              │
                                  │ timestamp            │
                                  │ projectId (FK)       │
                                  └──────────────────────┘
```

---

## API Reference

### User Routes — `/api/user/*` (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/credits` | Get current user's credit balance |
| `POST` | `/api/user/project` | Create a new project from a prompt |
| `GET` | `/api/user/project/:projectId` | Get a single project with versions |
| `GET` | `/api/user/projects` | Get all projects for the user |
| `GET` | `/api/user/publish-toggle/:projectId` | Toggle publish/unpublish |
| `POST` | `/api/user/purchase-credits` | Initiate Stripe payment for credits |

### Project Routes — `/api/project/*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/project/revision/:projectId` | ✅ | AI revision via chat message |
| `PUT` | `/api/project/save/:projectId` | ✅ | Save manually edited code |
| `GET` | `/api/project/rollback/:projectId/:versionId` | ✅ | Rollback to a version |
| `DELETE` | `/api/project/:projectId` | ✅ | Delete a project |
| `GET` | `/api/project/preview/:projectId` | ✅ | Get project for preview |
| `GET` | `/api/project/published` | ❌ | Get all published projects |
| `GET` | `/api/project/published/:projectId` | ❌ | Get single published project |

---

## Credits System

```
New User Signup
      │
      ▼
  20 Free Credits
      │
      ├──── Create Project  ──▶  -5 credits
      │
      ├──── Make Revision   ──▶  -5 credits
      │
      └──── Purchase Plan
                │
                ├── Basic      $5   → +100 credits
                ├── Pro        $19  → +400 credits  ← Most Popular
                └── Enterprise $49  → +1000 credits
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, TailwindCSS v4 |
| Routing | React Router v7 |
| Auth | Better Auth (sessions, OAuth) |
| Backend | Node.js 24, Express |
| ORM | Prisma (PostgreSQL) |
| AI | OpenAI-compatible API (kwaipilot/kat-coder-pro) |
| Payments | Stripe (webhooks + checkout) |
| Deployment | Vercel (client + server) |

---

## Project Structure

```
site-builder/
├── client/                        # React frontend
│   ├── src/
│   │   ├── assets/                # Logo, static assets, plan config
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Top nav with credits display
│   │   │   ├── Sidebar.tsx        # Chat + version history panel
│   │   │   ├── EditorPanel.tsx    # Code editor with live preview
│   │   │   ├── ProjectPreview.tsx # Iframe preview component
│   │   │   ├── LoaderSteps.tsx    # AI generation loading steps
│   │   │   └── Footer.tsx         # Footer with nav links
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing + prompt input
│   │   │   ├── Projects.tsx       # Main editor page
│   │   │   ├── MyProjects.tsx     # User's project dashboard
│   │   │   ├── Community.tsx      # Public project gallery
│   │   │   ├── Pricing.tsx        # Plans + Stripe checkout
│   │   │   ├── Preview.tsx        # Full-screen preview
│   │   │   └── View.tsx           # Public view of published site
│   │   ├── configs/axios.ts       # Axios instance with base URL
│   │   └── lib/auth-client.ts     # Better Auth client setup
│   └── vite.config.ts
│
└── server/                        # Express backend
    ├── controllers/
    │   ├── projectController.ts   # All project CRUD + AI logic
    │   ├── userController.ts      # Credits, project creation
    │   └── stripeWebhook.ts       # Stripe payment webhook
    ├── routes/
    │   ├── userRoutes.ts
    │   └── projectRoutes.ts
    ├── lib/
    │   ├── auth.ts                # Better Auth server config
    │   └── prisma.ts              # Prisma client singleton
    ├── middlewares/auth.ts        # JWT/session protect middleware
    ├── prisma/schema.prisma       # DB schema
    └── server.ts                  # Express app entry point
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL database
- OpenRouter API key
- Stripe account (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/achalcipher/Website-Builder.git
cd Website-Builder

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

**`server/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/achalcipher
BETTER_AUTH_SECRET=your_secret_here
TRUSTED_ORIGINS=http://localhost:5173
OPENAI_API_KEY=your_openrouter_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**`client/.env`**
```env
VITE_BASEURL=http://localhost:3000
```

### 3. Database Setup

```bash
cd server
npx prisma migrate dev
```

### 4. Run

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

Client runs at `http://localhost:5173`, server at `http://localhost:3000`.

---

## Deployment

Both client and server include `vercel.json` for Vercel deployment.

```bash
# Deploy server
cd server && vercel --prod

# Deploy client
cd client && vercel --prod
```

Set all environment variables in the Vercel dashboard for each project.

---

<div align="center">

Built with ❤️ by **AchalCipher**

</div>
