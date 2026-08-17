"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function CountdownTimer({
  eventDate,
  eventTime,
  textClassName = "",
}: {
  eventDate: string;
  eventTime: string | null;
  textClassName?: string;
}) {
  const target = new Date(`${eventDate}T${eventTime ?? "00:00"}`).getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining.done) {
    return <p className={`text-sm font-medium ${textClassName}`}>Эхэллээ 🎉</p>;
  }

  const units: [number, string][] = [
    [remaining.days, "өдөр"],
    [remaining.hours, "цаг"],
    [remaining.minutes, "минут"],
    [remaining.seconds, "секунд"],
  ];

  return (
    <div className={`flex items-baseline gap-3 text-sm font-medium ${textClassName}`}>
      {units.map(([value, label]) => (
        <span key={label}>
          <span className="text-lg font-semibold">{value}</span> {label}
        </span>
      ))}
    </div>
  );
}
