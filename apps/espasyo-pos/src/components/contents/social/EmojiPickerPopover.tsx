import React, { useEffect, useRef, useState } from "react";
import {
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  AnimatePresence,
  motion } from "framer-motion"; import { Box,
} from "@radix-ui/themes";;

const CATEGORIES: { icon: string; label: string; emojis: string[] }[] = [
  {
    icon: "😊",
    label: "Smileys",
    emojis: [
      "😀","😂","😍","🥰","😎","🤩","🥳","😢","😡","🤔","😴","🤤",
      "😇","🤗","🫡","😏","😤","😱","🥺","😭","😂","😆","😋","😜",
      "🤭","🫠","🥲","😬","🙃","🙄","😐","😑","🤐","🫤","😶","😮",
    ],
  },
  {
    icon: "👍",
    label: "Gestures",
    emojis: [
      "👍","👎","👏","🙌","🤝","🤜","🤛","✊","👊","🫵","👉","👈",
      "☝️","👆","👇","✌️","🤞","🤟","🤘","🤙","💪","🦵","🦶","🖐️",
      "🫶","❤️‍🔥","🫂","🙏","🤲","👐","💅","🤳","🦴","🦷",
    ],
  },
  {
    icon: "🐶",
    label: "Animals",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐸",
      "🐵","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄",
      "🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🐢","🦎","🐍","🐊",
    ],
  },
  {
    icon: "🍕",
    label: "Food",
    emojis: [
      "🍕","🍔","🍟","🌭","🍿","🧆","🥪","🌮","🌯","🥙","🧇","🥞",
      "🍜","🍝","🍛","🍲","🥘","🍣","🍱","🍤","🍙","🍚","🍥","🥮",
      "🍩","🍪","🎂","🍰","🍫","🍬","🍭","🍡","🍧","🍨","🍦","☕",
    ],
  },
  {
    icon: "⚽",
    label: "Sports",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸",
      "🏒","🏑","🥍","🏏","🎿","🛷","🥌","⛷️","🏂","🏋️","🤼","🤺",
      "🤸","⛹️","🏌️","🏇","🧘","🏄","🚵","🚴","🏊","🤽","🧗","🤾",
    ],
  },
  {
    icon: "✈️",
    label: "Travel",
    emojis: [
      "✈️","🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻",
      "🛺","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝","🚞",
      "🛳️","⛴️","🚢","✈️","🛩️","🚁","🛸","🚀","🛰️","💺","🚤","⛵",
    ],
  },
  {
    icon: "💡",
    label: "Objects",
    emojis: [
      "💡","📱","💻","🖥️","🖨️","⌨️","🖱️","🖲️","💾","💿","📀","📷",
      "📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📺","📻","🧭","⏱️",
      "⏰","🔦","🕯️","🪔","💰","💳","💎","🔑","🗝️","🔨","🪛","🔧",
    ],
  },
  {
    icon: "❤️",
    label: "Symbols",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹",
      "💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☯️","🔥","⭐",
      "🌟","✨","💫","⚡","❄️","🌈","🎊","🎉","🎈","🎀","🎁","🏆",
    ],
  },
];

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPickerPopover: React.FC<Props> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ type: "spring", damping: 22, stiffness: 300 }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        background: "var(--color-panel-solid)",
        border: "1px solid var(--gray-a5)",
        borderRadius: "var(--radius-4)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        width: 320,
        overflow: "hidden",
      }}
    >
      {/* Category tabs */}
      <Flex
        style={{
          borderBottom: "1px solid var(--gray-a4)",
          background: "var(--gray-a2)",
          overflowX: "auto",
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            title={cat.label}
            onClick={() => setActiveCategory(i)}
            style={{
              border: "none",
              background: i === activeCategory ? "var(--accent-a4)" : "transparent",
              cursor: "pointer",
              padding: "8px 10px",
              fontSize: 18,
              borderBottom: i === activeCategory ? "2px solid var(--accent-9)" : "2px solid transparent",
              transition: "background 150ms ease",
              flexShrink: 0,
            }}
          >
            {cat.icon}
          </button>
        ))}
      </Flex>

      {/* Category label */}
      <Box px="3" pt="2" pb="1">
        <Text size="1" color="gray" weight="medium">
          {CATEGORIES[activeCategory].label}
        </Text>
      </Box>

      {/* Emoji grid */}
      <Box
        style={{ maxHeight: 200, overflowY: "auto", padding: "4px 8px 8px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 2,
          }}
        >
          {CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
                padding: "4px",
                borderRadius: "var(--radius-2)",
                lineHeight: 1,
                transition: "background 100ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-a3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </Box>
    </motion.div>
  );
};
