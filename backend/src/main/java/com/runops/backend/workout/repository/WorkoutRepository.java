package com.runops.backend.workout.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.runops.backend.workout.model.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findAllByUserIdOrderByDateDescIdDesc(Long userId);

    Optional<Workout> findByIdAndUserId(Long id, Long userId);
}