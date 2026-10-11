import React, { CSSProperties } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface LineShadowTextProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, keyof MotionProps>, MotionProps {
  children: string;
  shadowColor?: string;
}

export const LineShadowText: React.FC<LineShadowTextProps> = ({
  children,
  shadowColor = '#ffffff',
  className = '',
  ...props
}) => (
  <motion.span
    {...props}
    data-text={children}
    className={`line-shadow-text relative z-0 inline-flex ${className}`}
    style={{ '--shadow-color': shadowColor, ...props.style } as CSSProperties}
  >
    {children}
  </motion.span>
);
