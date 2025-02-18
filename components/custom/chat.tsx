"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Track if we're showing the typing effect for the last message
  const [isTypingLastMessage, setIsTypingLastMessage] = useState(false);

  // Track the last message being streamed
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setIsTypingLastMessage(true);
      if (messages.length > 0) {
        lastMessageRef.current = messages[messages.length - 1].id;
      }
    } else {
      const timer = setTimeout(() => {
        setIsTypingLastMessage(false);
        lastMessageRef.current = null;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Container */}
      <main className="flex flex-col h-screen pt-14 sm:pt-16 pb-4 px-4 sm:px-6">
        <div className="flex flex-col h-full items-center w-full max-w-2xl mx-auto">
          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-2 w-full flex-grow overflow-y-auto"
          >
            {messages.length === 0 && <Overview />}

            {messages.map((message, index) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                messageId={message.id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
                isLoading={
                  index === messages.length - 1 && 
                  (isLoading || isTypingLastMessage) && 
                  message.role === "assistant"
                }
                isStreaming={message.id === lastMessageRef.current}
              />
            ))}

            {/* Show typing indicator for new messages */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <PreviewMessage
                chatId={id}
                role="assistant"
                content=""
                isLoading={true}
              />
            )}

            <div ref={messagesEndRef} className="shrink-0 min-h-[24px]" />
          </div>

          {/* Input Form */}
          <form
            className="flex flex-row gap-2 items-end w-full max-w-2xl mt-2"
            onSubmit={handleSubmit}
          >
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
            />
          </form>
        </div>
      </main>
    </div>
  );
}
