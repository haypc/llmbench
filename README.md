# LLMBench 🚀

> Production-ready AI model testing, benchmarking & red-teaming platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

LLMBench is a comprehensive platform for testing, comparing, evaluating, benchmarking, and red-teaming AI language models. It supports 15+ AI providers and offers 20 functional modules.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo |
| Frontend | Next.js 14, tRPC, TailwindCSS |
| Backend API | Express.js, tRPC |
| Queue | BullMQ + Redis |
| Database | PostgreSQL + Prisma + pgvector |
| Analytics | ClickHouse |
| Search | Meilisearch |
| Storage | S3 / MinIO |
| Auth | NextAuth.js |
| Billing | Stripe |

## AI Providers

- OpenAI (GPT-4o, o1, GPT-4-turbo)
- Anthropic (Claude 3.5 Sonnet, Haiku, Opus)
- Google Gemini (1.5 Pro, Flash)
- Mistral AI (Large, Medium, Codestral)
- Groq (Llama 3.3, Mixtral)
- OpenRouter (100+ models)
- Ollama (local models)

## Features

- 📊 **Benchmarking** — Run prompts across multiple models side-by-side
- 🎯 **Evaluations** — Automatic, LLM-as-judge, and human evaluation
- 🏟️ **Arena** — ELO-rated head-to-head model comparisons
- 🔴 **Red Teaming** — Automated adversarial attack testing
- 📚 **RAG Testing** — Document upload, embedding, and retrieval evaluation
- 🤖 **Agent Testing** — Multi-step agent execution and tracing
- 📈 **Analytics** — Cost tracking, latency analysis, quality metrics
- 💳 **Billing** — Stripe integration with usage quotas
- 🔑 **API Keys** — Programmatic access
- 👥 **Teams** — Multi-workspace collaboration

## Quick Start

```bash
# Clone and install
git clone https://github.com/haypc/llmbench.git
cd llmbench
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys and database URLs

# Start services (Docker)
docker-compose up -d postgres redis meilisearch

# Run database migrations
pnpm db:migrate

# Seed models
pnpm db:seed

# Start development
pnpm dev
```

## Project Structure

```
llmbench/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   ├── api/          # Express + tRPC backend
│   └── worker/       # BullMQ job workers
├── packages/
│   ├── ai/           # AI provider integrations
│   ├── db/           # Prisma schema & client
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Environment & constants
│   └── utils/        # Shared utilities
└── turbo.json
```

## Modules

1. Prompt Library & Versioning
2. Model Benchmarking Runner
3. Automatic Evaluation Engine
4. LLM-as-Judge Evaluation
5. Human Evaluation & Rating
6. ELO Arena (head-to-head)
7. Red Team Attacks
8. RAG Pipeline Testing
9. Agent Execution & Tracing
10. Dataset Management
11. Analytics Dashboard
12. Cost Tracking
13. Team Management
14. API Key Management
15. Webhook Integrations
16. Billing & Subscriptions
17. Notifications
18. Audit Logging
19. Admin Panel
20. CI/CD Integration

## License

MIT © 2026 LLMBench
