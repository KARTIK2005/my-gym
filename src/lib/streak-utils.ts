export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getDayName = (date: Date): string => {
  return DAYS_OF_WEEK[date.getDay()];
};

/**
 * Calculates a "smart streak" based on completed workouts and a defined schedule.
 * The streak is the number of consecutive *scheduled* days that have been completed.
 * It resets to 0 if a past scheduled day was missed.
 */
export const calculateSmartStreak = (workoutDates: string[], schedule: string[]): number => {
  if (!schedule || schedule.length === 0) return 0;
  if (!workoutDates || workoutDates.length === 0) return 0;

  // Normalize dates to YYYY-MM-DD and unique set
  const completedDates = new Set(workoutDates.map(d => d.split('T')[0]));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  // We check backwards from today
  while (true) {
    const dayName = getDayName(checkDate);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (schedule.includes(dayName)) {
      if (completedDates.has(dateStr)) {
        streak++;
      } else {
        // If it's today and not yet completed, don't break the streak yet
        if (dateStr === today.toISOString().split('T')[0]) {
          // Keep going to check previous days
        } else {
          // A past scheduled day was missed!
          break;
        }
      }
    }

    // Move to the previous day
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Safety break for very long histories (e.g., 2 years)
    if (streak > 730 || checkDate.getFullYear() < 2024) break;
  }

  return streak;
};

/**
 * Returns the status for each day of the current week (Sun-Sat).
 */
export const getWeeklyStatus = (workoutDates: string[], schedule: string[]) => {
  const today = new Date();
  const currentDayIndex = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayIndex);

  const completedDates = new Set(workoutDates.map(d => d.split('T')[0]));

  return DAYS_OF_WEEK.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];
    const isScheduled = schedule.includes(day);
    const isCompleted = completedDates.has(dateStr);
    const isToday = index === currentDayIndex;
    const isPast = index < currentDayIndex;

    let status: 'completed' | 'missed' | 'upcoming' | 'optional' = 'upcoming';

    if (isCompleted) {
      status = 'completed';
    } else if (isScheduled) {
      if (isPast) {
        status = 'missed';
      } else if (isToday) {
        status = 'upcoming'; // Still have time
      }
    } else {
      status = 'optional';
    }

    return {
      day,
      date: dateStr,
      isScheduled,
      isCompleted,
      status
    };
  });
};
