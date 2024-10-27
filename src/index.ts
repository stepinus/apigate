import express from 'express';

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
