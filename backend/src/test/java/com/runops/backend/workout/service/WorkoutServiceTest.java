package com.runops.backend.workout.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;

class WorkoutServiceTest {

    @Test
    void shouldCalculateAveragePaceBeforeSaving() {
        WorkoutRepository mockRepository = mock(WorkoutRepository.class);

        WorkoutService service = new WorkoutService(mockRepository);

        Workout workout = new Workout(
                LocalDate.of(2026, 9, 27),
                5.0,
                1500,
                null,
                "Rodaje suave");

        when(mockRepository.save(workout)).thenReturn(workout);

        Workout result = service.createWorkout(workout);

        assertEquals(
                300,
                result.getAveragePaceSecondsPerKm());
    }

    @Test
    void shouldRoundAveragePaceToNearestSecond() {

        // Arrange
        WorkoutRepository mockRepository = mock(WorkoutRepository.class);
        WorkoutService service = new WorkoutService(mockRepository);

        Workout workout = new Workout(
                LocalDate.of(2026, 9, 30),
                5.0,
                1503,
                null,
                "Rodaje de prueba");

        when(mockRepository.save(workout)).thenReturn(workout);

        // Act
        Workout result = service.createWorkout(workout);

        // Assert
        assertEquals(301, result.getAveragePaceSecondsPerKm());
    }

    @Test
    void shouldOverrideClientProvidedPace() {

        // Arrange
        WorkoutRepository mockRepository = mock(WorkoutRepository.class);
        WorkoutService service = new WorkoutService(mockRepository);

        Workout workout = new Workout(
                LocalDate.of(2026, 9, 30),
                5.0,
                1500,
                999,
                "Rodaje de prueba");

        when(mockRepository.save(workout)).thenReturn(workout);

        // Act
        Workout result = service.createWorkout(workout);

        // Assert
        assertEquals(300, result.getAveragePaceSecondsPerKm());
    }
}