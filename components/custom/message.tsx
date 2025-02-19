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
  role: string;
  content: string | ReactNode;
  toolInvocations?: Array<ToolInvocation>;
  attachments?: Array<Attachment>;
  isFirstMessage?: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const Message = ({
  chatId,
  messageId = '',
  role,
  content,
  toolInvocations,
  attachments,
  isFirstMessage = false,
  isLoading = false,
  isStreaming = false,
}: MessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (typeof content === "string") {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
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
          <UserIcon className="w-full h-full" />
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
        className={`relative flex flex-col gap-2 transition-all duration-200 ${
          isUser
            ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white py-3 px-5 rounded-lg max-w-[70%] self-end cursor-pointer transform hover:scale-105 shadow-lg"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-5 rounded-lg max-w-[70%] group shadow-lg"
        }`}
      >
        {/* Copy button for bot messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            tabIndex={-1}
            className="absolute right-3 top-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
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
        )}

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
                  ? "text-sm font-medium break-words"
                  : "text-base leading-relaxed pr-12"
              }`}
            >
              {content && typeof content === "string" ? (
                isUser ? (
                  <div>{content}</div>
                ) : (
                  <TypingEffect
                    text={content}
                    messageId={messageId}
                    chatId={chatId}
                    speed={25}
                    isStreaming={isStreaming}
                  />
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
          </>
        )}
      </div>
    </motion.div>
  );
};
