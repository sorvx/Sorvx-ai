import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import type { CoreMessage, Message } from "ai"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a UUID for new chat sessions
 */
export function generateUUID(): string {
  return uuidv4()
}

/**
 * Fetcher function for SWR
 */
export async function fetcher<JSON = any>(input: RequestInfo, init?: RequestInit): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    throw error
  }

  return res.json()
}

/**
 * Converts core message format to UI message format
 */
export function convertToUIMessages(messages: Array<CoreMessage>): Array<Message> {
  return messages.map((message) => ({
    id: message.id || generateUUID(),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt || new Date(),
  }))
}

