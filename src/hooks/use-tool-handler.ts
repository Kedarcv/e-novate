import { LiveServerToolCall, Tool, Type } from "@google/genai";
import { useEffect } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";

// Define the tool declarations
export const econetTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "validate_network_challenge_phone",
        description: "Validates the mobile number format for network challenge reporting.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            phone_number: {
              type: Type.STRING,
              description: "The phone number to validate (e.g., 263771123456)",
            },
          },
          required: ["phone_number"],
        },
      },
      {
        name: "validate_network_challenge_date",
        description: "Validates the start date format for network challenge reporting.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            start_date: {
              type: Type.STRING,
              description: "The start date in yyyy-mm-dd format",
            },
          },
          required: ["start_date"],
        },
      },
      {
        name: "validate_network_challenge_time",
        description: "Validates the start time and ensures it is logical with the start date.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            start_date: {
              type: Type.STRING,
              description: "The start date in yyyy-mm-dd format",
            },
            start_time: {
              type: Type.STRING,
              description: "The start time in HH:mm format",
            },
          },
          required: ["start_date", "start_time"],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "googleSearch",
        description: "Performs a Google search to find information on the web when internal FAQs are insufficient.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "The search query.",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "highlight_object",
        description: "Highlights an object in the video stream with an AR overlay.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            label: {
              type: Type.STRING,
              description: "The name of the object (e.g., 'Econet Shop', 'Base Station').",
            },
            description: {
              type: Type.STRING,
              description: "A brief description or status of the object.",
            },
            type: {
              type: Type.STRING,
              description: "The type of overlay: 'info', 'issue', 'review'.",
              enum: ["info", "issue", "review"],
            },
            ymin: {
              type: Type.NUMBER,
              description: "Top coordinate of the bounding box (0.0 to 1.0).",
            },
            xmin: {
              type: Type.NUMBER,
              description: "Left coordinate of the bounding box (0.0 to 1.0).",
            },
            ymax: {
              type: Type.NUMBER,
              description: "Bottom coordinate of the bounding box (0.0 to 1.0).",
            },
            xmax: {
              type: Type.NUMBER,
              description: "Right coordinate of the bounding box (0.0 to 1.0).",
            },
          },
          required: ["label", "description", "type", "ymin", "xmin", "ymax", "xmax"],
        },
      },
    ],
  },
];

// Real FAQ data extracted from provided documents


export function useToolHandler(onHighlightObject?: (data: any) => void) {
  const { client } = useLiveAPIContext();

  useEffect(() => {
    const onToolCall = async (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }

      const responses = await Promise.all(toolCall.functionCalls.map(async (fc) => {
        let result: any = { error: "Unknown function" };

        try {
          if (fc.name === "validate_network_challenge_phone") {
            const phone = (fc.args as any).phone_number;
            const isValid = /^263\d{9}$/.test(phone);
            result = isValid
              ? { valid: true, message: "Phone number is valid." }
              : { valid: false, error: "Invalid format. Must be 12 digits starting with 263 (e.g., 263771123456)." };
          } else if (fc.name === "validate_network_challenge_date") {
            const dateStr = (fc.args as any).start_date;
            const isValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
             result = isValid
              ? { valid: true, message: "Date is valid." }
              : { valid: false, error: "Invalid date format. Please use yyyy-mm-dd (e.g., 2025-05-01)." };
          } else if (fc.name === "validate_network_challenge_time") {
            const { start_date, start_time } = fc.args as any;
             // Basic time validation HH:mm
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(start_time)) {
                result = { valid: false, error: "Invalid time format. Please use HH:mm (e.g., 14:30)." };
            } else {
                // Check if date+time is in the future (simple check)
                const dateTimeStr = `${start_date}T${start_time}:00`;
                const inputDate = new Date(dateTimeStr);
                const now = new Date();
                
                if (isNaN(inputDate.getTime())) {
                     result = { valid: false, error: "Invalid date/time combination." };
                } else if (inputDate > now) {
                    result = { valid: false, error: "Time cannot be in the future." };
                } else {
                    result = { valid: true, message: "Time is valid." };
                }
            }
          } else if (fc.name === "googleSearch") {
            const query = (fc.args as any).query;
            const apiKey = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY;
            const cx = process.env.REACT_APP_GOOGLE_SEARCH_CX;

            if (!apiKey || !cx) {
                result = { error: "Google Search is not configured. Please add REACT_APP_GOOGLE_SEARCH_API_KEY and REACT_APP_GOOGLE_SEARCH_CX to your .env file." };
            } else {
                try {
                    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
                    const response = await fetch(searchUrl);
                    const data = await response.json();

                    if (data.items && data.items.length > 0) {
                        const snippets = data.items.slice(0, 5).map((item: any) => `Title: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}`).join("\n\n");
                        result = { result: `Here are the search results for "${query}":\n\n${snippets}` };
                    } else {
                        result = { result: "No search results found." };
                    }
                } catch (err: any) {
                    result = { error: `Search failed: ${err.message}` };
                }
            }
          } else if (fc.name === "highlight_object") {
            console.log("ToolHandler: highlight_object called", fc.args);
            const args = fc.args as any;
            // Invoke callback if provided
            if (onHighlightObject) {
              console.log("ToolHandler: invoking onHighlightObject callback");
              onHighlightObject({
                id: Math.random().toString(36).substring(7), // Generate a random ID
                ...args
              });
            } else {
              console.warn("ToolHandler: onHighlightObject callback is missing");
            }
            result = { success: true, message: "Object highlighted." };
          }
        } catch (e: any) {
          result = { error: e.message };
        }

        return {
          response: { output: result },
          id: fc.id,
          name: fc.name,
        };
      }));

      if (responses.length > 0) {
        client.sendToolResponse({
          functionResponses: responses,
        });
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, onHighlightObject]);
}
