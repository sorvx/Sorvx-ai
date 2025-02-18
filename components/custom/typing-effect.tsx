"use client";

import { motion, usePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Markdown } from "./markdown";

interface TypingEffectProps {
  text: string;
  messageId: string;
  chatId: string;
  className?: string;
  speed?: number;
  isStreaming?: boolean;
}

export function TypingEffect({ 
  text, 
  messageId, 
  chatId, 
  className = "", 
  speed = 30,
  isStreaming = false 
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPresent, safeToRemove] = usePresence();
  const previousTextRef = useRef("");
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (!isPresent) {
      safeToRemove();
      return;
    }

    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Handle streaming updates
    if (isStreaming) {
      setDisplayedText(text);
      setIsAnimating(true);
      return;
    }

    // Check if message was previously animated
    const allAnimatedChats = JSON.parse(localStorage.getItem('animatedChats') || '{}');
    const animatedMessages = allAnimatedChats[chatId] || {};

    if (animatedMessages[messageId]) {
      setDisplayedText(text);
      setIsAnimating(false);
      return;
    }

    // Animate new messages
    setIsAnimating(true);
    let currentIndex = 0;
    const fullText = text;

    const animateText = () => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
        
        const nextDelay = speed + (Math.random() * 10 - 5);
        animationTimeoutRef.current = setTimeout(animateText, nextDelay);
      } else {
        setIsAnimating(false);
        // Mark message as animated
        allAnimatedChats[chatId] = {
          ...animatedMessages,
          [messageId]: true
        };
        localStorage.setItem('animatedChats', JSON.stringify(allAnimatedChats));
      }
    };

    animateText();

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [text, speed, isPresent, safeToRemove, messageId, chatId, isStreaming]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={className}
    >
      <div className="prose dark:prose-invert max-w-none">
        <Markdown>{displayedText || " "}</Markdown>
      </div>
      {isAnimating && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-4 ml-0.5 bg-current"
        />
      )}
    </motion.div>
  );
} 