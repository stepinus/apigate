const chatCompletions = async (req, res) => {
    try {
        // Simulated Ollama-like API call with streaming
        console.log('GigaChat chat completion called with:', req.body);
        
        // Simulate streaming response
        const simulatedResponses = [
            'This is a ',
            'simulated ',
            'GigaChat ',
            '(Ollama-like) ',
            'streaming ',
            'response.'
        ];

        for (const chunk of simulatedResponses) {
            res.sse({ choices: [{ delta: { content: chunk } }] });
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error in GigaChat chat completions:', error);
        res.status(500).json({ error: 'An error occurred during the GigaChat API call' });
    }
};

const embeddings = async (req, res) => {
    try {
        // Simulated embeddings for GigaChat
        res.json({ embeddings: [0.1, 0.2, 0.3, 0.4, 0.5] });
    } catch (error) {
        console.error('Error in GigaChat embeddings:', error);
        res.status(500).json({ error: 'An error occurred during the GigaChat API call' });
    }
};

const models = async (req, res) => {
    try {
        // Simulated models list for GigaChat
        res.json({ models: ['gigachat-small', 'gigachat-medium', 'gigachat-large'] });
    } catch (error) {
        console.error('Error in GigaChat models:', error);
        res.status(500).json({ error: 'An error occurred during the GigaChat API call' });
    }
};

export { chatCompletions, embeddings, models };
