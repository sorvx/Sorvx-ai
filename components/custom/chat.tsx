"use client";

import { Attachment, Message as AIMessage } from "ai";
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

// Update the ExtendedMessage type to use AIMessage
type ExtendedMessage = AIMessage & {
  completed?: boolean;
  isStreaming?: boolean;
};

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<AIMessage>;
}) {
  // Use a unique key for each chat based on its id.
  const LOCAL_STORAGE_KEY = `chat_messages_${id}`;

  // Load persisted messages (with the 'completed' property) on mount.
  const [persistedMessages, setPersistedMessages] = useState<Array<ExtendedMessage>>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const msgs: ExtendedMessage[] = JSON.parse(stored);
        setPersistedMessages(msgs);
      } catch (err) {
        console.error("Failed to parse stored messages", err);
      }
    }
  }, [LOCAL_STORAGE_KEY]);

  // Use persisted messages if available; otherwise, use the provided initialMessages.
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
      setIsTypingLastMessage(false);
      lastMessageRef.current = null;
      const updated = messages.map((m) => ({ ...m, completed: true })) as ExtendedMessage[];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    },
  });

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [isTypingLastMessage, setIsTypingLastMessage] = useState(false);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        setIsTypingLastMessage(true);
        lastMessageRef.current = lastMessage.id;
      }
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
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const isAssistantMessage = message.role === "assistant";
              const shouldStream = isLastMessage && isAssistantMessage && isLoading;
              
              return (
                <PreviewMessage
                  key={message.id}
                  chatId={id}
                  messageId={message.id}
                  role={message.role}
                  content={message.content}
                  attachments={message.experimental_attachments}
                  toolInvocations={message.toolInvocations}
                  isLoading={false}
                  isStreaming={shouldStream}
                  completed={!shouldStream}
                />
              );
            })}

            {/* Only show typing indicator for assistant messages */}
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