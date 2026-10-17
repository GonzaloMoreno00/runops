import { Workout } from '../model/workout';

export interface WeeklyDistance {
  startDate: string;
  endDate: string;
  label: string;
  distanceKm: number;
}

// Workouts store calendar dates, not instants. UTC avoids daylight-saving shifts.
function calendarDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  return date;
}

export function calculateWeeklyDistances(
  selectedMonth: string,
  workouts: readonly Workout[]
): WeeklyDistance[] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
    return [];
  }

  const [year, month] = selectedMonth.split('-').map(Number);
  if (year < 1) {
    return [];
  }

  const daysInMonth = calendarDate(year, month, 0).getUTCDate();
  const weeks: WeeklyDistance[] = [];

  for (let startDay = 1; startDay <= daysInMonth;) {
    // Convert Sunday=0 into Monday=0 ... Sunday=6.
    const weekday = (calendarDate(year, month - 1, startDay).getUTCDay() + 6) % 7;
    const endDay = Math.min(startDay + 6 - weekday, daysInMonth);
    const startDate = `${selectedMonth}-${String(startDay).padStart(2, '0')}`;
    const endDate = `${selectedMonth}-${String(endDay).padStart(2, '0')}`;

    const distanceKm = workouts
      .filter(workout => workout.date >= startDate && workout.date <= endDate)
      .reduce((total, workout) => total + workout.distanceKm, 0);

    weeks.push({
      startDate,
      endDate,
      label: startDay === endDay ? `${startDay}` : `${startDay}–${endDay}`,
      distanceKm
    });
    startDay = endDay + 1;
  }

  return weeks;
}
