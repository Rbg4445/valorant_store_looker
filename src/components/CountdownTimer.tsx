import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#182531]/90 border border-red-500/30 rounded-xl text-xs font-mono text-gray-200 shadow-md shrink-0 w-full sm:w-auto justify-center sm:justify-start">
      <Clock className="w-4 h-4 text-[#ff4655] animate-pulse shrink-0" />
      <span className="text-gray-400 font-sans text-[11px] sm:text-xs uppercase font-semibold">
        Yenilenmeye Kalan:
      </span>
      <span className="text-white font-bold text-xs sm:text-sm tracking-wider font-mono">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
};
