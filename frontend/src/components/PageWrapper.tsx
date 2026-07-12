import React from "react";
import { motion } from "framer-motion";

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
}

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function PageWrapper({ children, title, description, headerAction }: PageWrapperProps) {
  return (
    <motion.div 
      className="space-y-6 max-w-7xl mx-auto w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              {description}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </motion.div>

      {/* Children should wrap their own distinct blocks in motion.div variants={itemVariants} if they want stagger */}
      {children}
    </motion.div>
  );
}
