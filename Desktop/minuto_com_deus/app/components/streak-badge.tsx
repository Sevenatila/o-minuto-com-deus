
'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDevocionais: number;
  isActive: boolean;
}

export default function StreakBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/streak');
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streak) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-3 py-2 rounded-full border border-orange-200 dark:border-orange-800">
      <Flame className={`h-5 w-5 ${streak.isActive ? 'text-orange-500' : 'text-gray-400'}`} />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {streak.currentStreak} {streak.currentStreak === 1 ? 'dia' : 'dias'}
        </span>
        {streak.longestStreak > streak.currentStreak && (
          <span className="text-xs text-muted-foreground">
            Recorde: {streak.longestStreak}
          </span>
        )}
      </div>
    </div>
  );
}
