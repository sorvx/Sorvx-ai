import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-auto"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-center">
          <Image
            src="/images/ai.png"
            height={24}
            width={24}
            alt="sorvx logo"
            className="rounded-sm"
          />
        </div>

        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p className="leading-relaxed">
            This is a Chatbot Named Sorvx AI powered by the Sorvx-S2-70B 
            model built by Sorvx Labs. It uses the{" "}
            <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
              streamText
            </code>{" "}
            function in the server and the{" "}
            <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
              useChat
            </code>{" "}
            hook on the client to create a seamless chat experience.
          </p>
          
          <p className="leading-relaxed">
            This AI ChatBot is developed and maintained by{" "}
            <Link
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              href="https://sorvx.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sorvx Labs
            </Link>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
};
