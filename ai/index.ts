import { google } from "@ai-sdk/google";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";
import {
  customProvider,
  extractReasoningMiddleware,
} from 'ai';

export const geminiProModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: extractReasoningMiddleware({ tagName: 'think' }),
});

export const geminiFlashModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: extractReasoningMiddleware({ tagName: 'think' }),
});