"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';

import { Chat } from "@/db/schema";
import { fetcher, cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== deleteId);
          }
          return history;
        });
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);
  };

  // Format chat title for display
  const formatChatTitle = (chat: Chat) => {
    if (typeof chat.messages[0]?.content === "object" && chat.messages[0]?.content !== null) {
      return (chat.messages[0]?.content as { fileName?: string })?.fileName || "File upload";
    } else if (typeof chat.messages[0]?.content === "string") {
      const content = chat.messages[0]?.content;
      // Truncate and add ellipsis if needed
      return content.length > 28 ? `${content.slice(0, 28)}...` : content;
    }
    return "New conversation";
  };

  // Get relative time for chat
  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const chatDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return chatDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full"
            aria-label="Chat History"
          >
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        </SheetTrigger>
        
        <SheetContent
          side="left"
          className="w-[320px] sm:w-[380px] p-0 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800"
        >
          <SheetHeader className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
            <SheetTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Chat History
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden">
            <div className="p-4">
              {/* New Chat Button */}
              <Link href="/" className="block" onClick={() => setIsOpen(false)}>
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center gap-2 rounded-lg py-5 bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">New Conversation</span>
                </Button>
              </Link>
            </div>
            
            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading conversations...</span>
                </div>
              ) : history && history.length > 0 ? (
                <AnimatePresence initial={false}>
                  <div className="space-y-1">
                    {history.map((chat) => (
                      <motion.div 
                        key={chat.id} 
                        className="group relative"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link 
                          href={`/chat/${chat.id}`} 
                          className="block" 
                          onClick={() => setIsOpen(false)}
                        >
                          <div
                            className={cn(
                              "w-full text-left flex flex-col rounded-lg p-3 transition-all",
                              chat.id === id 
                                ? "bg-violet-50 dark:bg-violet-900/20 border-l-2 border-violet-500 dark:border-violet-400" 
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-transparent"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 truncate font-medium text-gray-800 dark:text-gray-200">
                                {formatChatTitle(chat)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  {getRelativeTime(chat.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(chat.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete chat</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-3">
                    <MessageSquare className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">No conversations yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Start a new chat to begin a conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-lg border border-gray-300 dark:border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};