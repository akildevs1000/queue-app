import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// GradientButton Component
interface GradientButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
}

function GradientButton({ children, className, ...props }: GradientButtonProps) {
  return (
    <Button
      className={cn("bg-gradient-to-r from-blue-500 to-purple-600 text-white", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export { GradientButton };
