import React, { useState, useEffect } from "react";

const SYMBOLS = "{}[]<>=>/*+-|\\;:!?#@&$%^~_.01";

export default function GlitchHover({ children }) {
  const targetText = String(children);
  const [displayText, setDisplayText] = useState(targetText);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    setDisplayText(targetText);
  }, [targetText]);

  const startGlitch = () => {
    if (isGlitching || !targetText) return;
    setIsGlitching(true);
    
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
        setIsGlitching(false);
      }
    }, 25);
  };

  return (
    <span 
      onMouseEnter={startGlitch} 
      className="glitch-hover"
      style={{ display: "inline-block", minWidth: `${targetText.length}ch` }}
    >
      {displayText}
    </span>
  );
}
