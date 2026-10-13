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
  className?: string;
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: MotionValue<number>;
}

export const Dock: React.FC<DockProps> = ({
  children,
  className = '',
  iconSize = 40,
  iconMagnification = 58,
  iconDistance = 140,
}) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(event) => mouseX.set(event.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex h-[58px] w-max items-center justify-center gap-2 rounded-full border border-default-200 bg-[#111111]/90 p-2 shadow-xl backdrop-blur-md ${className}`}
    >
      {React.Children.map(children, (child) => React.isValidElement<DockIconProps>(child) && child.type === DockIcon
        ? React.cloneElement(child, { mouseX, size: iconSize, magnification: iconMagnification, distance: iconDistance })
        : child)}
    </motion.div>
  );
};

export const DockIcon: React.FC<DockIconProps> = ({
  children,
  className = '',
  size = 40,
  magnification = 58,
  distance = 140,
  mouseX,
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
      className={`flex aspect-square items-center justify-center rounded-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
