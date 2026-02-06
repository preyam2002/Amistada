# Amistada

A 3D social platform experiment exploring spatial social interactions with Three.js and Next.js.

## Tech Stack

- **Framework**: Next.js 16.0.5 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4
- **3D Graphics**: Three.js (@react-three/fiber 9.4.2, @react-three/drei 10.7.7)
- **Animations**: Framer Motion 12.23.24
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI 6.9.1
- **Image Generation**: html-to-image 1.11.13
- **Testing**: Vitest 4.0.15
- **Icons**: Lucide React 0.555.0
- **Utilities**: clsx, tailwind-merge

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

## Status

**Early Development** - This project is in the experimental/WIP phase. Core infrastructure is being built.

## Relationship to Kindred

Amistada shares DNA with [Kindred](https://github.com/preyam2002/kindred) and aims to provide a 3D spatial layer on top of the taste-matching social graph. While Kindred focuses on media taste compatibility, Amistada explores how people can interact in shared virtual spaces.

## Author

**Preyam** - [GitHub](https://github.com/preyam2002)

## License

MIT
