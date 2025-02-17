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

interface MessageProps {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations?: Array<ToolInvocation>;
  attachments?: Array<Attachment>;
  isFirstMessage?: boolean;
}

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  isFirstMessage = false,
}: MessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    // Prevent all default behaviors and propagation
    e.stopPropagation();
    e.preventDefault();
    
    if (typeof content === "string") {
      // Copy text without focusing the button
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        // Blur any focused element
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
      <div className={`w-[24px] border rounded-sm p-1 flex justify-center items-center shrink-0 text-zinc-500 dark:text-zinc-400 ${
        isUser ? 'order-last ml-2' : 'order-first mr-2'
      }`}>
        {isUser ? (
          <UserIcon />
        ) : (
          <Image src="/images/ai.png" height={20} width={20} alt="sorvx logo" />
        )}
      </div>

      {/* Message container */}
      <div
        className={`relative flex flex-col gap-2 transition-all duration-200 ${
          isUser
            ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white py-2.5 px-4 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-[200px] self-end cursor-pointer hover:shadow-lg hover:from-purple-500 hover:to-purple-600"
            : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-100 p-4 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-[85%] group"
        }`}
      >
        {/* Copy button for bot messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            tabIndex={-1} // Prevent button from receiving focus
            className="absolute right-2 top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none"
            aria-label={copied ? "Copied!" : "Copy message"}
          >
            {copied ? (
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">Copied!</div>
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Copy</div>
            )}
          </button>
        )}

        {/* Message content */}
        <div className={`${
          isUser 
            ? 'text-[13px] leading-[1.4] text-white/95 font-medium' 
            : 'text-[14px] leading-relaxed text-zinc-800 dark:text-zinc-100 pr-12'
        }`}>
          {content && typeof content === "string" ? (
            isUser ? (
              <div className="break-words">{content}</div>
            ) : (
              <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:my-0 prose-p:text-zinc-800 dark:prose-p:text-zinc-100">
                <Markdown>{content}</Markdown>
              </div>
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
                      <div>{JSON.stringify(result, null, 2)}</div>
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
          <div className="flex flex-row gap-2 overflow-x-auto thin-scrollbar">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};