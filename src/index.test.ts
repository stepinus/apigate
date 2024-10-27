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
