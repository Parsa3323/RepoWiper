import React, { Children } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className = '' }) => (
  <div className={className}>
    <AnimatePresence initial={false} mode="popLayout">
      {Children.map(children, (child) => (
        <motion.div
          key={React.isValidElement(child) && child.key ? child.key : undefined}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
          layout
        >
          {child}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
