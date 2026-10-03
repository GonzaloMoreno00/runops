package com.runops.backend.workout.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.runops.backend.workout.dto.CreateWorkoutRequest;
import com.runops.backend.workout.dto.WorkoutResponse;
import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;

class WorkoutServiceTest {

    @Test
    void shouldCalculateAveragePaceBeforeSaving() {

        // Arrange
        WorkoutRepository mockRepository = mock(WorkoutRepository.class);
        WorkoutService service = new WorkoutService(mockRepository);

        CreateWorkoutRequest request = new CreateWorkoutRequest(
                LocalDate.of(2026, 9, 27),
                5.0,
                1500,
                "Rodaje suave"
        );

        when(mockRepository.save(any(Workout.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WorkoutResponse result = service.createWorkout(request);

        // Assert
        assertEquals(300, result.averagePaceSecondsPerKm());

        ArgumentCaptor<Workout> captor =
                ArgumentCaptor.forClass(Workout.class);

        verify(mockRepository).save(captor.capture());

        Workout savedWorkout = captor.getValue();

        assertEquals(300, savedWorkout.getAveragePaceSecondsPerKm());
    }

    @Test
    void shouldRoundAveragePaceToNearestSecond() {

        // Arrange
        WorkoutRepository mockRepository = mock(WorkoutRepository.class);
        WorkoutService service = new WorkoutService(mockRepository);

        CreateWorkoutRequest request = new CreateWorkoutRequest(
                LocalDate.of(2026, 9, 30),
                5.0,
                1503,
                "Rodaje de prueba"
        );

        when(mockRepository.save(any(Workout.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WorkoutResponse result = service.createWorkout(request);

        // Assert
        assertEquals(301, result.averagePaceSecondsPerKm());
    }

    @Test
    void shouldCreateWorkoutWithoutAssignedId() {

        // Arrange
        WorkoutRepository mockRepository = mock(WorkoutRepository.class);
        WorkoutService service = new WorkoutService(mockRepository);

        CreateWorkoutRequest request = new CreateWorkoutRequest(
                LocalDate.of(2026, 9, 30),
                5.0,
                1500,
                "Rodaje de prueba"
        );

        when(mockRepository.save(any(Workout.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        service.createWorkout(request);

        // Assert
        ArgumentCaptor<Workout> captor =
                ArgumentCaptor.forClass(Workout.class);

        verify(mockRepository).save(captor.capture());

        Workout savedWorkout = captor.getValue();

        assertNull(savedWorkout.getId());
        assertEquals(5.0, savedWorkout.getDistanceKm());
        assertEquals(1500, savedWorkout.getDurationSeconds());
        assertEquals(300, savedWorkout.getAveragePaceSecondsPerKm());
    }
}
