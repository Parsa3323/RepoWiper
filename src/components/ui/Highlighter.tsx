import React, { useEffect, useRef } from 'react';
import { annotate } from 'rough-notation';

interface HighlighterProps {
  children: React.ReactNode;
  action?: 'highlight' | 'underline' | 'box' | 'circle' | 'bracket' | 'crossed-off' | 'strike-through';
  color?: string;
}

export const Highlighter: React.FC<HighlighterProps> = ({ children, action = 'highlight', color = '#ffd1dc' }) => {
  const targetRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!targetRef.current) return undefined;
    const annotation = annotate(targetRef.current, {
      type: action,
      color,
      strokeWidth: 2,
      padding: [2, -6, 8, -6],
      iterations: 2,
      animationDuration: 700,
      multiline: true,
    });
    annotation.show();
    return () => annotation.remove();
  }, [action, color]);

  return <span ref={targetRef}>{children}</span>;
};
