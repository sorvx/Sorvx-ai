// components/custom/chat.tsx
"use client";

import { Message as UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send } from 'lucide-react';

import { Message } from "@/components/message";
import { useChat } from "@/hooks/use-chat";

interface ChatProps {
  id: string;
  initialMessages: UIMessage[];
}

export function Chat({ id, initialMessages }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    id,
    initialMessages,
    api: "/api/chat",
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container mx-auto px-4 max-w-4xl h-full flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            chatId={id}
            messageId={message.id}
            role={message.role}
            content={message.content}
            toolInvocations={message.toolInvocations}
            attachments={message.attachments}
            isFirstMessage={index === 0}
          />
        ))}
        
        {isLoading && (
          <Message
            chatId={id}
            messageId="loading"
            role="assistant"
            content=""
            isLoading={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="sticky bottom-0 pb-8 pt-4 bg-gradient-to-t from-gray-50 dark:from-gray-900">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-full bg-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
          >
            <Send size={18} />
            <span className="sr-only">Send message</span>
          </button>
        </form>
      </div>
    </div>
  );
}