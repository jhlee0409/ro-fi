import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export function GradientText({
  children,
  className,
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    background: `linear-gradient(-45deg, ${colors.join(", ")})`,
    backgroundSize: "400%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: `gradientAnimation ${animationSpeed}s ease infinite`,
  };

  const borderStyle = showBorder
    ? {
        background: `linear-gradient(-45deg, ${colors.join(", ")})`,
        backgroundSize: "400%",
        animation: `gradientAnimation ${animationSpeed}s ease infinite`,
      }
    : {};

  return (
    <>
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <span
        className={cn(
          "relative inline-block",
          showBorder && "p-[1px] rounded-lg",
          className
        )}
        style={showBorder ? borderStyle : {}}
      >
        {showBorder && (
          <span className="absolute inset-0 rounded-lg bg-background" />
        )}
        <span
          className={cn("relative", showBorder && "block p-2 rounded-lg bg-background")}
          style={gradientStyle}
        >
          {children}
        </span>
      </span>
    </>
  );
}