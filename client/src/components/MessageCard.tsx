import { motion } from "framer-motion";
import type { MessageResponse } from "@shared/routes";
import { cn } from "@/lib/utils";

interface MessageCardProps {
  message: MessageResponse;
  index: number;
  isAdmin?: boolean;
  onDelete?: (id: number) => void; // Unlocks instant execution with parent key state
}

// Map keys must remain entirely lowercase to match database storage formatting
const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  "#ffb7b2": { bg: "#FFB7B2", text: "text-black" }, // Blush
  "#b2e2f2": { bg: "#B2E2F2", text: "text-black" }, // Sky
  "#b2f2bb": { bg: "#B2F2BB", text: "text-black" }, // Mint
  "#fdfd96": { bg: "#FDFD96", text: "text-black" }, // Butter
  "#d1b2f2": { bg: "#D1B2F2", text: "text-black" }, // Lavender
  "#ffd6a5": { bg: "#FFD6A5", text: "text-black" }, // Peach

  // System/Seed fallbacks
  "#18181b": { bg: "#18181b", text: "text-white" },
  "#ef4444": { bg: "#FFB7B2", text: "text-black" },
  "#3b82f6": { bg: "#B2E2F2", text: "text-black" },
  "#10b981": { bg: "#B2F2BB", text: "text-black" },
};
export function MessageCard({
  message,
  index,
  isAdmin,
  onDelete,
}: MessageCardProps) {
  // Normalize the incoming color code string to lowercase for bulletproof lookups
  const normalizedColor = (message.color || "").toLowerCase().trim();

  const theme =
    COLOR_MAP[normalizedColor] ??
    {
      bg: "#FFFFFF",
      text: "text-black",
    };

  const splatClass = `paint-splat-${(index % 4) + 1}`;

  function handleDeleteClick() {
    if (!confirm("Delete permanently?")) return;
    
    if (onDelete) {
      onDelete(message.id); // Triggers parent handler containing token state instantly
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
      }}
      className={cn(
        "relative p-8 flex flex-col justify-between overflow-hidden group transition-all duration-500 neon-glow h-full min-h-[300px]",
        splatClass,
        theme.text
      )}
      style={{ backgroundColor: theme.bg }}
    >
      {isAdmin && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-3 right-3 z-20 text-red-600 text-sm font-bold opacity-70 hover:opacity-100"
          aria-label="Delete message"
        >
          ✕
        </button>
      )}

      <div className="relative z-10 pr-16">
        <h3 className={cn("font-display text-2xl font-bold mb-4", theme.text)}>
          To: {message.toName}
        </h3>

        <p className={cn("font-sans text-lg leading-relaxed font-medium line-clamp-6", theme.text)}>
          {message.content}
        </p>
      </div>

      

      {message.imageUrl && (
        <img
          src={message.imageUrl}
          alt=""
          className="absolute bottom-4 right-4 w-24 h-24 object-cover opacity-50 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      <div className="relative z-10 mt-4 opacity-60 text-xs font-mono uppercase tracking-widest text-black">
        {new Date(
          message.createdAt ?? Date.now()
        ).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </motion.div>
  );
}
