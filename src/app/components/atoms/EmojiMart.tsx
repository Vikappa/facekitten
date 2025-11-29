"use client";

import React, { useEffect, useRef } from "react";

interface EmojiMartProps {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  value: string;
  onChange: (newValue: string) => void;
  onClose: () => void;
}

const EMOJIS = [
  "😺", "😸", "😹", "😻", "😼", "😽",
  "🙀", "😿", "😾", "🐱", "✨", "💖",
  "🔥", "😂", "🤣", "🥹", "😍", "😎",
];

export const EmojiMart: React.FC<EmojiMartProps> = ({
  inputRef,
  value,
  onChange,
  onClose,
}) => {
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Chiudi al primo click/tap fuori
  useEffect(() => {
    const handleOutside = (ev: MouseEvent | TouchEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(ev.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [onClose]);

  const handleEmojiClick = (emoji: string) => {
    const input = inputRef.current;

    const newValue = value + emoji;
    onChange(newValue);

    if (input) {
      requestAnimationFrame(() => {
        input.focus();
        const pos = newValue.length;
        input.setSelectionRange(pos, pos);
      });
    }

    onClose();
  };

  return (
    <div
      ref={pickerRef}
      className="
        absolute 
        left-0 
        top-full 
        mt-2
        z-50
        bg-white shadow-lg rounded-xl border border-gray-200 p-2 w-[260px]
      "
    >
      <div className="mb-2 text-xs text-gray-600 px-1">
        Emoji
      </div>

      <div className="grid grid-cols-8 gap-1 text-xl">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="hover:bg-gray-100 rounded-md p-1 leading-none"
            onClick={() => handleEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
