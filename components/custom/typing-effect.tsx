// components/typing-effect.tsx
"use client";

import { useState, useEffect } from "react";
import { Markdown } from "./markdown";

interface TypingEffectProps {
  text: string;
  messageId: string;
  chatId: string;
  speed?: number;
  isStreaming?: boolean;
}

export function TypingEffect({
  text,
  messageId,
  chatId,
  speed = 30,
  isStreaming = false,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  
  // Check if this message has already been animated
  useEffect(() => {
    const animatedMessages = JSON.parse(localStorage.getItem("animatedMessages") || "{}");
    const key = `${chatId}-${messageId}`;
    
    if (animatedMessages[key]) {
      // If this message was already animated, show full text immediately
      setDisplayedText(text);
      setIsComplete(true);
      setShouldAnimate(false);
    }
  }, [chatId, messageId, text]);
  
  // Handle the typing animation
  useEffect(() => {
    if (!shouldAnimate || isComplete) return;
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        
        // Mark this message as animated in localStorage
        const animatedMessages = JSON.parse(localStorage.getItem("animatedMessages") || "{}");
        const key = `${chatId}-${messageId}`;
        animatedMessages[key] = true;
        localStorage.setItem("animatedMessages", JSON.stringify(animatedMessages));
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, chatId, messageId, shouldAnimate, isComplete]);
  
  // For streaming messages, we don't want to animate
  if (isStreaming) {
    return <Markdown>{text}</Markdown>;
  }
  
  return <Markdown>{displayedText}</Markdown>;
}