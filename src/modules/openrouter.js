import OpenAI from 'openai';
if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
}
if (!process.env.OPENROUTER_API_BASE) {
    throw new Error('OPENROUTER_API_BASE environment variable is not set');
}
const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_API_BASE,
});

const chatCompletions = async (req, res) => {
    try {
        const stream = await openrouter.chat.completions.create({...req.body});
        for await (const chunk of stream) {
            res.sse(chunk);
        }
        // res.sse('[DONE]');
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error in OpenRouter chat completions:', error);
        res.status(500).json({ error: 'An error occurred during the OpenRouter API call' });
    }
};const embeddings = async (req, res) => {
    try {
        const response = await openrouter.embeddings.create({
            model: "text-embedding-ada-002",
            input: req.body,
        });
        res.json(response);
    } catch (error) {
        console.error(`Error in Copilot embeddings:`, error);
        res.status(500).json({ error: 'An error occurred during the Copilot API call' });
    }
};

const models = async (req, res) => {
    try {
        const response = await openrouter.models.list();
        res.json(response);
    } catch (error) {
        console.error(`Error in Copilot models:`, error);
        res.status(500).json({ error: 'An error occurred during the Copilot API call' });
    }
};

export { chatCompletions, embeddings, models };
