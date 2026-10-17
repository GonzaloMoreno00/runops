import { Workout } from '../model/workout';
import { calculateWeeklyDistances } from './weekly-distance';

function workout(date: string, distanceKm: number): Workout {
  return {
    id: 1, date, distanceKm, durationSeconds: 1500,
    averagePaceSecondsPerKm: 300, notes: null
  };
}

describe('calculateWeeklyDistances', () => {
  it('groups Monday to Sunday, clips to the month and includes empty weeks', () => {
    const weeks = calculateWeeklyDistances('2026-10', [
      workout('2026-09-30', 99),
      workout('2026-10-01', 2.5),
      workout('2026-10-04', 5), // Sunday still belongs to the first bucket.
      workout('2026-10-05', 10), // Monday starts a new bucket.
      workout('2026-10-31', 3),
      workout('2026-11-01', 99)
    ]);

    expect(weeks.map(week => [week.label, week.distanceKm])).toEqual([
      ['1–4', 7.5], ['5–11', 10], ['12–18', 0], ['19–25', 0], ['26–31', 3]
    ]);
    expect(weeks.reduce((sum, week) => sum + week.distanceKm, 0)).toBe(20.5);
  });

  it('handles leap February, six-week months, empty months and an invalid selection', () => {
    const leapMonth = calculateWeeklyDistances('2024-02', [workout('2024-02-29', 5)]);
    expect(leapMonth.at(-1)).toEqual({
      startDate: '2024-02-26', endDate: '2024-02-29', label: '26–29', distanceKm: 5
    });

    const emptyMonth = calculateWeeklyDistances('2026-03', []);
    expect(emptyMonth.map(week => week.label)).toEqual([
      '1', '2–8', '9–15', '16–22', '23–29', '30–31'
    ]);
    expect(emptyMonth.every(week => week.distanceKm === 0)).toBe(true);
    expect(calculateWeeklyDistances('', [])).toEqual([]);
    expect(calculateWeeklyDistances('2026-13', [])).toEqual([]);
  });
});
