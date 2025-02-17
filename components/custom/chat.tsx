"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

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

            {messages.map((message) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
              />
            ))}

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
