import { FC } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Card } from "@/components/ui/card";

const carouselItems = [
  {
    id: 1,
    title: "每周挑战",
    image: "https://placehold.co/600x400",
    description: "参与本周最热门的拼图挑战",
  },
  {
    id: 2,
    title: "每日挑战",
    image: "https://placehold.co/600x400",
    description: "每日挑战，挑战你的极限",
  },
  // ... 其他轮播项
];

export const PuzzleCarousel: FC = () => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {carouselItems.map((item) => (
          <CarouselItem key={item.id}>
            <Card className="relative h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6 transform transition-transform duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-white/80">
                  {item.description}
                </p>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="transition-transform hover:scale-110 left-2" />
      <CarouselNext className="transition-transform hover:scale-110 right-2" />
    </Carousel>
  );
};
