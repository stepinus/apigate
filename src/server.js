import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import * as copilotApi from './modules/copilot.js';
import * as gigaChatApi from './modules/gigaChat.js';
import * as openrouterApi from './modules/openrouter.js';


const app = express();
const server = http.createServer(app);

// Middleware to parse JSON and raw body
app.use(express.json());
app.use(express.text({ type: '*/*' }));
// Enable CORS
app.use(cors());

class SseHelper {
    static sse(res, data) {
        if (!res.headersSent) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
            });
        }

        const payload = `data: ${JSON.stringify(data)}\n\n`;
        res.write(payload);
    }
}

// SSE middleware
const sseMiddleware = (req, res, next) => {
    res.sse = (data) => SseHelper.sse(res, data);
    next();
};

// Apply SSE middleware to all routes
app.use(sseMiddleware);

// Array of prefixes and their corresponding endpoint modules
const prefixes = [
    { name: 'copilot', module: copilotApi },
    { name: 'giga', module: gigaChatApi },
    { name: 'openrouter', module: openrouterApi },
];

// Set up routes for each prefix
prefixes.forEach(({ name, module, allRoutes }) => {
    const basePath = `/${name}/v1`;
    if (allRoutes) {
        app.use(basePath, module.handleRedirect);
    } else {
        app.post(`${basePath}/chat/completions`, module.chatCompletions);
        app.post(`${basePath}/embeddings`, module.embeddings);
        app.get(`${basePath}/models`, module.models);
    }
});

app.use('/', express.static('src/static'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.m3u8') || path.endsWith('.m3u')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setheader('Access-Control-Allow-Origin', "*");
    } else if (path.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/MP2T');
      }
    }
  }));

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
