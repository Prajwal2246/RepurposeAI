import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

/**
 * CopyButton Component
 * @param {string} text - The content to copy
 * @param {string} className - Style overrides
 * @param {string} successText - Screen reader announcement
 */
export const CopyButton = ({ 
  text, 
  className = "", 
  successText = "Copied to clipboard" 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard write failed", err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`relative p-2 rounded-xl border border-transparent transition-all active:scale-95 disabled:opacity-50 ${
        copied 
          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
          : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
      } ${className}`}
      aria-label={copied ? successText : "Copy to clipboard"}
    >
      {/* Screen Reader Announcement */}
      <span className="sr-only" aria-live="polite">
        {copied ? successText : ""}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check size={18} strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Copy size={18} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};