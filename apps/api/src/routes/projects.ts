import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import type { AuthenticatedRequest } from '../middleware/types';

const router = Router();

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        ownerId: req.user!.id,
        name,
        description: description || null,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user!.id },
      include: { _count: { select: { files: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { files: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.user!.id && !project.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id) return res.status(403).json({ error: 'Access denied' });

    const { name, description, isPublic } = req.body;
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, isPublic },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id) return res.status(403).json({ error: 'Access denied' });

    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

router.post('/:id/share', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user!.id) return res.status(403).json({ error: 'Access denied' });

    const shareToken = uuidv4();
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { shareToken, isPublic: true },
    });

    res.json({ shareUrl: `/share/${shareToken}`, shareToken: updated.shareToken });
  } catch (error) {
    console.error('Share project error:', error);
    res.status(500).json({ error: 'Failed to share project' });
  }
});

export default router;