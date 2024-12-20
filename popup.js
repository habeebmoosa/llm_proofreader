// popup.js

document.addEventListener('DOMContentLoaded', async () => {
    const proofreadBtn = document.getElementById('proofread-btn');
    const input = document.getElementById('proofreading-input');
    const suggestionsOutput = document.getElementById('suggestions-output');
    const container = document.getElementById('container')
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
            systemPrompt: `
            The following content generated by an LLM. Please proofread it thoroughly and provide feedback. Specifically, I want you to:

            - Identify and point out any parts that are likely factually incorrect.
            - Highlight sections that are unclear, lack coherence, or do not make sense.
            - Provide suggestions for improving clarity, grammar, and overall quality.
            - Indicate whether the tone and style are appropriate for the intended audience (if provided).

            Provide your feedback in very short way return only 3 to 4 small points at all.
            `
        });

        proofreadBtn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) return;
        
            // Start loading animation
            input.classList.add('loading-effect');
            suggestionsOutput.innerHTML = 'Generating suggestions...';
        
            try {
                let result = '';
                let previousChunk = '';
                const stream = session.promptStreaming(`
                    "${text}"
                `);
        
                for await (const chunk of stream) {
                    const newChunk = chunk.startsWith(previousChunk)
                        ? chunk.slice(previousChunk.length)
                        : chunk;
        
                    result += newChunk;
                    previousChunk = chunk;
                }
        
                const converter = new showdown.Converter();
                const html = converter.makeHtml(result);
        
                suggestionsOutput.innerHTML = html;
        
                // Blow effect on completion
                input.classList.remove('loading-effect');
                container.classList.add('blow-effect');
        
                setTimeout(() => {
                    container.classList.remove('blow-effect');
                }, 600); // Match the blow-effect animation duration
        
            } catch (error) {
                suggestionsOutput.textContent = `Error: ${error.message}`;
                input.classList.remove('loading-effect');
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
