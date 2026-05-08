# Mainweb IDE

A modern, cloud-based IDE for web development built with React, Monaco Editor, and Node.js.

## Features

- **Monaco Editor** - VS Code's editor core with syntax highlighting, IntelliSense, and more
- **Live Preview** - Real-time preview pane for HTML/CSS/JS
- **File Tree** - Organized file browser with folder support
- **Multi-tab Editing** - Open and edit multiple files simultaneously
- **Cloud Save** - Auto-save with manual save option (Ctrl+S)
- **Share Projects** - Generate shareable links to public projects
- **Real-time Collaboration** - Socket.io powered presence and file sync
- **OAuth Authentication** - Sign in with GitHub or Google

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Editor | Monaco Editor |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth) |
| File Storage | AWS S3 |
| Real-time | Socket.io |

## Project Structure

```
mainweb-ide/
├── apps/
│   ├── api/          # Node.js backend
│   └── web/          # React frontend
├── packages/
│   └── shared/       # Shared TypeScript types
├── turbo.json        # Build orchestration
└── package.json     # Workspace root
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (optional, for file storage)
- GitHub OAuth App

### Setup

1. **Clone and install dependencies:**
```bash
cd mainweb-ide
npm install
```

2. **Configure environment:**
```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your database URL, OAuth credentials, etc.
```

3. **Database setup:**
```bash
cd apps/api
npx prisma db push
npx prisma generate
```

4. **Run development servers:**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Environment Variables

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mainweb_ide
AUTH_SECRET=your-secret-here
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### OAuth Setup (GitHub)

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set callback URL to: `http://localhost:3001/api/auth/callback/github`
4. Copy Client ID and Secret to your `.env`

## Development

```bash
# Run all apps
npm run dev

# Run backend only
npm run dev:api

# Run frontend only
npm run dev:web

# Database operations
npm run db:push    # Push schema changes
npm run db:studio  # Open Prisma Studio
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/me` | Current user info |
| GET/POST | `/api/projects` | List/create projects |
| GET/PUT/DELETE | `/api/projects/:id` | CRUD project |
| GET/POST | `/api/projects/:id/files` | List/create files |
| GET/PUT/DELETE | `/api/projects/:id/files/:path` | CRUD file |
| POST | `/api/projects/:id/share` | Generate share link |
| GET | `/api/share/:token` | Access shared project |

## Keyboard Shortcuts

- **Ctrl/Cmd + S** - Save current file
- **Ctrl/Cmd + B** - Toggle sidebar
- **Ctrl/Cmd + P** - Toggle preview

## License

MIT# Mainweb-IDE
# Mainweb-IDE
