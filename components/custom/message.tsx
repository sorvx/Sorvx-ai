"use client";

import Image from "next/image";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

import { UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";
import { TypingDots } from "./typing-dots";
import { TypingEffect } from "./typing-effect";

interface MessageProps {
  chatId: string;
  messageId?: string;
  role: "function" | "system" | "user" | "assistant" | "data" | "tool";
  content: string | ReactNode;
  toolInvocations?: Array<ToolInvocation>;
  attachments?: Array<Attachment>;
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
  toolInvocations,
  attachments,
  isFirstMessage = false,
  isLoading = false,
  isStreaming = false,
  completed = false,
}: MessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (typeof content === "string") {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        // Removed the blur to avoid auto-scroll issues.
        setTimeout(() => setCopied(false), 2000);
      });
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
            ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white py-3 px-4 rounded-t-2xl rounded-bl-2xl rounded-br-md self-end cursor-pointer hover:shadow-lg hover:from-purple-500 hover:to-purple-600"
            : "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:bg-white/80 dark:hover:bg-gray-900/80 text-gray-900 dark:text-gray-100 p-4 rounded-xl shadow-lg group"
        }`}
      >
        {/* Message content */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <TypingDots />
          </div>
        ) : (
          <>
            <div
              className={`${
                isUser
                  ? "text-sm font-medium"
                  : "text-base leading-relaxed pr-12"
              }`}
            >
              {content && typeof content === "string" ? (
                isUser ? (
                  <Markdown>{content}</Markdown>
                ) : isStreaming ? (
                  <TypingEffect
                    text={content}
                    messageId={messageId}
                    chatId={chatId}
                    speed={25}
                    isStreaming={true}
                  />
                ) : (
                  <Markdown>{content}</Markdown>
                )
              ) : (
                <div>{content}</div>
              )}
            </div>

            {/* Tool invocations */}
            {toolInvocations && toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4 overflow-x-auto thin-scrollbar">
                {toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state } = toolInvocation;
                  if (state === "result") {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        {toolName === "getWeather" ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === "displayFlightStatus" ? (
                          <FlightStatus flightStatus={result} />
                        ) : toolName === "searchFlights" ? (
                          <ListFlights chatId={chatId} results={result} />
                        ) : toolName === "selectSeats" ? (
                          <SelectSeats chatId={chatId} availability={result} />
                        ) : toolName === "createReservation" ? (
                          Object.keys(result).includes("error") ? null : (
                            <CreateReservation reservation={result} />
                          )
                        ) : toolName === "authorizePayment" ? (
                          <AuthorizePayment intent={result} />
                        ) : toolName === "displayBoardingPass" ? (
                          <DisplayBoardingPass boardingPass={result} />
                        ) : toolName === "verifyPayment" ? (
                          <VerifyPayment result={result} />
                        ) : (
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div key={toolCallId} className="skeleton">
                        {toolName === "getWeather" ? (
                          <Weather />
                        ) : toolName === "displayFlightStatus" ? (
                          <FlightStatus />
                        ) : toolName === "searchFlights" ? (
                          <ListFlights chatId={chatId} />
                        ) : toolName === "selectSeats" ? (
                          <SelectSeats chatId={chatId} />
                        ) : toolName === "createReservation" ? (
                          <CreateReservation />
                        ) : toolName === "authorizePayment" ? (
                          <AuthorizePayment />
                        ) : toolName === "displayBoardingPass" ? (
                          <DisplayBoardingPass />
                        ) : null}
                      </div>
                    );
                  }
                })}
              </div>
            )}

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto thin-scrollbar mt-2">
                {attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* Copy button for bot messages placed at the bottom */}
            {!isUser && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleCopy}
                  tabIndex={-1}
                  className="px-2 py-1 rounded-md transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none"
                  aria-label={copied ? "Copied!" : "Copy message"}
                >
                  {copied ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Copied!
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Copy
                    </span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};