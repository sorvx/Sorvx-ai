"use client";

import Image from "next/image";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { Check, Copy, User } from 'lucide-react';

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

  // Fixed copy function to prevent scrolling
  const handleCopy = (e: React.MouseEvent) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Save current scroll position
    const scrollPos = window.scrollY;
    
    if (typeof content === "string") {
      navigator.clipboard.writeText(content)
        .then(() => {
          setCopied(true);
          
          // Restore scroll position in case it changed
          window.scrollTo({
            top: scrollPos,
            behavior: 'auto'
          });
          
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
    
    // Return false to prevent any other default behaviors
    return false;
  };

  return (
    <motion.div
      className={`flex items-start gap-4 px-4 w-full max-w-3xl mx-auto md:px-0 ${
        isFirstMessage ? "mt-16" : "mt-6"
      } ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-md flex-shrink-0 border border-gray-100 dark:border-gray-800">
          <Image
            src="/images/ai.png"
            height={40}
            width={40}
            alt="Assistant"
            className="object-cover"
          />
        </div>
      )}

      {/* Message container */}
      <div
        className={`relative flex flex-col gap-3 transition-all duration-200 break-words ${
          isUser ? "max-w-[85%] md:max-w-[70%]" : "max-w-[90%] md:max-w-[80%]"
        }`}
      >
        {/* Message bubble */}
        <div
          className={`relative ${
            isUser
              ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white py-3 px-4 rounded-2xl rounded-tr-sm shadow-md self-end"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 py-4 px-5 rounded-2xl rounded-tl-sm shadow-md border border-gray-100 dark:border-gray-700"
          }`}
        >
          {/* Message content */}
          {isLoading ? (
            <div className="flex items-center">
              <TypingDots />
            </div>
          ) : (
            <div
              className={`${
                isUser
                  ? "text-sm font-medium"
                  : "text-base leading-relaxed"
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
          )}

          {/* Copy button for assistant messages - Fixed to prevent scrolling */}
          {!isUser && !isLoading && typeof content === "string" && (
            <button
              type="button" // Explicitly set type to button to prevent form submission
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          )}
        </div>

        {/* Tool invocations */}
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="flex flex-col gap-4 overflow-x-auto thin-scrollbar mt-1 max-w-full">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;
              if (state === "result") {
                const { result } = toolInvocation;
                return (
                  <div 
                    key={toolCallId}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
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
                      <pre className="whitespace-pre-wrap text-xs p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              } else {
                return (
                  <div 
                    key={toolCallId} 
                    className="skeleton bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
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
          <div className="flex flex-row gap-3 overflow-x-auto thin-scrollbar mt-2 pb-2">
            {attachments.map((attachment) => (
              <div key={attachment.url} className="rounded-lg overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                <PreviewAttachment attachment={attachment} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shadow-md flex-shrink-0 border border-violet-200 dark:border-violet-800">
          <User size={20} className="text-violet-600 dark:text-violet-400" />
        </div>
      )}
    </motion.div>
  );
};
