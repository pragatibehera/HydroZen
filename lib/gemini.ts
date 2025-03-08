'use client';

interface VerificationResult {
  isLeakage: boolean;
  confidence: number;
  description: string;
}

export async function verifyLeakageImage(imageUrl: string): Promise<VerificationResult> {
  try {
    console.log("Starting image verification with OpenRouter/Gemini...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://hydrozen.vercel.app",
        "X-Title": "HydroZen",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Analyze this image for water leakage. Look for: 1) Visible water leaks 2) Dripping or spraying water 3) Wet or damaged areas 4) Broken pipes or faucets. Respond ONLY in this exact JSON format: { \"isLeakage\": boolean, \"confidence\": number between 0 and 1, \"description\": \"detailed description of what you see\" }"
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
      console.log("Attempting to extract information from raw text...");
      
      // If JSON parsing fails, make a best effort to interpret the response
      const isLeakageIndicator = text.toLowerCase().includes('leak') || 
                                text.toLowerCase().includes('water damage') ||
                                text.toLowerCase().includes('dripping') ||
                                text.toLowerCase().includes('broken pipe');
      
      return {
        isLeakage: isLeakageIndicator,
        confidence: isLeakageIndicator ? 0.8 : 0.2,
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
    throw new Error(`Failed to verify image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}