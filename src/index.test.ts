import request from 'supertest';
import express from 'express';
import { Server } from 'http';

const app = express();
let server: Server;

beforeAll((done) => {
  server = app.listen(3000, () => {
    console.log('Test server running on port 3000');
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendEvent('Connected to server');

  const intervalId = setInterval(() => {
    sendEvent(`Current time: ${new Date().toLocaleTimeString()}`);
  }, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

describe('GET /events', () => {
  it('should respond with event stream', async () => {
    const response = await request(app).get('/events');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/event-stream');
  });
});
import request from 'supertest';
import { Server } from 'http';
import app from './index'; // Импортируйте ваше приложение

let server: Server;

beforeAll((done) => {
  server = app.listen(4000, () => {
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    done();
  });
});

describe('GET /events', () => {
  it('should respond with event stream', async () => {
    const response = await request(server).get('/events');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/event-stream');
  });
});
