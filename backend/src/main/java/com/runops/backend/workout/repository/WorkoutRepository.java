package com.runops.backend.workout.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.runops.backend.workout.model.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findAllByOrderByDateDescIdDesc();
}