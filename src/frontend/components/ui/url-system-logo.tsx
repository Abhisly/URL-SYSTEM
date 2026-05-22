"use client";

import type { TargetAndTransition } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";

import { cn } from "@frontend/lib/utils";

const initialProps: TargetAndTransition = {
  pathLength: 0,
  opacity: 0,
  scale: 0.7,
  rotateY: -15,
};

const animateProps: TargetAndTransition = {
  pathLength: 1,
  opacity: 1,
  scale: 1,
  rotateY: 0,
};

type Props = React.ComponentProps<typeof motion.svg> & {
  speed?: number;
  onAnimationComplete?: () => void;
};

export function UrlSystemLogo({
  className,
  speed = 1,
  onAnimationComplete,
  ...props
}: Props) {
  const calc = (x: number) => x * speed;
  const [animationKey, setAnimationKey] = useState(0);

  const baseTransition = {
    type: "spring" as const,
    stiffness: 280,
    damping: 20,
  };

  const handleSequenceComplete = () => {
    if (onAnimationComplete) onAnimationComplete();
    setTimeout(() => {
      setAnimationKey((prev) => prev + 1);
    }, 4000);
  };

  return (
    <motion.svg
      key={animationKey}
      className={cn("h-28", className as string)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 950 250"
      fill="none"
      stroke="currentColor"
      strokeWidth="18"
      initial={{ opacity: 1, scale: 0.8, rotateX: 8 }}
      exit={{ opacity: 0, scale: 0.6, rotateX: -8 }}
      transition={{ 
        duration: 0.7,
        type: "spring",
        stiffness: 140,
        damping: 18
      }}
      {...props}
    >
      <title>URL SYSTEM - Bold Tech Style</title>

      {/* U */}
      <motion.path
        d="M40 60L40 190L100 190L100 60"
        style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
        initial={initialProps}
        animate={animateProps}
        transition={{ ...baseTransition, duration: calc(0.6) }}
      />

      {/* R */}
      <motion.g>
        <motion.path
          d="M130 60L130 190"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.5), delay: calc(0.2) }}
        />
        <motion.path
          d="M130 60L190 60L190 125L130 125"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.5), delay: calc(0.3) }}
        />
        <motion.path
          d="M130 125L190 190"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.4), delay: calc(0.5) }}
        />
      </motion.g>

      {/* L */}
      <motion.path
        d="M220 60L220 190L280 190"
        style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
        initial={initialProps} animate={animateProps}
        transition={{ ...baseTransition, duration: calc(0.6), delay: calc(0.7) }}
      />

      {/* S */}
      <motion.path
        d="M400 60L340 60L340 125L400 125L400 190L340 190"
        style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
        initial={initialProps} animate={animateProps}
        transition={{ ...baseTransition, duration: calc(0.8), delay: calc(1.0) }}
      />

      {/* Y */}
      <motion.g>
        <motion.path
          d="M430 60L460 125"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.4), delay: calc(1.3) }}
        />
        <motion.path
          d="M490 60L460 125L460 190"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.5), delay: calc(1.4) }}
        />
      </motion.g>

      {/* S */}
      <motion.path
        d="M580 60L520 60L520 125L580 125L580 190L520 190"
        style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
        initial={initialProps} animate={animateProps}
        transition={{ ...baseTransition, duration: calc(0.8), delay: calc(1.7) }}
      />

      {/* T */}
      <motion.g>
        <motion.path
          d="M610 60L670 60"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.4), delay: calc(2.0) }}
        />
        <motion.path
          d="M640 60L640 190"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.5), delay: calc(2.1) }}
        />
      </motion.g>

      {/* E */}
      <motion.g>
        <motion.path
          d="M700 60L700 190"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.5), delay: calc(2.4) }}
        />
        <motion.path
          d="M700 60L760 60"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.3), delay: calc(2.5) }}
        />
        <motion.path
          d="M700 125L750 125"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.3), delay: calc(2.6) }}
        />
        <motion.path
          d="M700 190L760 190"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={initialProps} animate={animateProps}
          transition={{ ...baseTransition, duration: calc(0.3), delay: calc(2.7) }}
        />
      </motion.g>

      {/* M */}
      <motion.path
        d="M790 190L790 60L830 125L870 60L870 190"
        style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
        initial={initialProps} animate={animateProps}
        transition={{ ...baseTransition, duration: calc(0.8), delay: calc(2.9) }}
      />

      {/* Tech accent elements */}
      <motion.g className="stroke-blue-500 opacity-70">
        {/* Corner brackets for tech aesthetic */}
        <motion.path
          d="M20 40L20 20L40 20"
          strokeWidth="3"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{
            duration: calc(0.5),
            delay: calc(3.4),
            ease: "easeOut",
          }}
        />
        <motion.path
          d="M910 40L930 20L930 40"
          strokeWidth="3"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{
            duration: calc(0.5),
            delay: calc(3.6),
            ease: "easeOut",
          }}
        />
        <motion.path
          d="M20 210L20 230L40 230"
          strokeWidth="3"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{
            duration: calc(0.5),
            delay: calc(3.8),
            ease: "easeOut",
          }}
        />
        <motion.path
          d="M910 210L930 230L930 210"
          strokeWidth="3"
          style={{ strokeLinecap: "square", strokeLinejoin: "miter" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{
            duration: calc(0.5),
            delay: calc(4.0),
            ease: "easeOut",
          }}
          onAnimationComplete={handleSequenceComplete}
        />
      </motion.g>
    </motion.svg>
  );
}
