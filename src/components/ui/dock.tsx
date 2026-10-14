import React, { useRef } from 'react';
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface DockProps {
  children: React.ReactNode;
  className?: string;
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
}

interface DockIconProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: MotionValue<number>;
  showLabels?: boolean;
}

export const Dock: React.FC<DockProps> = ({
  children,
  className = '',
  iconSize = 40,
  iconMagnification = 58,
  iconDistance = 140,
}) => {
  const mouseX = useMotionValue(Infinity);
  const isPressingOption = useRef(false);
  const labelTimer = useRef<number | null>(null);
  const [showLabels, setShowLabels] = React.useState(false);

  const endPress = () => {
    isPressingOption.current = false;
    if (labelTimer.current !== null) window.clearTimeout(labelTimer.current);
    labelTimer.current = null;
    setShowLabels(false);
    mouseX.set(Infinity);
  };

  return (
    <motion.div
      onPointerDown={(event) => {
        if (!(event.target as HTMLElement).closest('button')) return;
        isPressingOption.current = true;
        setShowLabels(false);
        labelTimer.current = window.setTimeout(() => setShowLabels(true), 2000);
        mouseX.set(event.clientX);
      }}
      onPointerMove={(event) => {
        if (isPressingOption.current) mouseX.set(event.clientX);
      }}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={endPress}
      className={`flex h-[58px] w-max items-center justify-center gap-2 rounded-full border border-default-200 bg-[#111111]/90 p-2 shadow-xl backdrop-blur-md ${className}`}
    >
      {React.Children.map(children, (child) => React.isValidElement<DockIconProps>(child) && child.type === DockIcon
        ? React.cloneElement(child, { mouseX, size: iconSize, magnification: iconMagnification, distance: iconDistance, showLabels })
        : child)}
    </motion.div>
  );
};

export const DockIcon: React.FC<DockIconProps> = ({
  children,
  label,
  className = '',
  size = 40,
  magnification = 58,
  distance = 140,
  mouseX,
  showLabels = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const defaultMouseX = useMotionValue(Infinity);
  const distanceFromPointer = useTransform(mouseX ?? defaultMouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });
  const sizeMotion = useSpring(useTransform(distanceFromPointer, [-distance, 0, distance], [size, magnification, size]), {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: sizeMotion, height: sizeMotion, padding: Math.max(6, size * 0.2) }}
      data-dock-icon="true"
      className={`relative flex aspect-square items-center justify-center rounded-full ${className}`}
    >
      {children}
      {label && (
        <motion.span
          initial={false}
          animate={{ opacity: showLabels ? 1 : 0, y: showLabels ? 0 : 4, scale: showLabels ? 1 : 0.96 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-default-200 bg-[#111111] px-3 py-1.5 text-xs font-medium text-foreground shadow-lg"
          aria-hidden={!showLabels}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
};
