import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { Transform } from 'stream';

// Константы
const CHAT_VERSION = "0.23.2024102903";
const VSCODE_VERSION = "1.95.0";
const API_VERSION = "2023-07-07";
const INTEGRATION_ID = "vscode-chat";
const ORGANIZATION = "github-copilot";
const HOST = "api.githubcopilot.com";

// Загрузка HTML для /token
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const tokenHtml = fs.readFileSync(path.join(__dirname, 'tointegrate/get_copilot_token.html'), 'utf-8');

// Обработка OPTIONS запросов
const handleOPTIONS = (res) => {
    res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    });
    res.end();
};

// Генерация заголовков
const makeHeaders = async (token) => {
    const createSha256Hash = (input) => {
        return crypto.createHash('sha256').update(input).digest('hex');
    };
    return {
        "Host": HOST,
        "Connection": "keep-alive",
        "Authorization": `Bearer ${token}`,
        "Copilot-Integration-Id": INTEGRATION_ID,
        "Editor-Plugin-Version": `copilot-chat/${CHAT_VERSION}`,
        "Editor-Version": `vscode/${VSCODE_VERSION}`,
        "Openai-Intent": "conversation-panel",
        "Openai-Organization": ORGANIZATION,
        "User-Agent": `GitHubCopilotChat/${CHAT_VERSION}`,
        "Vscode-Machineid": createSha256Hash(token),
        "Vscode-Sessionid": `${crypto.randomUUID()}${Date.now()}`,
        "X-Github-Api-Version": API_VERSION,
        "X-Request-Id": crypto.randomUUID(),
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
    };
};

// Получение токена
const getToken = async (authKey) => {
    let githubApiHost = "api.github.com";
    if (authKey.startsWith("sk-")) {
        const decoded = Buffer.from(authKey.substring(3), 'base64').toString();
        if (/^[ -~]+$/.test(decoded)) {
            authKey = decoded;
        }
    }
    if (authKey.startsWith("ccu_") || authKey.endsWith("CoCopilot")) {
        githubApiHost = "api.cocopilot.org";
    }
    
    const response = await fetch(`https://${githubApiHost}/copilot_internal/v2/token`, {
        method: "GET",
        headers: {
            "Authorization": `token ${authKey}`,
            "Host": githubApiHost,
            "Editor-Version": `vscode/${VSCODE_VERSION}`,
            "Editor-Plugin-Version": `copilot-chat/${CHAT_VERSION}`,
            "User-Agent": `GitHubCopilotChat/${CHAT_VERSION}`,
            "Accept": "*/*",
            "Accept-Encoding": "*",
        },
    });
    
    if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.token) {
        throw new Error("Token not found in response");
    }
    return data.token;
};

// Очистка ответов
const clean = (str) => {
    let json;
    try {
        json = JSON.parse(str);
    } catch (e) {
        console.error(e);
        return str;
    }
    json.object = "chat.completion";
    delete json.prompt_filter_results;
    json.choices.forEach((item) => {
        delete item.content_filter_results;
    });
    return JSON.stringify(json);
};

const cleanLine = (str) => {
    if (str.startsWith("data: ")) {
        let json;
        try {
            json = JSON.parse(str.substring(6));
        } catch (e) {
            if (str !== "data: [DONE]") {
                console.error(e);
            }
            return str;
        }
        if (json.choices.length === 0) return;
        json.object = "chat.completion.chunk";
        json.choices.forEach((item) => {
            delete item.content_filter_offsets;
            delete item.content_filter_results;
            for (const key in item.delta) {
                if (item.delta[key] === null) delete item.delta[key];
            }
        });
        return "data: " + JSON.stringify(json);
    }
};

// Новые экспортируемые функции
const handleToken = async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(tokenHtml);
};

const handleCorsProxy = async (req, res) => {
    if (!req.query.url?.startsWith("https://")) {
        res.status(400).json({ error: "Invalid URL" });
        return;
    }

    try {
        const proxyResponse = await fetch(req.query.url, {
            method: req.method,
            headers: req.headers,
            body: req.body
        });
        
        res.writeHead(proxyResponse.status, {
            ...proxyResponse.headers,
            "Access-Control-Allow-Origin": "*",
        });
        proxyResponse.body.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const chatCompletions = async (req, res) => {
    try {
        if (req.method === "OPTIONS") {
            handleOPTIONS(res);
            return;
        }

        let authKey = process.env.COPILOT_API_KEY;
        if (!authKey) {
            throw new Error('COPILOT_API_KEY not found');
        }

        let token = await getToken(authKey);
        const headers = await makeHeaders(token);

        const response = await fetch('https://api.githubcopilot.com/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error(`Copilot API error: ${response.status}`);
        }

        if (response.headers.get("Transfer-Encoding") === "chunked") {
            res.setHeader("Content-Type", "text/event-stream");
            response.body
                .pipe(new Transform({
                    transform(chunk, encoding, callback) {
                        const cleaned = cleanLine(chunk.toString());
                        if (cleaned) {
                            callback(null, cleaned + "\n\n");
                        } else {
                            callback();
                        }
                    }
                }))
                .pipe(res);
        } else {
            const text = await response.text();
            res.end(clean(text));
        }

    } catch (error) {
        console.error(`Error in Copilot chat completions:`, error);
        res.status(500).json({ error: error.message });
    }
};

const embeddings = async (req, res) => {
    try {
        res.status(501).json({ error: "Not implemented" });
    } catch (error) {
        console.error(`Error in Copilot embeddings:`, error);
        res.status(500).json({ error: error.message });
    }
};

const models = async (req, res) => {
    try {
        res.status(501).json({ error: "Not implemented" });
    } catch (error) {
        console.error(`Error in Copilot models:`, error);
        res.status(500).json({ error: error.message });
    }
};

export { chatCompletions, embeddings, models, handleToken, handleCorsProxy };
