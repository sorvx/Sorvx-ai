import { google } from "@ai-sdk/google";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";
import { extractReasoningMiddleware } from "./extract-reasoning-middleware"; // Ensure this path is correct

export const geminiProModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: extractReasoningMiddleware({ tagName: 'think' }),
});

export const geminiFlashModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: extractReasoningMiddleware({ tagName: 'think' }),
});