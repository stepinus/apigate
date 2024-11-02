import fs from 'fs';
import path from 'path';

const HLS_DIR = path.join(process.cwd(), 'src/static/play');

export const streamHls = (req, res) => {
    console.log('Request params:', req.params);
    console.log('Requested file:', req.params.file);
    const fileName = req.params.file;
    const filePath = path.join(HLS_DIR, fileName);
    console.log('Full file path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Set appropriate headers based on file type
    if (fileName.endsWith('.m3u8')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (fileName.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/MP2T');
    }

    // Enable CORS for video streaming
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Create read stream and pipe to response
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    // Handle errors
    stream.on('error', (error) => {
        console.error(`Error streaming file: ${error}`);
        if (!res.headersSent) {
            res.status(500).send('Error streaming file');
        }
    });
};
