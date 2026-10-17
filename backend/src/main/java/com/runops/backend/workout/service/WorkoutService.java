package com.runops.backend.workout.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import com.runops.backend.user.model.User;
import com.runops.backend.workout.dto.CreateWorkoutRequest;
import com.runops.backend.workout.dto.WorkoutResponse;
import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;
import com.runops.backend.workout.dto.MonthlyWorkoutSummaryResponse;

@Service
public class WorkoutService {

        private final WorkoutRepository workoutRepository;

        public WorkoutService(WorkoutRepository workoutRepository) {
                this.workoutRepository = workoutRepository;
        }

        public WorkoutResponse createWorkout(CreateWorkoutRequest request, User user) {

                int averagePace = calculateAveragePace(
                                request.distanceKm(),
                                request.durationSeconds());

                Workout workout = new Workout();

                workout.setUser(user);
                workout.setDate(request.date());
                workout.setDistanceKm(request.distanceKm());
                workout.setDurationSeconds(request.durationSeconds());
                workout.setAveragePaceSecondsPerKm(averagePace);
                workout.setNotes(request.notes());

                Workout savedWorkout = workoutRepository.save(workout);

                return toResponse(savedWorkout);
        }

        public WorkoutResponse updateWorkout(Long id, CreateWorkoutRequest request, User user) {

                Workout workout = workoutRepository
                                .findByIdAndUserId(id, user.getId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Workout not found"));

                int averagePace = calculateAveragePace(
                                request.distanceKm(),
                                request.durationSeconds());

                workout.setDate(request.date());
                workout.setDistanceKm(request.distanceKm());
                workout.setDurationSeconds(request.durationSeconds());
                workout.setAveragePaceSecondsPerKm(averagePace);
                workout.setNotes(request.notes());

                Workout savedWorkout = workoutRepository.save(workout);

                return toResponse(savedWorkout);
        }

        public void deleteWorkout(Long id, User user) {

                Workout workout = workoutRepository
                                .findByIdAndUserId(id, user.getId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Workout not found"));

                workoutRepository.delete(workout);
        }

        public List<WorkoutResponse> getAllWorkouts(User user) {

                return workoutRepository
                                .findAllByUserIdOrderByDateDescIdDesc(user.getId())
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        public Optional<WorkoutResponse> getWorkoutById(Long id, User user) {

                return workoutRepository
                                .findByIdAndUserId(id, user.getId())
                                .map(this::toResponse);
        }

        @Transactional(readOnly = true)
        public MonthlyWorkoutSummaryResponse getMonthlySummary(int year, int month, User user) {
                if (year < 1 || year > 9999 || month < 1 || month > 12) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Year must be between 1 and 9999 and month between 1 and 12");
                }

                YearMonth requestedMonth = YearMonth.of(year, month);

                LocalDate startDate = requestedMonth.atDay(1);
                LocalDate endDate = requestedMonth.plusMonths(1).atDay(1);

                List<Workout> workouts = workoutRepository
                                .findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(user.getId(), startDate, endDate);

                double totalDistanceKm = 0;
                long totalDurationSeconds = 0;

                for (Workout workout : workouts) {
                        totalDistanceKm += workout.getDistanceKm();
                        totalDurationSeconds += workout.getDurationSeconds();
                }

                Integer averagePaceSecondsPerKm = null;

                if (totalDistanceKm > 0) {
                        averagePaceSecondsPerKm = Math.toIntExact(Math.round(totalDurationSeconds / totalDistanceKm));
                }

                return new MonthlyWorkoutSummaryResponse(
                                year,
                                month,
                                workouts.size(),
                                totalDistanceKm,
                                totalDurationSeconds,
                                averagePaceSecondsPerKm);
        }

        private int calculateAveragePace(double distanceKm, int durationSeconds) {

                double calculatedPace = durationSeconds / distanceKm;

                if (!Double.isFinite(calculatedPace)
                                || calculatedPace < 0.5
                                || calculatedPace >= Integer.MAX_VALUE + 0.5) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Invalid workout distance or duration");
                }

                return (int) Math.round(calculatedPace);
        }

        private WorkoutResponse toResponse(Workout workout) {

                return new WorkoutResponse(
                                workout.getId(),
                                workout.getDate(),
                                workout.getDistanceKm(),
                                workout.getDurationSeconds(),
                                workout.getAveragePaceSecondsPerKm(),
                                workout.getNotes());
        }
}