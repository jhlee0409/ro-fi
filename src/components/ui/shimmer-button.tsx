import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      onClick,
      disabled = false,
      type = "button"
    },
    ref,
  ) => {
    return (
      <motion.button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]",
          className,
        )}
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        type={type}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* spark container */}
        <div className="absolute inset-0 overflow-visible [container-type:size]">
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="absolute inset-[-100%] w-auto rotate-0 animate-shimmer [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* Backdrop */}
        <div className="absolute inset-[var(--cut)] z-[1] rounded-[calc(var(--radius)-var(--cut))] bg-gradient-to-br from-purple-600 to-pink-600 opacity-90" />

        {/* Content */}
        <div className="relative z-[2] font-medium">{children}</div>
      </motion.button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };