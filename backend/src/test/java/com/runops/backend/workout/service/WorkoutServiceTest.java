package com.runops.backend.workout.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

import com.runops.backend.user.model.User;
import com.runops.backend.workout.dto.CreateWorkoutRequest;
import com.runops.backend.workout.dto.MonthlyWorkoutSummaryResponse;
import com.runops.backend.workout.dto.WorkoutResponse;
import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;

class WorkoutServiceTest {

        @Test
        void shouldCalculateAveragePaceBeforeSaving() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                CreateWorkoutRequest request = new CreateWorkoutRequest(
                                LocalDate.of(2026, 9, 27),
                                5.0,
                                1500,
                                "Rodaje suave");

                when(mockRepository.save(any(Workout.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                WorkoutResponse result = service.createWorkout(request, user);

                assertEquals(300, result.averagePaceSecondsPerKm());

                ArgumentCaptor<Workout> captor = ArgumentCaptor.forClass(Workout.class);

                verify(mockRepository).save(captor.capture());

                Workout savedWorkout = captor.getValue();

                assertEquals(300, savedWorkout.getAveragePaceSecondsPerKm());
                assertSame(user, savedWorkout.getUser());
        }

        @Test
        void shouldRoundAveragePaceToNearestSecond() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                CreateWorkoutRequest request = new CreateWorkoutRequest(
                                LocalDate.of(2026, 9, 30),
                                5.0,
                                1503,
                                "Rodaje de prueba");

                when(mockRepository.save(any(Workout.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                WorkoutResponse result = service.createWorkout(request, user);

                assertEquals(301, result.averagePaceSecondsPerKm());
        }

        @Test
        void shouldCreateWorkoutWithoutAssignedId() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                CreateWorkoutRequest request = new CreateWorkoutRequest(
                                LocalDate.of(2026, 9, 30),
                                5.0,
                                1500,
                                "Rodaje de prueba");

                when(mockRepository.save(any(Workout.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                service.createWorkout(request, user);

                ArgumentCaptor<Workout> captor = ArgumentCaptor.forClass(Workout.class);

                verify(mockRepository).save(captor.capture());

                Workout savedWorkout = captor.getValue();

                assertNull(savedWorkout.getId());
                assertSame(user, savedWorkout.getUser());
                assertEquals(5.0, savedWorkout.getDistanceKm());
                assertEquals(1500, savedWorkout.getDurationSeconds());
                assertEquals(300, savedWorkout.getAveragePaceSecondsPerKm());
        }

        @Test
        void shouldReturnOnlyWorkoutsForAuthenticatedUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                Workout workout1 = createWorkout(user, 5.0, 1500);
                Workout workout2 = createWorkout(user, 10.0, 3000);

                when(mockRepository.findAllByUserIdOrderByDateDescIdDesc(user.getId()))
                                .thenReturn(List.of(workout1, workout2));

                List<WorkoutResponse> result = service.getAllWorkouts(user);

                assertEquals(2, result.size());
                assertEquals(5.0, result.get(0).distanceKm());
                assertEquals(10.0, result.get(1).distanceKm());

                verify(mockRepository)
                                .findAllByUserIdOrderByDateDescIdDesc(user.getId());
        }

        @Test
        void shouldReturnWorkoutWhenItBelongsToUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                Workout workout = createWorkout(user, 5.0, 1500);

                when(mockRepository.findByIdAndUserId(1L, user.getId()))
                                .thenReturn(Optional.of(workout));

                Optional<WorkoutResponse> result = service.getWorkoutById(1L, user);

                assertTrue(result.isPresent());
                assertEquals(5.0, result.get().distanceKm());

                verify(mockRepository)
                                .findByIdAndUserId(1L, user.getId());
        }

        @Test
        void shouldReturnEmptyWhenWorkoutDoesNotBelongToUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                when(mockRepository.findByIdAndUserId(99L, user.getId()))
                                .thenReturn(Optional.empty());

                Optional<WorkoutResponse> result = service.getWorkoutById(99L, user);

                assertTrue(result.isEmpty());

                verify(mockRepository)
                                .findByIdAndUserId(99L, user.getId());
        }

        @Test
        void shouldUpdateWorkoutWhenItBelongsToUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                Workout workout = createWorkout(user, 5.0, 1500);

                CreateWorkoutRequest request = new CreateWorkoutRequest(
                                LocalDate.of(2026, 10, 10),
                                10.0,
                                3600,
                                "Entrenamiento actualizado");

                when(mockRepository.findByIdAndUserId(1L, user.getId()))
                                .thenReturn(Optional.of(workout));

                when(mockRepository.save(workout))
                                .thenReturn(workout);

                WorkoutResponse result = service.updateWorkout(
                                1L,
                                request,
                                user);

                assertEquals(LocalDate.of(2026, 10, 10), result.date());
                assertEquals(10.0, result.distanceKm());
                assertEquals(3600, result.durationSeconds());
                assertEquals(360, result.averagePaceSecondsPerKm());
                assertEquals("Entrenamiento actualizado", result.notes());

                verify(mockRepository)
                                .findByIdAndUserId(1L, user.getId());

                verify(mockRepository)
                                .save(workout);
        }

        @Test
        void shouldThrowNotFoundWhenUpdatingWorkoutThatDoesNotBelongToUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                CreateWorkoutRequest request = new CreateWorkoutRequest(
                                LocalDate.of(2026, 10, 10),
                                10.0,
                                3000,
                                "Entrenamiento actualizado");

                when(mockRepository.findByIdAndUserId(99L, user.getId()))
                                .thenReturn(Optional.empty());

                ResponseStatusException exception = assertThrows(
                                ResponseStatusException.class,
                                () -> service.updateWorkout(
                                                99L,
                                                request,
                                                user));

                assertEquals(404, exception.getStatusCode().value());

                verify(mockRepository)
                                .findByIdAndUserId(99L, user.getId());
        }

        private User createTestUser() {

                User user = mock(User.class);

                when(user.getId()).thenReturn(1L);

                return user;
        }

        private Workout createWorkout(
                        User user,
                        double distanceKm,
                        int durationSeconds) {

                Workout workout = new Workout();

                workout.setUser(user);
                workout.setDate(LocalDate.of(2026, 10, 1));
                workout.setDistanceKm(distanceKm);
                workout.setDurationSeconds(durationSeconds);
                workout.setAveragePaceSecondsPerKm(
                                (int) Math.round(durationSeconds / distanceKm));
                workout.setNotes("Test workout");

                return workout;
        }

        @Test
        void shouldDeleteWorkoutWhenItBelongsToUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                Workout workout = createWorkout(user, 5.0, 1500);

                when(mockRepository.findByIdAndUserId(1L, user.getId()))
                                .thenReturn(Optional.of(workout));

                service.deleteWorkout(1L, user);

                verify(mockRepository)
                                .findByIdAndUserId(1L, user.getId());

                verify(mockRepository)
                                .delete(workout);
        }

        @Test
        void shouldThrowNotFoundWhenDeletingWorkoutThatDoesNotBelongToUser() {

                WorkoutRepository mockRepository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(mockRepository);

                User user = createTestUser();

                when(mockRepository.findByIdAndUserId(99L, user.getId()))
                                .thenReturn(Optional.empty());

                ResponseStatusException exception = assertThrows(
                                ResponseStatusException.class,
                                () -> service.deleteWorkout(99L, user));

                assertEquals(404, exception.getStatusCode().value());

                verify(mockRepository)
                                .findByIdAndUserId(99L, user.getId());
        }

        @Test
        void shouldCalculateMonthlySummaryUsingTotalTimeAndDistance() {
                WorkoutRepository repository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(repository);
                User user = createTestUser();

                Workout firstWorkout = createWorkout(user, 5.0, 1500);
                Workout secondWorkout = createWorkout(user, 10.0, 3600);

                LocalDate startDate = LocalDate.of(2026, 10, 1);
                LocalDate endDate = LocalDate.of(2026, 11, 1);

                when(repository
                                .findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(
                                                user.getId(), startDate, endDate))
                                .thenReturn(List.of(firstWorkout, secondWorkout));

                MonthlyWorkoutSummaryResponse result = service.getMonthlySummary(2026, 10, user);

                assertEquals(2026, result.year());
                assertEquals(10, result.month());
                assertEquals(2, result.workoutCount());
                assertEquals(15.0, result.totalDistanceKm(), 0.000001);
                assertEquals(5100L, result.totalDurationSeconds());
                assertEquals(
                                Integer.valueOf(340),
                                result.averagePaceSecondsPerKm());

                verify(repository)
                                .findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(
                                                user.getId(), startDate, endDate);
        }

        @Test
        void shouldReturnZeroTotalsAndNullPaceForEmptyMonth() {
                WorkoutRepository repository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(repository);
                User user = createTestUser();

                when(repository
                                .findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(
                                                user.getId(),
                                                LocalDate.of(2026, 10, 1),
                                                LocalDate.of(2026, 11, 1)))
                                .thenReturn(List.of());

                MonthlyWorkoutSummaryResponse result = service.getMonthlySummary(2026, 10, user);

                assertEquals(0, result.workoutCount());
                assertEquals(0.0, result.totalDistanceKm(), 0.000001);
                assertEquals(0L, result.totalDurationSeconds());
                assertNull(result.averagePaceSecondsPerKm());
        }

        @Test
        void shouldUseNextYearAsExclusiveEndForDecember() {
                WorkoutRepository repository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(repository);
                User user = createTestUser();

                LocalDate startDate = LocalDate.of(2026, 12, 1);
                LocalDate endDate = LocalDate.of(2027, 1, 1);

                when(repository
                                .findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(
                                                user.getId(), startDate, endDate))
                                .thenReturn(List.of());

                service.getMonthlySummary(2026, 12, user);

                verify(repository)
                                .findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(
                                                user.getId(), startDate, endDate);
        }

        @Test
        void shouldRejectInvalidMonth() {
                WorkoutRepository repository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(repository);
                User user = createTestUser();

                ResponseStatusException exception = assertThrows(
                                ResponseStatusException.class,
                                () -> service.getMonthlySummary(2026, 13, user));

                assertEquals(400, exception.getStatusCode().value());
        }

        @Test
        void shouldRejectInvalidYear() {
                WorkoutRepository repository = mock(WorkoutRepository.class);
                WorkoutService service = new WorkoutService(repository);
                User user = createTestUser();

                ResponseStatusException exception = assertThrows(
                                ResponseStatusException.class,
                                () -> service.getMonthlySummary(0, 10, user));

                assertEquals(400, exception.getStatusCode().value());
        }

}