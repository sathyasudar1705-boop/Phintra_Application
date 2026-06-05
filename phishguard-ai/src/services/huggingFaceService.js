// Custom error class to differentiate between actionable API errors and generic fallback situations
export class AIConnectionError extends Error {
  constructor(message, isActionable = false) {
    super(message);
    this.name = "AIConnectionError";
    this.isActionable = isActionable;
  }
}

// Initialize the global debug state
if (typeof window !== 'undefined' && !window.aiDebugState) {
  window.aiDebugState = {
    tokenLoaded: false,
    apiStatus: "Idle", // Connected, Failed, Retrying, Idle, Testing
    modelStatus: "Unknown", // Ready, Loading, Unavailable, Unknown
    lastError: "",
    lastResponseBody: "",
    activeModel: "mistralai/Mistral-7B-Instruct-v0.2",
    lastHttpStatus: null,
    lastParsedFormat: ""
  };
}

// Fetch helper with loading state retries
const fetchWithRetry = async (modelId, prompt, maxRetries = 3) => {
  const token = import.meta.env.VITE_HF_API_TOKEN;
  const url = `https://api-inference.huggingface.co/models/${modelId}`;
  
  if (typeof window !== 'undefined' && window.aiDebugState) {
    window.aiDebugState.activeModel = modelId;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = performance.now();
    console.log(`Sending AI request (Attempt ${attempt}/${maxRetries}) to URL: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.4,
            return_full_text: false
          }
        })
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`HTTP Status Code: ${response.status} (Time: ${duration.toFixed(0)}ms)`);
      
      if (typeof window !== 'undefined' && window.aiDebugState) {
        window.aiDebugState.lastHttpStatus = response.status;
      }

      const responseBody = await response.text();
      if (typeof window !== 'undefined' && window.aiDebugState) {
        window.aiDebugState.lastResponseBody = responseBody;
      }
      console.log(`Response Body: ${responseBody}`);

      if (response.status === 200) {
        if (typeof window !== 'undefined' && window.aiDebugState) {
          window.aiDebugState.modelStatus = "Ready";
          window.aiDebugState.apiStatus = "Connected";
        }
        return responseBody;
      }

      // Handle specific HTTP Statuses
      if (response.status === 401) {
        const err = "Invalid or expired API token";
        if (typeof window !== 'undefined' && window.aiDebugState) {
          window.aiDebugState.modelStatus = "Unavailable";
          window.aiDebugState.apiStatus = "Failed";
          window.aiDebugState.lastError = err;
        }
        throw new AIConnectionError(err, true);
      }
      if (response.status === 403) {
        const err = "Access denied to this model";
        if (typeof window !== 'undefined' && window.aiDebugState) {
          window.aiDebugState.modelStatus = "Unavailable";
          window.aiDebugState.apiStatus = "Failed";
          window.aiDebugState.lastError = err;
        }
        throw new AIConnectionError(err, true);
      }
      if (response.status === 404) {
        const err = "Model endpoint not found";
        if (typeof window !== 'undefined' && window.aiDebugState) {
          window.aiDebugState.modelStatus = "Unavailable";
          window.aiDebugState.apiStatus = "Failed";
          window.aiDebugState.lastError = err;
        }
        throw new AIConnectionError(err, true);
      }
      if (response.status === 429) {
        const err = "Rate limit exceeded - waiting before retry";
        if (typeof window !== 'undefined' && window.aiDebugState) {
          window.aiDebugState.modelStatus = "Unavailable";
          window.aiDebugState.apiStatus = "Failed";
          window.aiDebugState.lastError = err;
        }
        throw new AIConnectionError(err, true);
      }
      if (response.status === 503) {
        const err = "Model is loading - retrying automatically";
        if (typeof window !== 'undefined' && window.aiDebugState) {
          window.aiDebugState.modelStatus = "Loading";
          window.aiDebugState.apiStatus = "Retrying";
          window.aiDebugState.lastError = err;
        }
        
        if (attempt < maxRetries) {
          console.warn(`Model loading (503). Waiting 5 seconds before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue; // Retry loop
        }
        throw new AIConnectionError(err, true);
      }

      throw new AIConnectionError(`API HTTP error ${response.status}: ${responseBody}`, false);
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`Request failed (Attempt ${attempt}/${maxRetries}) - Error: ${error.message} (Time: ${duration.toFixed(0)}ms)`);
      
      if (error instanceof AIConnectionError) {
        if (error.message.includes("retrying automatically") && attempt < maxRetries) {
          continue; // Retry loop
        }
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw new AIConnectionError(error.message, false);
      }
    }
  }
};

export const sendMessageToAI = async (message, chatHistory) => {
  const token = import.meta.env.VITE_HF_API_TOKEN;

  // Verify env loading
  if (!token) {
    console.error("Hugging Face API token not found.");
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.tokenLoaded = false;
      window.aiDebugState.apiStatus = "Failed";
      window.aiDebugState.lastError = "Hugging Face API token not found.";
    }
    throw new AIConnectionError("Hugging Face API token not found.", true);
  } else {
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.tokenLoaded = true;
    }
  }

  // Construct instruct template prompt
  let prompt = "<s>[INST] You are a professional cybersecurity awareness assistant for the Phintra platform. Reply with a professional, educational, concise, and actionable tone. Never use emojis. Keep responses short and direct.\n\n";
  
  if (chatHistory && chatHistory.length > 0) {
    chatHistory.forEach(msg => {
      if (msg.id === 'welcome' || msg.id.startsWith('error-fallback') || msg.id.startsWith('bot-fallback')) return;
      if (msg.sender === 'user') {
        prompt += `User: ${msg.text}\n`;
      } else {
        prompt += `Assistant: ${msg.text}\n`;
      }
    });
  }
  
  prompt += `User: ${message} [/INST]`;

  let responseBody = "";
  let successfullyReachedModel = "";

  // 1. Try Primary Model: mistralai/Mistral-7B-Instruct-v0.2
  try {
    responseBody = await fetchWithRetry("mistralai/Mistral-7B-Instruct-v0.2", prompt);
    successfullyReachedModel = "mistralai/Mistral-7B-Instruct-v0.2";
    console.log("Successfully reached primary model: mistralai/Mistral-7B-Instruct-v0.2");
  } catch (errorPrimary) {
    console.warn(`Primary model failed. Attempting fallback model... Error: ${errorPrimary.message}`);
    
    // 2. Try Fallback Model: google/gemma-2-2b-it
    try {
      responseBody = await fetchWithRetry("google/gemma-2-2b-it", prompt);
      successfullyReachedModel = "google/gemma-2-2b-it";
      console.log("Successfully reached fallback model: google/gemma-2-2b-it");
    } catch (errorFallback) {
      const finalErrorMsg = `Both models failed. Primary model error: ${errorPrimary.message}. Fallback model error: ${errorFallback.message}`;
      console.error(finalErrorMsg);
      if (typeof window !== 'undefined' && window.aiDebugState) {
        window.aiDebugState.apiStatus = "Failed";
        window.aiDebugState.lastError = finalErrorMsg;
      }
      
      // Propagate actionable errors if they exist
      if (errorPrimary.isActionable) {
        throw errorPrimary;
      } else if (errorFallback.isActionable) {
        throw errorFallback;
      }
      
      throw new AIConnectionError(finalErrorMsg, false);
    }
  }

  // 3. Parse Response Formats
  let data;
  try {
    data = JSON.parse(responseBody);
  } catch (parseJsonError) {
    const jsonErrorMsg = `Failed to parse response body as JSON. Raw body: ${responseBody}`;
    console.error(jsonErrorMsg);
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.lastError = jsonErrorMsg;
    }
    throw new AIConnectionError(jsonErrorMsg, false);
  }

  let generatedText = "";
  let formatParsed = "";

  // Check formats: response[0].generated_text, response.generated_text, response.generatedText
  if (Array.isArray(data) && data[0] && data[0].generated_text !== undefined) {
    generatedText = data[0].generated_text;
    formatParsed = "response[0].generated_text (array)";
  } else if (data && data.generated_text !== undefined) {
    generatedText = data.generated_text;
    formatParsed = "response.generated_text (object)";
  } else if (data && data.generatedText !== undefined) {
    generatedText = data.generatedText;
    formatParsed = "response.generatedText (camelCase)";
  } else if (Array.isArray(data) && typeof data[0] === 'string') {
    generatedText = data[0];
    formatParsed = "response[0] (string array)";
  } else if (data && data.error) {
    const apiErrMsg = `API returned error response: ${data.error}`;
    throw new AIConnectionError(apiErrMsg, false);
  } else {
    // If it is just a string
    generatedText = JSON.stringify(data);
    formatParsed = "fallback serialization";
  }

  console.log(`Response format successfully parsed: ${formatParsed}`);
  if (typeof window !== 'undefined' && window.aiDebugState) {
    window.aiDebugState.lastParsedFormat = formatParsed;
  }

  let cleanText = generatedText.trim();
  cleanText = cleanText.replace(/^(Assistant:|Assistant\sAssistant:)\s*/i, '');
  cleanText = cleanText.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '');

  return cleanText;
};

// Automatic connection test routine on bootstrap
export const testAIConnection = async () => {
  console.log("Starting AI Connection Test...");
  const token = import.meta.env.VITE_HF_API_TOKEN;
  
  if (typeof window !== 'undefined') {
    if (!window.aiDebugState) {
      window.aiDebugState = {
        tokenLoaded: !!token,
        apiStatus: "Testing",
        modelStatus: "Unknown",
        lastError: "",
        lastResponseBody: "",
        activeModel: "mistralai/Mistral-7B-Instruct-v0.2",
        lastHttpStatus: null,
        lastParsedFormat: ""
      };
    } else {
      window.aiDebugState.tokenLoaded = !!token;
      window.aiDebugState.apiStatus = "Testing";
      window.aiDebugState.modelStatus = "Unknown";
    }
  }

  // Step 1: Token verification
  if (!token) {
    console.error("Hugging Face API token not found.");
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.apiStatus = "Failed";
      window.aiDebugState.lastError = "Hugging Face API token not found.";
    }
    console.log("AI Connection Failed: Token Missing");
    return;
  }

  let activeError = null;

  // Step 2: Try connection to primary model mistralai/Mistral-7B-Instruct-v0.2
  try {
    console.log("Testing connection to primary model: mistralai/Mistral-7B-Instruct-v0.2");
    await fetchWithRetry("mistralai/Mistral-7B-Instruct-v0.2", "Test", 1);
    console.log("AI Connected");
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.apiStatus = "Connected";
      window.aiDebugState.modelStatus = "Ready";
      window.aiDebugState.activeModel = "mistralai/Mistral-7B-Instruct-v0.2";
    }
    return;
  } catch (err) {
    activeError = err;
    console.warn(`Primary model check failed: ${err.message}`);
  }

  // Step 3: Try connection to fallback model google/gemma-2-2b-it
  try {
    console.log("Testing connection to fallback model: google/gemma-2-2b-it");
    await fetchWithRetry("google/gemma-2-2b-it", "Test", 1);
    console.log("AI Connected");
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.apiStatus = "Connected";
      window.aiDebugState.modelStatus = "Ready";
      window.aiDebugState.activeModel = "google/gemma-2-2b-it";
    }
    return;
  } catch (err) {
    activeError = err;
    console.error(`Fallback model check failed: ${err.message}`);
  }

  // If both failed
  console.log("AI Connection Failed");
  if (typeof window !== 'undefined' && window.aiDebugState) {
    window.aiDebugState.apiStatus = "Failed";
    window.aiDebugState.lastError = activeError?.message || "Failed to reach model endpoints";
    window.aiDebugState.modelStatus = "Unavailable";
  }
};
