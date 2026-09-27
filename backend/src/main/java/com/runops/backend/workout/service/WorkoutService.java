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
        return workoutRepository.save(workout);
    }

    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    public Optional<Workout> getWorkoutById(Long id) {
        return workoutRepository.findById(id);
    }
}