import React from "react";
import { motion } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { Skeleton } from "./ui/Skeleton"; // Assuming a shared Skeleton component

/**
 * ResultCard Component
 * Features: Framer Motion entry, polymorphic icon support, and refined typography.
 */
export const ResultCard = ({
  title,
  badge,
  content,
  secondaryContent,
  icon: Icon,
  isLoading = false,
  variant = "default" // e.g., 'default', 'featured', or 'accent'
}) => {
  
  if (isLoading) return <ResultCardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300"
    >
      {/* Platform Branding & Actions */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
            {Icon && <Icon size={20} strokeWidth={2.25} />}
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 leading-none mb-1.5">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-black uppercase tracking-[0.08em] text-indigo-500/80">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <CopyButton
            text={secondaryContent ? `${content}\n\n${secondaryContent}` : content}
            className="p-2 hover:bg-slate-100 rounded-lg"
          />
        </div>
      </div>

      {/* Primary Content Area */}
      <div className="flex-grow">
        <div className="text-[13px] leading-relaxed text-slate-600 font-medium whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-700">
          {content}
        </div>

        {secondaryContent && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Strategy Note
              </p>
            </div>
            <div className="text-[12px] text-slate-500 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              {secondaryContent}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Internal Skeleton for loading states
const ResultCardSkeleton = () => (
  <div className="h-full bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
    <div className="flex gap-4 mb-6">
      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
      <div className="space-y-2 flex-grow">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-2 bg-slate-100 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-2 bg-slate-100 rounded w-full" />
      <div className="h-2 bg-slate-100 rounded w-5/6" />
      <div className="h-2 bg-slate-100 rounded w-4/6" />
    </div>
  </div>
);