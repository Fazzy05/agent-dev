const https = require('https');

async function askOpenAI(prompt, model = 'gpt-3.5-turbo') {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }

  const data = JSON.stringify({
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.error) {
            reject(new Error(`OpenAI API Error: ${response.error.message}`));
            return;
          }
          
          if (response.choices && response.choices.length > 0) {
            resolve(response.choices[0].message.content);
          } else {
            reject(new Error('No response from OpenAI API'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse OpenAI response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`OpenAI request failed: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

module.exports = { askOpenAI };
