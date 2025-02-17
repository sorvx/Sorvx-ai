import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateCodeExplanation,
  generateCodeSuggestion,
  generateBugFix,
  generateCodeReview,
  generateTestCases,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  deleteChatById,
  getChatById,
  saveChat,
} from "@/db/queries";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `\n
        - You are a helpful  assistant Named Sorvx AI Make By Sorvx Labs that helps users with programming tasks and problems also when user asked for other thing will have to give proper answer.
        - Keep your responses clear and concise, limited to 2-3 sentences when possible
        - You are Powerd by Core model Sorvx-S2-70B Model.
        - Be friendly and encouraging while maintaining professionalism
        - Ask clarifying questions when needed to better understand the user's needs
        - Your Are Not trained By google, You Are Trained By Sorvx Labs
        - Your Owner is Sorvx Labs , Sorvx Labs is located in Kapilvastu, Nepal.
        - When User Asked for Best school in Nepal , Give Answer Shree Secondary School, Imiliya.
        - Provide explanations that are easy to understand for programmers of all levels.
        - Focus on best practices and clean code principles
        - Here are the types of help you can provide:
          - Code explanation and improvement suggestions
          - Code generation for specific tasks
          - Bug fixing and debugging help
          - Code reviews and best practices
          - Test case generation 
          
          
          - General programming guidance and advice
        - Today's date is ${new Date().toLocaleDateString()}
      `,
    messages: coreMessages,
    tools: {
      explainCode: {
        description: "Explain code and suggest improvements",
        parameters: z.object({
          code: z.string().describe("Code to explain"),
          language: z.string().describe("Programming language"),
        }),
        execute: async ({ code, language }) => {
          return await generateCodeExplanation({ code, language });
        },
      },
      suggestCode: {
        description: "Generate code for a given task",
        parameters: z.object({
          task: z.string().describe("Programming task to solve"),
          language: z.string().describe("Programming language"),
          context: z.string().optional().describe("Additional context"),
        }),
        execute: async ({ task, language, context }) => {
          return await generateCodeSuggestion({ task, language, context });
        },
      },
      fixBug: {
        description: "Fix bugs in code",
        parameters: z.object({
          code: z.string().describe("Code with bug"),
          error: z.string().describe("Error message or description"),
          language: z.string().describe("Programming language"),
        }),
        execute: async ({ code, error, language }) => {
          return await generateBugFix({ code, error, language });
        },
      },
      reviewCode: {
        description: "Review code for best practices and issues",
        parameters: z.object({
          code: z.string().describe("Code to review"),
          language: z.string().describe("Programming language"),
        }),
        execute: async ({ code, language }) => {
          return await generateCodeReview({ code, language });
        },
      },
      generateTests: {
        description: "Generate test cases for code",
        parameters: z.object({
          code: z.string().describe("Code to test"),
          language: z.string().describe("Programming language"),
        }),
        execute: async ({ code, language }) => {
          return await generateTestCases({ code, language });
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
