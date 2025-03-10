import { FC } from "react";
import { Timer, Trophy } from "lucide-react";
import { formatDuration } from "date-fns";
import { zhCN, enUS, ja, ko, de, fr, es, it, pt, ru } from "date-fns/locale";
import { useI18n } from "@/app/[locale]/providers";

interface GameStatsProps {
  timeElapsed: number; // 秒数
  piecesPlaced: number;
  totalPieces: number;
  bestTime?: number; // 秒数
  locale: string;
}

export const GameStats: FC<GameStatsProps> = ({
  timeElapsed,
  locale,
  // piecesPlaced,
  // totalPieces,
  bestTime,
}) => {
  const localeMap = {
    zh: zhCN,
    "zh-CN": zhCN,
    en: enUS,
    ja: ja,
    ko: ko,
    de: de,
    fr: fr,
    es: es,
    it: it,
    pt: pt,
    ru: ru,
  };
  const formatTime = (seconds: number) => {
    const duration = {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60,
    };

    return formatDuration(duration, {
      locale: localeMap[locale as keyof typeof localeMap] || enUS,
    });
  };

  const { data } = useI18n();
  // const progress = Math.round((piecesPlaced / totalPieces) * 100);

  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4" />
        <span>{formatTime(timeElapsed)}</span>
      </div>
      {bestTime && (
        <>
          <span>|</span>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>
              {data.bestTime}: {formatTime(bestTime)}
            </span>
          </div>
        </>
      )}
      {/* <span>|</span> */}
      {/* <div>
        进度: {piecesPlaced}/{totalPieces} ({progress}%)
      </div> */}
    </div>
  );
};
