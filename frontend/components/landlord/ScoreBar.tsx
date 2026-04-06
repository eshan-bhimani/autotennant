interface ScoreBarProps {
  score: number | null;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  if (score === null) {
    return <span className="text-sm text-gray-400">Pending</span>;
  }

  let color = "bg-red-500";
  if (score >= 70) color = "bg-green-500";
  else if (score >= 40) color = "bg-yellow-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium">{score}</span>
    </div>
  );
}
