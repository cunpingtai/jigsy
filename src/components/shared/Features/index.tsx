import { FC } from "react";
import { cn } from "@/lib/utils";
import { Puzzle } from "lucide-react";

interface FeaturesProps {
  className?: string;
  items: {
    title: string;
    description: string;
  }[];
  title?: string;
}

export const Features: FC<FeaturesProps> = ({
  className,
  items,
  title = "功能亮点",
}) => {
  return (
    <div className={cn("w-full py-12", className)}>
      {title && (
        <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map((item, index) => {
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
