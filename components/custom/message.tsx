"use client";

import Image from "next/image";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { UserIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { TypingDots } from "./typing-dots";
import { TypingEffect } from "./typing-effect";
import { ClipboardCopy } from "lucide-react";

interface MessageProps {
  chatId: string;
  messageId?: string;
  role: string;
  content: string | ReactNode;
  attachments?: Array<Attachment>;
  toolInvocations?: Array<ToolInvocation>;
  isFirstMessage?: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
  completed?: boolean;
}

export const Message = ({
  chatId,
  messageId = "",
  role,
  content,
  attachments,
  toolInvocations,
  isFirstMessage = false,
  isLoading = false,
  isStreaming = false,
  completed = false,
}: MessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof content === "string") {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Copy failed", error);
      }
    }
  };

  return (
    <motion.div
      className={`flex items-start gap-3 px-4 w-full md:w-[500px] md:px-0 ${
        isFirstMessage ? "mt-16" : "mt-3"
      } ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Avatar */}
      <div
        className={`w-[32px] h-[32px] border rounded-full p-1 flex justify-center items-center shrink-0 text-zinc-500 dark:text-zinc-400 ${
          isUser ? "order-last ml-2" : "order-first mr-2"
        }`}
      >
        {isUser ? (
          <UserIcon />
        ) : (
          <Image
            src="/images/ai.png"
            height={28}
            width={28}
            alt="Chatbot Avatar"
          />
        )}
      </div>

      {/* Message container */}
      <div
        className={`relative flex flex-col gap-2 transition-all duration-200 break-words max-w-[75%] ${
          isUser
            ? "bg-purple-700 text-white py-3 px-4 rounded-t-2xl rounded-bl-2xl rounded-br-md self-end hover:bg-purple-600"
            : "bg-white/30 dark:bg-gray-900/30 p-4 rounded-xl shadow-lg group backdrop-blur-sm"
        }`}
      >
        {isLoading ? (
          <TypingDots />
        ) : (
          <>
            <div
              className={
                isUser
                  ? "text-sm font-medium"
                  : "text-base leading-relaxed pr-12"
              }
            >
              {typeof content === "string" ? (
                isUser ? (
                  <div>{content}</div>
                ) : (
                  // Wrap the assistant content in a container with a fixed min-height
                  <div
                    className="relative"
                    style={{ minHeight: "3rem", willChange: "transform" }}
                  >
                    {completed ? (
                      <div>{content}</div>
                    ) : (
                      <TypingEffect
                        text={content}
                        messageId={messageId}
                        chatId={chatId}
                        speed={25}
                        isStreaming={isStreaming}
                      />
                    )}
                  </div>
                )
              ) : (
                <div>{content}</div>
              )}
            </div>

            {toolInvocations && toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4 overflow-x-auto thin-scrollbar">
                {toolInvocations.map((toolInvocation) =>
                  "result" in toolInvocation ? (
                    <pre
                      key={toolInvocation.toolCallId}
                      className="whitespace-pre-wrap text-xs"
                    >
                      {JSON.stringify(toolInvocation.result, null, 2)}
                    </pre>
                  ) : null
                )}
              </div>
            )}

            {attachments && attachments.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto mt-2">
                {attachments.map((attachment) => (
                  <PreviewAttachment key={attachment.url} attachment={attachment} />
                ))}
              </div>
            )}

            {/* Advanced copy button for chatbot messages only */}
            {!isUser && (
              <div className="absolute bottom-2 right-2 flex items-center">
                <motion.button
                  onClick={handleCopy}
                  title="Copy message"
                  aria-label={copied ? "Copied!" : "Copy message"}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none transition-transform duration-200"
                >
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: copied ? 0 : 1 }}
                  >
                    <ClipboardCopy
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </motion.div>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center text-xs text-green-500 font-medium"
                    >
                      Copied!
                    </motion.span>
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};