export default async function getAIResponse(prompt) {
    console.log("Message to GPT is:", prompt);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("ChatGPT response:", data.choices[0].message.content);

        return data.choices[0].message.content;
    } catch (err) {
        console.error("Error while calling ChatGPT API", err.message);
        return "Sorry, there was an error processing your ChatGPT request.";
    }
}