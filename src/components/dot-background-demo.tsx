import { cn } from "@/lib/utils";
import React from "react";

export function DotBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-screen w-full bg-background text-foreground transition-colors", className)}>
      <div
        className={cn(
          "pointer-events-none fixed inset-0 h-full w-full z-0",
          "[background-size:24px_24px]",
          "[background-image:radial-gradient(#e4e4e7_1.2px,transparent_1.2px)]",
          "dark:[background-image:radial-gradient(#262626_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] transition-colors" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function DotBackgroundDemo({ children }: { children?: React.ReactNode }) {
  if (children) {
    return <DotBackground>{children}</DotBackground>;
  }

  return (
    <div className="relative flex h-[50rem] w-full items-center justify-center bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
        Backgrounds
      </p>
    </div>
  );
}

