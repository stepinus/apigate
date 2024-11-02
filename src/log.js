import fs from 'fs';
import path from 'path';

// Функция для записи данных в файл в папке logs
const logData = async (data) => {
    const logsDir = path.join('.', 'logs');
    
    // Убедимся, что папка logs существует
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    // Создаем уникальное имя файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logsDir, `log-${timestamp}.txt`);

    if(typeof data === 'object') {
        data = JSON.stringify(data);
    }
    // Записываем данные в файл
    fs.writeFileSync(logFile, data, 'utf8');
};

// Пример использования
const exampleData = "Пример данных для логирования";
logData(exampleData).then(() => {
    console.log('Данные успешно записаны в лог');
}).catch((error) => {
    console.error('Ошибка при записи данных в лог:', error);
});

export default logData;