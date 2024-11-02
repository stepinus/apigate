import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const testHlsStreaming = async (baseUrl = 'http://localhost:3000') => {
    try {
        console.log('🚀 Начинаем тестирование HLS стриминга...\n');
        
        // Тест 1: Проверка master.m3u8
        console.log('📝 Тестируем master.m3u8...');
        const masterResponse = await fetch(`${baseUrl}/hls/stream/master.m3u8`);
        if (!masterResponse.ok) {
            throw new Error(`Ошибка получения master.m3u8: ${masterResponse.status}`);
        }
        
        const contentType = masterResponse.headers.get('content-type');
        if (!contentType?.includes('application/vnd.apple.mpegurl')) {
            throw new Error(`Неверный Content-Type: ${contentType}`);
        }
        
        const masterContent = await masterResponse.text();
        if (!masterContent.includes('720p.m3u8') || !masterContent.includes('1080p.m3u8')) {
            throw new Error('master.m3u8 не содержит ссылок на файлы качества');
        }
        console.log('✅ master.m3u8 тест пройден\n');

        // Тест 2: Проверка плейлистов качества
        console.log('📝 Тестируем плейлисты качества...');
        const qualities = ['720p', '1080p'];
        for (const quality of qualities) {
            const playlistResponse = await fetch(`${baseUrl}/hls/stream/${quality}.m3u8`);
            if (!playlistResponse.ok) {
                throw new Error(`Ошибка получения ${quality}.m3u8: ${playlistResponse.status}`);
            }
            
            const playlistContent = await playlistResponse.text();
            if (!playlistContent.includes('.ts')) {
                throw new Error(`${quality}.m3u8 не содержит TS сегментов`);
            }
        }
        console.log('✅ Плейлисты качества тест пройден\n');

        // Тест 3: Проверка TS сегментов
        console.log('📝 Тестируем TS сегменты...');
        const tsResponse = await fetch(`${baseUrl}/hls/stream/720p_000.ts`);
        if (!tsResponse.ok) {
            throw new Error(`Ошибка получения TS сегмента: ${tsResponse.status}`);
        }
        
        const tsContentType = tsResponse.headers.get('content-type');
        if (!tsContentType?.includes('video/MP2T')) {
            throw new Error(`Неверный Content-Type для TS: ${tsContentType}`);
        }
        console.log('✅ TS сегменты тест пройден\n');

        // Тест 4: Проверка CORS
        console.log('📝 Тестируем CORS...');
        const corsHeader = masterResponse.headers.get('access-control-allow-origin');
        if (corsHeader !== '*') {
            throw new Error(`Неверные CORS заголовки: ${corsHeader}`);
        }
        console.log('✅ CORS тест пройден\n');

        console.log('🎉 Все тесты успешно пройдены!');

    } catch (error) {
        console.error('❌ Тест провален:', error.message);
        throw error;
    }
};

// Запуск тестов
testHlsStreaming()
    .then(() => console.log('Тестирование завершено'))
    .catch(error => console.error('Ошибка при тестировании:', error));