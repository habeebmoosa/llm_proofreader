document.addEventListener('DOMContentLoaded', async () => {
    const proofreadBtn = document.getElementById('proofread-btn');
    const input = document.getElementById('proofreading-input');
    const suggestionsOutput = document.getElementById('suggestions-output');
    let session = null;

    try {
        const { available, defaultTemperature, defaultTopK } = await ai.languageModel.capabilities();

        if (available === "no") {
            suggestionsOutput.textContent = "AI model not available";
            proofreadBtn.disabled = true;
            return;
        }

        session = await ai.languageModel.create({
            temperature: defaultTemperature,
            topK: defaultTopK,
            systemPrompt: "You are a professional proofreader and writing coach."
        });

        proofreadBtn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) return;

            suggestionsOutput.innerHTML = 'Generating suggestions...';

            try {
                let result = '';
                let previousChunk = '';
                const stream = session.promptStreaming(`
                    Proofread the following text and provide specific, actionable suggestions in Markdown format:
                    
                    "${text}"
                    
                    Use headings for each section (e.g., ## Grammatical Corrections) and bullet points for detailed suggestions.
                `);

                for await (const chunk of stream) {
                    const newChunk = chunk.startsWith(previousChunk)
                        ? chunk.slice(previousChunk.length)
                        : chunk;

                    result += newChunk;
                    previousChunk = chunk;
                }

                // Convert Markdown to HTML
                const converter = new showdown.Converter();
                const html = converter.makeHtml(result);

                // Update output with formatted HTML
                suggestionsOutput.innerHTML = html;

            } catch (error) {
                suggestionsOutput.textContent = `Error: ${error.message}`;
            }
        });

    } catch (error) {
        suggestionsOutput.textContent = `Initialization Error: ${error.message}`;
    }

    window.addEventListener('unload', () => {
        if (session) {
            session.destroy();
        }
    });
});
