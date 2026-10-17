package com.runops.backend.workout.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.runops.backend.workout.model.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findAllByUserIdOrderByDateDescIdDesc(Long userId);

    List<Workout> findAllByUserIdAndDateGreaterThanEqualAndDateLessThan(
            Long userId,
            LocalDate startDate,
            LocalDate endDate);

    List<Workout> findAllByUserIdAndDateGreaterThanEqualAndDateLessThanOrderByDateDescIdDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate);

    Optional<Workout> findByIdAndUserId(Long id, Long userId);
}