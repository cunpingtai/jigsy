import { FC } from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
  title: string;
  subtitle?: string;
}

export const Hero: FC<HeroProps> = ({ className, title, subtitle }) => {
  return (
    <div
      className={cn(
        "w-full py-12 px-4 text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-8",
        className
      )}
    >
      <h1 className="text-4xl font-bold text-primary mb-4">{title}</h1>
      {subtitle && (
        <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </h2>
      )}
    </div>
  );
};
