"use client";

import Image from "next/image"; import { Attachment, ToolInvocation } from "ai"; import { motion } from "framer-motion"; import { ReactNode, useState } from "react"; import { UserIcon } from "./icons"; import { Markdown } from "./markdown"; import { PreviewAttachment } from "./preview-attachment"; import { TypingDots } from "./typing-dots"; import { TypingEffect } from "./typing-effect"; import { ClipboardCopy } from "lucide-react";

interface MessageProps { chatId: string; messageId?: string; role: string; content: string | ReactNode; attachments?: Array<Attachment>; isFirstMessage?: boolean; isLoading?: boolean; isStreaming?: boolean; }

export const Message = ({ chatId, messageId = "", role, content, attachments, isFirstMessage = false, isLoading = false, isStreaming = false, }: MessageProps) => { const isUser = role === "user"; const [copied, setCopied] = useState(false);

const handleCopy = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); if (typeof content === "string") { navigator.clipboard.writeText(content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); } };

return ( <motion.div className={flex items-start gap-3 px-4 w-full md:w-[500px] md:px-0 ${ isFirstMessage ? "mt-16" : "mt-3" } ${isUser ? "justify-end" : "justify-start"}} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} > <div className={w-[32px] h-[32px] border rounded-full p-1 flex justify-center items-center shrink-0 text-zinc-500 dark:text-zinc-400 ${isUser ? "order-last ml-2" : "order-first mr-2"}}> {isUser ? ( <UserIcon /> ) : ( <Image src="/images/ai.png" height={28} width={28} alt="Chatbot Avatar" /> )} </div>

<div className={`relative flex flex-col gap-2 transition-all duration-200 break-words max-w-[75%] ${isUser ? "bg-purple-700 text-white py-3 px-4 rounded-t-2xl rounded-bl-2xl rounded-br-md self-end hover:bg-purple-600" : "bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-lg group"}`}>
    {isLoading ? (
      <TypingDots />
    ) : (
      <>
        <div className={isUser ? "text-sm font-medium" : "text-base leading-relaxed pr-12"}>
          {typeof content === "string" ? (
            isUser ? <div>{content}</div> : <TypingEffect text={content} messageId={messageId} chatId={chatId} speed={25} isStreaming={isStreaming} />
          ) : (
            <div>{content}</div>
          )}
        </div>

        {attachments && attachments.length > 0 && (
          <div className="flex flex-row gap-2 overflow-x-auto mt-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}

        {!isUser && (
          <div className="absolute bottom-2 right-2 flex items-center">
            <button onClick={handleCopy} className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none" aria-label={copied ? "Copied!" : "Copy message"}>
              {copied ? (
                <span className="text-xs text-green-500 font-medium">Copied!</span>
              ) : (
                <ClipboardCopy size={16} className="text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        )}
      </>
    )}
  </div>
</motion.div>

); };

