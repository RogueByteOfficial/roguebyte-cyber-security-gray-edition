import express, { Request, Response } from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db/database.ts';
import authRoutes from './src/server/routes/authRoutes.ts';
import missionRoutes from './src/server/routes/missionRoutes.ts';
import labRoutes from './src/server/routes/labRoutes.ts';
import progressRoutes from './src/server/routes/progressRoutes.ts';
import instructorRoutes from './src/server/routes/instructorRoutes.ts';
import adminRoutes from './src/server/routes/adminRoutes.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const settings = db.getSettings();
  const activeLabs = db.getLabSessions().filter(s => s.status === 'RUNNING').length;
  res.json({
    status: 'HEALTHY',
    service: 'RogueByte Cyber Lab Platform',
    version: '1.0.0-black-gray',
    owner: 'SidoDev-Dz',
    timestamp: new Date().toISOString(),
    database: 'CONNECTED_PERSISTENT',
    activeLabsCount: activeLabs,
    maintenanceMode: settings.maintenanceMode,
  });
});

// Mount versioned REST API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/lab-sessions', labRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/instructor', instructorRoutes);
app.use('/api/v1/admin', adminRoutes);

async function startServer() {
  if (!isProd) {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[RogueByte] Vite development middleware attached.');
  } else {
    // Serve static frontend assets in production mode
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[RogueByte] Production static serving enabled from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  ROGUEBYTE CYBER LAB (Black Gray Edition v1)`);
    console.log(`  Architect & Creator: SidoDev-Dz`);
    console.log(`  Server running on http://0.0.0.0:${PORT}`);
    console.log(`  Health Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});
