import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/:token', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { shareToken: req.params.token },
      include: { owner: { select: { name: true, image: true } }, files: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found or not shared' });
    if (!project.isPublic) return res.status(403).json({ error: 'This project is not publicly accessible' });

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      files: project.files,
      owner: project.owner,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error('Share access error:', error);
    res.status(500).json({ error: 'Failed to access shared project' });
  }
});

export default router;