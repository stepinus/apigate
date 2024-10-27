import express from 'express';
import cors from 'cors'; // Добавляем импорт

const app = express();
const port = 3000;

app.use(cors()); // Добавляем middleware

app.get('/', (req, res) => {
  res.json({ message: 'Привет мир!' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
