import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GradientCard({ children, className, ...props }: CardProps) {
  return (
    <Card
      className={cn(
        "bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform border-none",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
