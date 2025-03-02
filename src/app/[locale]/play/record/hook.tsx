"use client";
import { GameRecordList } from "@/components/play/GameRecordList";
import { useI18n } from "../../providers";

export default function PlayRecordPage({
  locale,
  records,
  total,
  currentPage,
  pageSize,
}: {
  locale: string;
  records: any;
  total: number;
  currentPage: number;
  pageSize: number;
}) {
  const { data } = useI18n();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{data.myGameRecord}</h1>
      <GameRecordList
        locale={locale}
        records={records}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
