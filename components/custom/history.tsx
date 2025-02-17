"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { Chat } from "@/db/schema";
import { fetcher } from "@/lib/utils";

import { DeleteIcon, HistoryIcon, PlusIcon } from "./icons";
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

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <HistoryIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] sm:w-[350px] p-0 bg-white dark:bg-gray-900 shadow-lg"
        >
          <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
            <SheetTitle className="text-lg font-semibold">Chat History</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {/* New Chat Button */}
                <Link href="/" className="block">
                  <Button
                    // Changed variant from "primary" to "default" to match allowed types.
                    variant="default"
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>New Chat</span>
                  </Button>
                </Link>
                {/* Chat History List */}
                <div className="mt-4 space-y-1">
                  {(history || []).map((chat) => (
                    <div key={chat.id} className="group relative">
                      <Link href={`/chat/${chat.id}`} className="block">
                        <Button
                          variant={chat.id === id ? "secondary" : "ghost"}
                          className={`w-full text-left flex items-center justify-between rounded-lg p-3 transition-colors ${
                            chat.id === id
                              ? "bg-gray-200 dark:bg-gray-700"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        ><span>
  {typeof chat.messages[0]?.content === "object" && chat.messages[0]?.content !== null
    ? (chat.messages[0]?.content as { fileName?: string })?.fileName || "File upload or scan result"
    : typeof chat.messages[0]?.content === "string"
    ? chat.messages[0]?.content.slice(0, 30)
    : "File upload or scan result"}
</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setDeleteId(chat.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
