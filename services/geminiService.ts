
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { MarketData, ChatMessage, LongTermForecast } from '../types';

let chat: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
    if (!genAI) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set.");
        }
        genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return genAI;
}

const getChat = () => {
    if (!chat) {
        const ai = getGenAI();
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are an expert energy market analyst named 'Pulse'. 
                You will answer questions based ONLY on the real-time market data provided in the prompt. 
                Be concise, data-driven, and professional in your responses. 
                Do not provide information that is not present in the data.
                If you cannot answer from the provided data, say "I cannot answer that based on the current data."`,
            },
        });
    }
    return chat;
}

export const getMarketAnalysis = async (data: MarketData): Promise<string> => {
    if (!data || !data.ticker || data.ticker.length === 0) {
        return "Insufficient data for analysis.";
    }

    try {
        const ai = getGenAI();
        const model = 'gemini-2.5-flash';

        const prompt = `
            Analyze the following real-time energy market data and provide a concise summary (2-3 sentences) of the key trends for a market analyst.
            Focus on the most significant price movement and any notable renewable energy generation patterns.
            Be professional and data-driven.

            Data:
            - Ticker: ${JSON.stringify(data.ticker.map(t => ({ name: t.name, price: t.price.toFixed(2), change: t.change.toFixed(2)})))}
            - Renewables (latest hour): ${data.renewables.length > 0 ? JSON.stringify(data.renewables[data.renewables.length - 1]) : 'N/A'}
            - Gas Production: ${data.gas.production.toFixed(2)} Bcf/d

            Example output: "CAISO prices are surging by $5.30 to $55.10 amid high demand. Renewables are meeting a significant portion of the load, with strong solar output observed. Natural gas production remains stable."
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching market analysis from Gemini API:", error);
        return "Unable to fetch AI-powered market analysis at this time. Please ensure your API key is configured correctly.";
    }
};

export const getChatResponse = async (
    userInput: string,
    history: ChatMessage[],
    data: MarketData
): Promise<string> => {
     if (!data) {
        return "Market data is not available.";
    }

    try {
        const chatSession = getChat();
        
        // We don't send the whole history to the API each time, as the `chat` object maintains it.
        // Instead, we construct a data-rich prompt for the current turn.
        const dataContext = JSON.stringify({
            ticker: data.ticker,
            gas: data.gas,
            renewables: data.renewables,
            capacity: data.capacity,
        });

        const prompt = `
            CONTEXT: The current market data is as follows: ${dataContext}.
            USER QUESTION: "${userInput}"
        `;
        
        const response = await chatSession.sendMessage({ message: prompt });
        return response.text;

    } catch(error) {
        console.error("Error fetching chat response from Gemini API:", error);
        // Reset chat on error
        chat = null;
        return "There was an error communicating with the AI analyst. Please try again.";
    }
};

export const generateLongTermForecast = async (): Promise<LongTermForecast> => {
    try {
        const ai = getGenAI();
        const model = 'gemini-2.5-flash';

        const prompt = `
            Act as a senior energy market economist. Generate a 5-year forecast for US average electricity prices ($/MWh) and Henry Hub natural gas prices ($/MMBtu).
            Provide a quantitative forecast for each year and a qualitative analysis explaining the key drivers for your forecast.
            Consider factors like renewable energy growth, gas production trends, regulatory changes, and demand projections.
            Return the result in the specified JSON format.
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        forecastData: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.INTEGER },
                                    electricityPrice: { type: Type.NUMBER },
                                    gasPrice: { type: Type.NUMBER }
                                },
                                required: ["year", "electricityPrice", "gasPrice"]
                            }
                        },
                        analysis: {
                            type: Type.STRING,
                            description: "Qualitative analysis of the forecast drivers."
                        }
                    },
                    required: ["forecastData", "analysis"]
                }
            }
        });
        
        // The response text is a JSON string, parse it.
        const jsonText = response.text;
        const parsedResponse = JSON.parse(jsonText);

        // Simple validation
        if (!parsedResponse.forecastData || !parsedResponse.analysis) {
            throw new Error("AI response did not match the expected format.");
        }
        
        return parsedResponse as LongTermForecast;

    } catch (error) {
        console.error("Error generating long-term forecast from Gemini API:", error);
        throw new Error("Failed to generate long-term forecast from AI.");
    }
};