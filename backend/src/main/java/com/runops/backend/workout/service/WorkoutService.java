package com.runops.backend.workout.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    public Workout createWorkout(Workout workout) {
        int averagePace = (int) Math.round(
            workout.getDurationSeconds() / workout.getDistanceKm()
        );

        workout.setAveragePaceSecondsPerKm(averagePace);

        return workoutRepository.save(workout);
    }

    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAllByOrderByDateDescIdDesc();
    }

    public Optional<Workout> getWorkoutById(Long id) {
        return workoutRepository.findById(id);
    }
}