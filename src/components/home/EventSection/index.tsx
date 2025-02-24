import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const events = [
  {
    id: 1,
    title: "春日赏花摄影大赛",
    image: "https://placehold.co/600x400",
    status: "进行中",
    endDate: "2024-04-30",
  },
  {
    id: 2,
    title: "动漫角色创作展",
    image: "https://placehold.co/600x400",
    status: "即将开始",
    startDate: "2024-05-01",
  },
];

interface EventSectionProps {
  showAll?: boolean;
}

export const EventSection: FC<EventSectionProps> = ({ showAll = false }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">热门活动</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden group cursor-pointer">
            <div className="relative h-40">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <Badge className="absolute top-2 right-2">{event.status}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {event.endDate
                  ? `截止日期: ${event.endDate}`
                  : `开始日期: ${event.startDate}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
