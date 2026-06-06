import Fastify from 'fastify';
import cors from '@fastify/cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'counter.json');

// Load or initialize counter from disk
function loadCounter() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return data.count ?? 0;
    }
  } catch (e) {
    console.error('Failed to load counter file, starting at 0:', e.message);
  }
  return 0;
}

function saveCounter(count) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ count, updatedAt: new Date().toISOString() }, null, 2));
  } catch (e) {
    console.error('Failed to save counter file:', e.message);
  }
}

let visitorCount = loadCounter();

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// GET /api/count — return current count
app.get('/api/count', async (request, reply) => {
  return { count: visitorCount };
});

// POST /api/increment — increment and return new count
app.post('/api/increment', async (request, reply) => {
  visitorCount += 1;
  saveCounter(visitorCount);
  return { count: visitorCount };
});

// POST /api/reset — reset to zero (admin action)
app.post('/api/reset', async (request, reply) => {
  visitorCount = 0;
  saveCounter(visitorCount);
  return { count: visitorCount };
});

// Health check
app.get('/api/health', async () => ({ status: 'ok' }));

const port = Number(process.env.PORT) || 3001;
await app.listen({ port, host: '0.0.0.0' });
console.log(`Visitor counter server running on port ${port}`);
