import { motion } from "framer-motion";

export function TypingDots() {
  return (
    <div className="flex space-x-1.5 my-2">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: dot * 0.15,
          }}
        />
      ))}
    </div>
  );
}