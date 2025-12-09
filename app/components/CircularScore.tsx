'use client';

interface CircularScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function CircularScore({ score, size = 'md', showLabel = true }: CircularScoreProps) {
  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: 'text-lg' },
    md: { width: 100, stroke: 6, fontSize: 'text-3xl' },
    lg: { width: 140, stroke: 8, fontSize: 'text-4xl' },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 70) return '#10B981'; // success
    if (score >= 50) return '#F59E0B'; // warning
    return '#EF4444'; // error
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${fontSize} font-bold`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm text-text-secondary mt-2 font-medium">AI Score</span>
      )}
    </div>
  );
}
