"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const suggestedActions = [
  {
    title: "What is The most popular  ",
    label: "Coding Languages For Making Apps?",
    action: "What is the most popular coding languages for making apps?",
  },
  {
    title: "What is pros of Ai",
    label: "in Our Life?",
    action: "What is the pros of ai in our daily life?",
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
}) {
  const textareaRef = useRef(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) adjustHeight();
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInput = (event) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]);

  const submitForm = useCallback(() => {
    handleSubmit(undefined, { experimental_attachments: attachments });
    setAttachments([]);
    if (width && width > 768) textareaRef.current?.focus();
  }, [attachments, handleSubmit, setAttachments, width]);

  return (
    <div className="flex flex-col items-center w-full px-4">
      {messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {suggestedActions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => append({ role: "user", content: action.action })}
              className="p-3 bg-gray-200 dark:bg-gray-800 rounded-lg text-left text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <span className="font-medium">{action.title}</span> {action.label}
            </motion.button>
          ))}
        </div>
      )}

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        multiple
        onChange={() => {}}
      />

      <div className="flex items-center w-full max-w-lg p-3 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-md">
        <Textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className="flex-grow p-2 bg-transparent border-none outline-none resize-none"
          rows={2}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (!isLoading) submitForm();
            }
          }}
        />

        <div className="flex gap-2">
          {isLoading ? (
            <Button onClick={stop} className="p-2 bg-red-500 text-white rounded-full">
              <StopIcon size={18} />
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              className="p-2 bg-blue-500 text-white rounded-full"
              disabled={!input}
            >
              <ArrowUpIcon size={18} />
            </Button>
          )}

          <Button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-400 text-white rounded-full">
            <PaperclipIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
