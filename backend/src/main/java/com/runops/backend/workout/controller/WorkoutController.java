package com.runops.backend.workout.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.runops.backend.workout.dto.CreateWorkoutRequest;
import com.runops.backend.workout.dto.WorkoutResponse;
import com.runops.backend.workout.service.WorkoutService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:4200")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(
            @Valid @RequestBody CreateWorkoutRequest request) {

        WorkoutResponse response = workoutService.createWorkout(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getAllWorkouts() {

        return ResponseEntity.ok(workoutService.getAllWorkouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponse> getWorkoutById(
            @PathVariable Long id) {

        return workoutService.getWorkoutById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
