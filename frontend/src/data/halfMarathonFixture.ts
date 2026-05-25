import { Dataset, WeekAggregate, Activity } from "../domain/dataset";

const SICKNESS_WEEK = 4;

function typicalWeek(weekNumber: number, baseDistance: number): WeekAggregate {
  const activities: Activity[] = [
    {
      date: `Week ${weekNumber} Mon`,
      type: "Restorative run",
      distanceKm: baseDistance * 0.25,
      durationMinutes: 35,
    },
    {
      date: `Week ${weekNumber} Wed`,
      type: "Intervals",
      distanceKm: baseDistance * 0.3,
      durationMinutes: 45,
    },
    {
      date: `Week ${weekNumber} Sat`,
      type: "Long run",
      distanceKm: baseDistance * 0.45,
      durationMinutes: 90,
    },
  ];
  return { weekNumber, activities, hasSkipped: false };
}

function sicknessWeek(weekNumber: number, baseDistance: number): WeekAggregate {
  const activities: Activity[] = [
    {
      date: `Week ${weekNumber} Mon`,
      type: "Restorative run",
      distanceKm: baseDistance * 0.25,
      durationMinutes: 30,
    },
    {
      date: `Week ${weekNumber} Wed`,
      type: "Intervals",
      distanceKm: baseDistance * 0.3,
      durationMinutes: 40,
    },
  ];
  return {
    weekNumber,
    activities,
    hasSkipped: true,
    skippedReason: "Skipped due to sickness",
  };
}

export const halfMarathonFixture: Dataset = {
  id: "half-marathon-8w-consistent",
  name: "Half-Marathon Build-Up — 8 Week Consistent Plan",
  isTestFixture: true,
  weeks: Array.from({ length: 8 }, (_, i) => {
    const weekNumber = i + 1;
    const base = 20 + weekNumber * 1.5;
    return weekNumber === SICKNESS_WEEK
      ? sicknessWeek(weekNumber, base)
      : typicalWeek(weekNumber, base);
  }),
};

// Live datasets visible in the selector dropdown.
export const liveDatasets: Dataset[] = [
  {
    id: "marathon-12w",
    name: "Marathon Build-Up — 12 Week",
    isTestFixture: false,
    weeks: [],
  },
  {
    id: "5k-improver",
    name: "5K Improver Plan",
    isTestFixture: false,
    weeks: [],
  },
];