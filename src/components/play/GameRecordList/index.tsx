"use client";

import { FC } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatDate, formatDuration } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Atom } from "@/services";
import { Pagination } from "./Pagination";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/app/[locale]/providers";
interface GameRecordListProps {
  className?: string;
  records: {
    id: number;
    atom: Atom;
    meta: {
      endTime?: string;
      status: string;
      startTime: string;
    };
  }[];
  total: number;
  currentPage: number;
  pageSize: number;
  locale: string;
}

export const GameRecordList: FC<GameRecordListProps> = ({
  className,
  records,
  total,
  currentPage,
  pageSize,
  locale,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const { data } = useI18n();

  if (records.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-gray-500">{data.notGameRecord}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 md:grid-cols-4 grid-cols-1">
        {records.map((record) => (
          <Card key={record.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div>
                <Image
                  src={getImageUrl(record.atom.coverImage)}
                  alt={record.atom.title}
                  width={600}
                  height={600}
                  className="w-full h-40 object-contain"
                />
              </div>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{record.atom.title}</CardTitle>
                <Badge
                  variant={
                    record.meta.status === "COMPLETED" ? "default" : "outline"
                  }
                >
                  {record.meta.status === "COMPLETED"
                    ? data.completed
                    : data.failed}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {record.atom.content}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {record.meta.startTime ? (
                    <span>
                      {formatDate(record.meta.startTime, "yyyy-MM-dd HH:mm")}
                    </span>
                  ) : (
                    <span>{data.unknown}</span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  <span>
                    {data.gameDuration}:{" "}
                    {record.meta.endTime
                      ? formatDuration(
                          {
                            minutes: Math.floor(
                              (new Date(record.meta.endTime).getTime() -
                                new Date(record.meta.startTime).getTime()) /
                                (1000 * 60)
                            ),
                          },
                          { format: ["minutes"] }
                        )
                      : data.unknown}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link
                className="w-full flex-1 flex justify-center"
                href={`/${locale}/puzzle/${record.atom.id}`}
              >
                <Button variant="outline" className="w-full">
                  {data.viewDetails}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          className="mt-8 flex justify-center"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
