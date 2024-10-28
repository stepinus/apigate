import OpenAI from 'openai';
if (!process.env.COPILOT_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}
if (!process.env.COPILOT_API_BASE) {
    throw new Error('OPENAI_API_BASE environment variable is not set');
}
const copilot = new OpenAI({
    apiKey: process.env.COPILOT_API_KEY,
    baseURL: process.env.COPILOT_API_BASE,
});

const chatCompletions = async (req, res) => {
    console.log(req.body);
    try {
        const stream = await copilot.chat.completions.create({
            model: req.body.model,
            stream: true,
            messages: req.body.messages,
            temperature: req.body.temperature,
            stream_options: req.body.stream_options,
        });

        for await (const chunk of stream) {
            res.sse(chunk);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error(`Error in Copilot chat completions:`, error);
        res.status(500).json({ error: 'An error occurred during the Copilot API call' });
    }
};

const embeddings = async (req, res) => {
    try {
        const response = await copilot.embeddings.create({
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
        const response = await copilot.models.list();
        res.json(response);
    } catch (error) {
        console.error(`Error in Copilot models:`, error);
        res.status(500).json({ error: 'An error occurred during the Copilot API call' });
    }
};

export { chatCompletions, embeddings, models };
