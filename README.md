# Amistada

AI-powered social matching platform that connects people through personality analysis, vector similarity, and meaningful conversations. Features real-time chat, AI-facilitated introductions, and personality archetypes.

## Features

- **Vector-based matching** — pgvector embeddings find genuinely compatible people based on interests, personality, and communication style
- **AI onboarding** — conversational AI (Amistala) learns about you through natural chat, infers interests and personality archetype
- **Smart introductions** — AI crafts personalized intros highlighting shared interests between matched users
- **Real-time chat** — Supabase Realtime powers instant messaging in AI rooms and introduction groups
- **Wingman AI** — detects stalled conversations and intervenes with thoughtful prompts
- **Wrapped & Roasts** — personalized stats analysis and humorous AI-generated roasts of your chat patterns
- **8 personality archetypes** — The Poet, Architect, Healer, Explorer, Jester, Sage, Rebel, Creator
- **Progressive profile reveal** — gradually learn about your match as conversations deepen
- **Slash commands** — `/next`, `/wrapped`, `/roast`, `/catchup`, `/help` and more
- **Monetization ready** — gift system, feature credits, reputation/kudos tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| 3D | Three.js, React Three Fiber/Drei |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (email + Google OAuth) |
| AI | OpenAI gpt-4o-mini, text-embedding-3-small |
| Testing | Vitest (unit), Playwright (E2E) |

## Project Structure

```
Amistada/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing/home page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── (app)/                      # Authenticated app routes
│   │   │   ├── layout.tsx              # App layout
│   │   │   ├── layout-client.tsx       # Client layout wrapper
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx            # User profile
│   │   │   │   └── actions.ts          # Profile actions
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx            # Rooms list
│   │   │   │   └── [roomId]/
│   │   │   │       ├── page.tsx        # Room detail
│   │   │   │       ├── page-client.tsx # Room client component
│   │   │   │       └── actions.ts      # Room actions
│   │   │   └── ...
│   │   ├── (auth)/                     # Auth routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── actions.ts
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts            # Auth callback handler
│   │   ├── actions/
│   │   │   ├── match.ts                # Matching actions
│   │   │   ├── introduce.ts            # Introduction actions
│   │   │   ├── roast.ts                # Roast actions
│   │   │   ├── monetization.ts         # Monetization actions
│   │   │   ├── wingman.ts              # Wingman actions
│   │   │   └── wrapped.ts              # Wrapped actions
│   │   └── test-page/
│   │       └── page.tsx
│   └── ...
├── package.json
├── next.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run Vitest tests
```

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
# Required: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY, etc.

# Run development server
npm run dev
```

## Architecture

Uses **Next.js Server Actions** instead of REST APIs. All backend logic (matching, AI, monetization) runs as server actions. Supabase handles authentication, database, and real-time message delivery.

**Matching flow:** User chats with AI → interests/persona inferred → embedding generated → pgvector cosine similarity finds matches → AI creates introduction room with personalized opener.

## Related

Sister project to [Kindred](https://github.com/preyam2002/kindred) — Kindred focuses on media taste compatibility, Amistada explores AI-facilitated personality matching.

## Author

**Preyam** - [GitHub](https://github.com/preyam2002)

## License

MIT
