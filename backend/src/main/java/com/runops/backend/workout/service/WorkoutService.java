package com.runops.backend.workout.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.runops.backend.user.model.User;
import com.runops.backend.workout.dto.CreateWorkoutRequest;
import com.runops.backend.workout.dto.WorkoutResponse;
import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    public WorkoutResponse createWorkout(CreateWorkoutRequest request, User user) {

        // Calculate average pace from distance and duration.
        double calculatedPace = request.durationSeconds() / request.distanceKm();

        // Check that the calculated pace is valid.
        if (!Double.isFinite(calculatedPace)
                || calculatedPace < 0.5
                || calculatedPace >= Integer.MAX_VALUE + 0.5) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid workout distance or duration");
        }

        int averagePace = (int) Math.round(calculatedPace);

        // Build a new entity from the request data.
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

    public void deleteWorkout(Long id, User user) {

        Workout workout = workoutRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Workout not found"));

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