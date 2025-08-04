// Using native fetch API (available in Node.js 18+)

export async function askLlama(prompt){
    const res = await fetch('http://localhost:11434/api/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: 'llama3:8b-instruct-q4_K_M',
			prompt,
			stream: false // can be true for real-time chunks
		})
	});

	const data = await res.json();

	if (!res.ok || !data.response) {
		throw new Error(data.error || 'Failed to get response from LLaMA');
	}

	return data.response;
}