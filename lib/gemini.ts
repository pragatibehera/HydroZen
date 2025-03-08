'use client';

interface VerificationResult {
  isLeakage: boolean;
  confidence: number;
  description: string;
}

export async function verifyLeakageImage(imageUrl: string): Promise<VerificationResult> {
  try {
    console.log("Starting image verification with Gemini Flash...");
    
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured");
    }

    console.log("Making API request to OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://hydrozen.vercel.app",
        "X-Title": "HydroZen",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-thinking-exp:free",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Look at this image and tell me if you see any signs of water leakage or water-related issues. Consider things like: water puddles, wet surfaces, dripping, or any water-related damage. Respond ONLY in this exact JSON format: { \"isLeakage\": boolean, \"confidence\": number between 0 and 1, \"description\": \"detailed description of what you see\" }"
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": imageUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Raw OpenRouter response:", result);

    // Extract the text content from the response
    const text = result.choices?.[0]?.message?.content || '';
    console.log("Response text:", text);

    // Parse the response
    try {
      const parsedResponse = JSON.parse(text);
      console.log("Parsed verification result:", parsedResponse);
      
      // Validate the response format
      if (typeof parsedResponse.isLeakage !== 'boolean' || 
          typeof parsedResponse.confidence !== 'number' || 
          typeof parsedResponse.description !== 'string') {
        throw new Error("Invalid response format from API");
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse API response:", parseError);
      console.log("Raw response text:", text);
      
      // Simple text analysis for backup
      const isLeakageIndicator = text.toLowerCase().includes('water') && 
                                (text.toLowerCase().includes('leak') || 
                                 text.toLowerCase().includes('drip') || 
                                 text.toLowerCase().includes('puddle') || 
                                 text.toLowerCase().includes('wet'));
      
      return {
        isLeakage: isLeakageIndicator,
        confidence: 0.5, // Lower confidence for backup analysis
        description: text.slice(0, 200) // Take first 200 characters as description
      };
    }
  } catch (error) {
    console.error("Error in verifyLeakageImage:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? "Present" : "Missing"
      });
    }
    throw error;
  }
}