import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import type { AuthenticatedRequest } from '../middleware/types';

const router = Router({ mergeParams: true });

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id && !project.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const files = await prisma.projectFile.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { path: 'asc' },
    });

    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id) return res.status(403).json({ error: 'Access denied' });

    const { path, content, language } = req.body;
    if (!path) return res.status(400).json({ error: 'File path is required' });

    const file = await prisma.projectFile.create({
      data: {
        projectId: req.params.projectId,
        path,
        content: content || '',
        language: language || detectLanguage(path),
      },
    });

    await prisma.project.update({ where: { id: req.params.projectId }, data: {} });

    res.status(201).json(file);
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

router.get('/:path(*)', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id && !project.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const file = await prisma.projectFile.findUnique({
      where: { projectId_path: { projectId: req.params.projectId, path: req.params.path } },
    });

    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
});

router.put('/:path(*)', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id) return res.status(403).json({ error: 'Access denied' });

    const { content, language } = req.body;
    const file = await prisma.projectFile.upsert({
      where: { projectId_path: { projectId: req.params.projectId, path: req.params.path } },
      update: { content, language },
      create: {
        projectId: req.params.projectId,
        path: req.params.path,
        content: content || '',
        language: language || detectLanguage(req.params.path),
      },
    });

    res.json(file);
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

router.delete('/:path(*)', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id) return res.status(403).json({ error: 'Access denied' });

    await prisma.projectFile.delete({
      where: { projectId_path: { projectId: req.params.projectId, path: req.params.path } },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    html: 'html', css: 'css', scss: 'scss', json: 'json', md: 'markdown',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java', c: 'c',
    cpp: 'cpp', cs: 'csharp', php: 'php', sql: 'sql', sh: 'shell', yml: 'yaml',
  };
  return map[ext || ''] || 'plaintext';
}

export default router;