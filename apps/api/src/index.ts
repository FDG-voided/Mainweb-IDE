import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { auth } from './auth/auth';
import projectsRouter from './routes/projects';
import filesRouter from './routes/files';
import shareRouter from './routes/share';
import { initSocket } from './socket/socket';
import { prisma } from './lib/prisma';

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/api/auth/session', async (req, res) => {
  const session = await auth();
  res.json(session);
});

app.post('/api/auth/callback/:provider', (req, res) => {
  const { provider } = req.params;
  const { code } = req.body;

  const redirectUri = `${process.env.AUTH_URL || 'http://localhost:3001'}/api/auth/callback/${provider}`;
  const authUrl = provider === 'github'
    ? `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`
    : '';

  if (!code) {
    res.redirect(authUrl);
  } else {
    res.json({ success: true, code });
  }
});

async function attachUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = await auth();
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as any).user = session.user;
  next();
}

app.use('/api/projects', attachUser, projectsRouter);
app.use('/api/projects/:projectId/files', attachUser, filesRouter);
app.use('/api/share', shareRouter);

app.get('/api/me', async (req, res) => {
  const session = await auth();
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

async function start() {
  await prisma.$connect;
  initSocket(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`Mainweb IDE API running on http://localhost:${PORT}`);
    console.log(`Auth URL: http://localhost:${PORT}/api/auth`);
  });
}

start().catch(console.error);