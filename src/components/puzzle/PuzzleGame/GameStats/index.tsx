import { FC } from "react";
import { Timer, Trophy } from "lucide-react";
import { formatDuration } from "date-fns";
import { zhCN } from "date-fns/locale";

interface GameStatsProps {
  timeElapsed: number; // 秒数
  piecesPlaced: number;
  totalPieces: number;
  bestTime?: number; // 秒数
}

export const GameStats: FC<GameStatsProps> = ({
  timeElapsed,
  piecesPlaced,
  totalPieces,
  bestTime,
}) => {
  const formatTime = (seconds: number) => {
    const duration = {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60,
    };

    return formatDuration(duration, { locale: zhCN });
  };

  const progress = Math.round((piecesPlaced / totalPieces) * 100);

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
            <span>最佳: {formatTime(bestTime)}</span>
          </div>
        </>
      )}
      <span>|</span>
      <div>
        进度: {piecesPlaced}/{totalPieces} ({progress}%)
      </div>
    </div>
  );
};
