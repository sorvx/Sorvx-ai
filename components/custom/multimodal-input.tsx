"use client";

import {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";
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

interface MultimodalInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
}

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
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, width]);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();

      setAttachments((prev) => [
        ...prev,
        {
          name: data.name,
          url: data.url,
          size: data.size,
          uploadedAt: data.uploadedAt,
          contentType: file.type,
        },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed"
      );
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => handleFileUpload(file));
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-4 w-full mx-auto md:max-w-[500px]">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 * index }}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="border-none bg-muted/50 w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll">
          {attachments.map((attachment) => (
            <PreviewAttachment
              key={attachment.url}
              attachment={attachment}
            />
          ))}
          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      {/* Center and constrain the input area to 75% width */}
      <div className="flex justify-center w-full">
        <div className="flex items-center w-full max-w-[75%] bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm p-2">
          <Textarea
            ref={textareaRef}
            placeholder="Send a message..."
            value={input}
            onChange={handleInput}
            className="min-h-[40px] max-h-[150px] overflow-hidden resize-none rounded-lg text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 grow focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (isLoading) {
                  toast.error(
                    "Please wait for the model to finish its response!"
                  );
                } else {
                  submitForm();
                }
              }
            }}
          />

          <div className="flex items-center gap-2 ml-2">
            {isLoading ? (
              <Button
                className="rounded-full p-1.5 text-white"
                onClick={(event) => {
                  event.preventDefault();
                  stop();
                }}
              >
                <StopIcon size={14} />
              </Button>
            ) : (
              <Button
                className="rounded-full p-1.5 text-white"
                onClick={(event) => {
                  event.preventDefault();
                  submitForm();
                }}
                disabled={input.length === 0 || uploadQueue.length > 0}
              >
                <ArrowUpIcon size={14} />
              </Button>
            )}

            <Button
              className="rounded-full p-1.5 dark:border-zinc-700"
              onClick={(event) => {
                event.preventDefault();
                fileInputRef.current?.click();
              }}
              variant="outline"
              disabled={isLoading}
            >
              <PaperclipIcon size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}