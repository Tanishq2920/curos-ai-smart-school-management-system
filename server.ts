import express, { Request, Response } from 'express';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const FLASK_PORT = 5001;

let pythonProcess: ChildProcess | null = null;
let isShuttingDown = false;

async function isFlaskHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${FLASK_PORT}/api/health`, {
      signal: AbortSignal.timeout(1000)
    });
    return res.ok;
  } catch {
    return false;
  }
}

function killExistingFlask() {
  try {
    // Kill any existing backend/app.py processes to avoid port conflicts
    execSync('pkill -9 -f "python3.*backend/app.py" || true', { stdio: 'ignore' });
  } catch {}
}

function startFlaskBackend() {
  if (isShuttingDown) return;

  killExistingFlask();

  console.log('[Server] Spawning Flask backend on port', FLASK_PORT);
  pythonProcess = spawn('python3', [path.join(__dirname, 'backend', 'app.py')], {
    env: { ...process.env, FLASK_PORT: String(FLASK_PORT) },
    stdio: 'inherit'
  });

  pythonProcess.on('error', (err) => {
    console.error('[Server] Flask process spawn error:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[Server] Flask process exited (code: ${code}, signal: ${signal})`);
    pythonProcess = null;
    // Auto-restart if exited unexpectedly and not shutting down
    if (!isShuttingDown && code !== 0) {
      console.log('[Server] Restarting Flask backend in 1s...');
      setTimeout(() => {
        if (!isShuttingDown) {
          startFlaskBackend();
        }
      }, 1000);
    }
  });
}

async function waitForFlask(maxRetries = 40, intervalMs = 250): Promise<void> {
  console.log('[Server] Waiting for Flask backend to be ready on port', FLASK_PORT);
  for (let i = 0; i < maxRetries; i++) {
    if (await isFlaskHealthy()) {
      console.log('[Server] Flask backend is healthy and responding.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  console.warn('[Server] Warning: Flask backend did not respond within timeout, proceeding anyway.');
}

// Ensure child process terminates when node exits
function setupProcessCleanup() {
  const cleanup = () => {
    isShuttingDown = true;
    if (pythonProcess) {
      try {
        pythonProcess.kill('SIGTERM');
      } catch {}
    }
    killExistingFlask();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

// Proxy middleware for /api/*
app.use('/api', express.raw({ type: '*/*', limit: '10mb' }), async (req: Request, res: Response) => {
  const targetUrl = `http://127.0.0.1:${FLASK_PORT}${req.originalUrl}`;
  const hopByHopHeaders = ['content-encoding', 'transfer-encoding', 'connection', 'keep-alive', 'content-length', 'host'];

  let retries = 3;
  while (retries > 0) {
    try {
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string' && !hopByHopHeaders.includes(k.toLowerCase())) {
          headers[k] = v;
        }
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        signal: AbortSignal.timeout(12000)
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body && Buffer.isBuffer(req.body) && req.body.length > 0) {
        fetchOptions.body = req.body as unknown as BodyInit;
      }

      const backendRes = await fetch(targetUrl, fetchOptions);
      res.status(backendRes.status);

      backendRes.headers.forEach((val, key) => {
        if (!hopByHopHeaders.includes(key.toLowerCase())) {
          res.setHeader(key, val);
        }
      });

      const arrayBuffer = await backendRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      return;
    } catch (err: any) {
      retries--;
      if (retries === 0) {
        console.error(`[Server] API Proxy error for ${req.method} ${req.originalUrl}:`, err.message);
        res.setHeader('Content-Type', 'application/json');
        res.status(502).json({ error: 'Backend service temporarily unavailable. Please retry.' });
        return;
      }
      // If Flask is dead, try respawning
      if (!pythonProcess && !isShuttingDown) {
        startFlaskBackend();
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  }
});

async function startServer() {
  setupProcessCleanup();

  if (!(await isFlaskHealthy())) {
    startFlaskBackend();
    await waitForFlask();
  } else {
    console.log('[Server] Flask backend is already healthy on port', FLASK_PORT);
  }

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Smart School Management System listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
