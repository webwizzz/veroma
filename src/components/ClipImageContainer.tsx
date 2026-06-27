"use client";
import {
  motion,
  MotionValue,
  useMotionTemplate,
  useTransform,
} from "motion/react";
import { ReactNode } from "react";

interface CardImageProps {
  index: number;
  scrollYProgress: MotionValue<number>;
  children: ReactNode;
}
export default function ClipImageContainer({
  index,
  scrollYProgress,
  children,
}: CardImageProps) {
  // With 3 images, there are 2 transitions. Step size is 0.5.
  const stepSize = 0.5;

  const bottom = useTransform(
    scrollYProgress,
    [index * stepSize, index * stepSize + stepSize],
    ["0%", "100%"],
  );
  const scale = useTransform(
    scrollYProgress,
    [Math.max(0, (index - 1) * stepSize), index * stepSize + stepSize],
    [1, 1.05],
  );
  const clipPath = useMotionTemplate`inset(0px 0px ${bottom} 0px)`;
  return (
    <motion.div
      className="absolute inset-0"
      style={{ clipPath, zIndex: -index, scale }}
    >
      {children}
    </motion.div>
  );
}
