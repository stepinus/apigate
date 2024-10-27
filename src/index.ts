import http from 'http';

const requestListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url === '/') {
    console.log('Received request at root endpoint');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
};

const server = http.createServer(requestListener);

export const init = async () => {
  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
};

init();

