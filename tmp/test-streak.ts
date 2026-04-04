import { calculateSmartStreak, getWeeklyStatus } from './src/lib/streak-utils';

const test = () => {
  const schedule = ['Mon', 'Wed', 'Fri'];
  const today = new Date();
  const dateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  console.log("Scenario 1: Perfect adherence");
  const workouts1 = [dateStr(0), dateStr(2), dateStr(4)]; // Today, 2 days ago, 4 days ago
  // If today is Friday: Fri, Wed, Mon.
  console.log("Streak:", calculateSmartStreak(workouts1, schedule));

  console.log("\nScenario 2: Missed one day");
  const workouts2 = [dateStr(0), dateStr(4)]; // Today, 4 days ago (Missed 2 days ago)
  console.log("Streak (should be 1 if today is Fri):", calculateSmartStreak(workouts2, schedule));

  console.log("\nScenario 3: No workouts");
  console.log("Streak:", calculateSmartStreak([], schedule));

  console.log("\nScenario 4: Empty schedule");
  console.log("Streak:", calculateSmartStreak(workouts1, []));
};

// Note: This script is intended to be run in a Node environment with TS support or manually verified.
// Since I can't easily run it with imports here, I'll rely on the logic review.
