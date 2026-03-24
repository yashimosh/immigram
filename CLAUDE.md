# Immigram

AI-powered immigration platform built with Next.js 16, Supabase, and LiteLLM AI proxy.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: LiteLLM proxy (OpenAI SDK) → llama-3.3-70b (Groq), qwen3.5:4b (Ollama), claude-sonnet (Anthropic)
- **Styling**: Tailwind CSS v4 with dark glassmorphism theme
- **Deployment**: Docker + Traefik reverse proxy

## Design System

- Background: `#06080c`
- Primary (teal): `#14b8a6`
- Accent (indigo): `#6366f1`
- Glass cards: `rgba(255,255,255,0.04)` with `backdrop-blur`
- Utility classes: `.glass`, `.glass-strong`, `.gradient-text`, `.gradient-text-teal`, `.dot-pattern`, `.glow-teal`

## Project Structure

- `app/(marketing)/` — Public landing, features, pricing, about pages
- `app/(auth)/` — Login, signup, password reset flows
- `app/(app)/` — Authenticated dashboard, cases, documents, chat, etc.
- `components/` — Shared UI and feature components
- `lib/` — Utilities, Supabase client, types, constants
- `supabase/` — Database migrations and seed data

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `docker compose up --build` — Build and run with Docker
