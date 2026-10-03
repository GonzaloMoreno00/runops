package com.runops.backend.workout.dto;

import java.time.LocalDate;

public record WorkoutResponse(
    Long id,
    LocalDate date,
    Double distanceKm,
    Integer durationSeconds,
    Integer averagePaceSecondsPerKm,
    String notes
) {
}