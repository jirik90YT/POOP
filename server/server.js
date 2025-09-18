import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { io } from 'socket.io-client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PO_WS = process.env.PO_WS || 'https://pocketoption.com';
const SSID = process.env.PO_SSID || '';
const IS_DEMO = (process.env.PO_DEMO === '1');

const app = express();
app.use(cors());
app.use(express.json());

const clientDist = path.resolve(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
}

let latestCandlesBySymbol = {};
let lastSignal = { kind: '⚪ NEKUPUJ', symbol: null, mode: 'NORMAL', reason: 'init', time: Date.now() };
let active = { symbol: 'EURUSD', timeframe: 'M1', mode: 'NORMAL' };

let socket = null;

function connect() {
  console.log('[IO] Connecting to', PO_WS);
  socket = io(PO_WS, {
    transports: ['polling'],
    extraHeaders: {
      'Origin': 'https://pocketoption.com',
      'User-Agent': 'Mozilla/5.0'
    }
  });

  socket.on('connect', () => {
    console.log('[IO] connected');
    if (SSID) socket.emit('auth', SSID);
    subscribeActive();
  });

  socket.on('connect_error', (err) => {
    console.log('[IO] connect_error:', err.message);
  });

  socket.on('candles', (body) => {
    if (body && body.instrument && Array.isArray(body.candles)) {
      const mode = body.otc ? 'OTC' : 'NORMAL';
      const key = `${body.instrument}__${mode}`;
      latestCandlesBySymbol[key] = body.candles.slice(-200);
    }
  });
}

function subscribeActive() {
  try {
    socket.emit('subscribe', { instrument: active.symbol, timeframe: active.timeframe, otc: active.mode === 'OTC' ? 1 : 0 });
    console.log('[IO] subscribe', active);
  } catch (e) {
    console.warn('[IO] subscribe failed', e.message);
  }
}

app.get('/health', (_req, res) => res.json({ ok: true, active, lastSignal }));

app.listen(PORT, () => {
  console.log('Server listening on :' + PORT);
  connect();
});
