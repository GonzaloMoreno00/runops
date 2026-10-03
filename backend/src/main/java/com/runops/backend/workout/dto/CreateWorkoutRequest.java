package com.runops.backend.workout.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateWorkoutRequest(

    @NotNull
    LocalDate date,

    @NotNull
    @Positive
    Double distanceKm,

    @NotNull
    @Positive
    Integer durationSeconds,

    @Size(max = 1000)
    String notes

) {
}