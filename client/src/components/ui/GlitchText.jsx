import React, { useState, useEffect } from "react";

const SYMBOLS = "{}[]<>=>/*+-|\\;:!?#@&$%^~_.01";

/**
 * Brutalist scrambling text effect for i18n changes
 */
export default function GlitchText({ children, speed = 40 }) {
  const [displayText, setDisplayText] = useState(children);
  const targetText = String(children);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => {
        return targetText
          .split("")
          .map((char, index) => {
            if (index < iteration) return targetText[index];
            if (char === " ") return " ";
            return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          })
          .join("");
      });
      
      iteration += 1;
      if (iteration > targetText.length) {
        clearInterval(interval);
        setDisplayText(targetText);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [children, speed]);

  return <span>{displayText}</span>;
}
