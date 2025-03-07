import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAIRecommendations(data: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a water conservation expert providing personalized recommendations."
        },
        {
          role: "user",
          content: `Based on this usage data: ${JSON.stringify(data)}, provide water saving recommendations.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return 'Unable to generate recommendations at this time.';
  }
}