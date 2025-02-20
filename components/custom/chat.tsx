"use client";

import { Attachment, Message as AIMessage } from "ai";
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

const LOCAL_STORAGE_KEY = "chat_messages";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<AIMessage>;
}) {
  // Load persisted messages on mount
  const [persistedMessages, setPersistedMessages] = useState<Array<AIMessage>>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const msgs = JSON.parse(stored);
        setPersistedMessages(msgs);
      } catch (err) {
        console.error("Failed to parse stored messages", err);
      }
    }
  }, []);

  // Use persisted messages if available; otherwise, use initialMessages
  const {
    messages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
  } = useChat({
    id,
    body: { id },
    initialMessages: persistedMessages.length > 0 ? persistedMessages : initialMessages,
    maxSteps: 10,
    onFinish: () => {
      // Mark all messages as completed and persist them
      const updated = messages.map((m) => ({ ...m, completed: true }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.history.replaceState({}, "", `/chat/${id}`);
    },
  });

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [isTypingLastMessage, setIsTypingLastMessage] = useState(false);
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
        // Mark messages as completed and persist them
        const updated = messages.map((m) => ({ ...m, completed: true }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex flex-col h-screen pt-14 sm:pt-16 pb-4 px-4 sm:px-6">
        <div className="flex flex-col h-full items-center w-full max-w-2xl mx-auto">
          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-2 w-full grow overflow-y-auto"
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
                completed={message.completed || false}
              />
            ))}

            {/* Show typing indicator for new messages from user */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <PreviewMessage chatId={id} role="assistant" content="" isLoading={true} />
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
