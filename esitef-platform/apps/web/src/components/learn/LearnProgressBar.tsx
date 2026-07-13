"use client";

type Props = {
  percent: number;
};

export function LearnProgressBar({ percent }: Props) {
  return (
    <div
      className="learn-progress-track"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso del curso"
    >
      <div className="learn-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
