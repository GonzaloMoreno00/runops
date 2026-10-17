package com.runops.backend.workout.dto;

public record MonthlyWorkoutSummaryResponse(
        int year,
        int month,
        int workoutCount,
        double totalDistanceKm,
        long totalDurationSeconds,
        Integer averagePaceSecondsPerKm
) {
}