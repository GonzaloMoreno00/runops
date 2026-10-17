package com.runops.backend.workout.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import com.runops.backend.user.model.User;
import com.runops.backend.user.repository.UserRepository;
import com.runops.backend.workout.dto.CreateWorkoutRequest;
import com.runops.backend.workout.dto.WorkoutResponse;
import com.runops.backend.workout.service.WorkoutService;
import com.runops.backend.workout.dto.MonthlyWorkoutSummaryResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final UserRepository userRepository;

    public WorkoutController(
            WorkoutService workoutService,
            UserRepository userRepository) {

        this.workoutService = workoutService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(@Valid @RequestBody CreateWorkoutRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        WorkoutResponse response = workoutService.createWorkout(request, user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getAllWorkouts(
            Authentication authentication,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "month", required = false) Integer month) {
        if ((year == null) != (month == null)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Year and month must be provided together");
        }

        User user = getAuthenticatedUser(authentication);

        if (year == null) {
            return ResponseEntity.ok(workoutService.getAllWorkouts(user));
        }

        return ResponseEntity.ok(workoutService.getMonthlyWorkouts(year, month, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponse> getWorkoutById(@PathVariable Long id, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return workoutService.getWorkoutById(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        workoutService.deleteWorkout(id, user);

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(Authentication authentication) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResponse> updateWorkout(@PathVariable Long id,
            @Valid @RequestBody CreateWorkoutRequest request, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        WorkoutResponse updatedWorkout = workoutService.updateWorkout(id, request, user);

        return ResponseEntity.ok(updatedWorkout);
    }

    @GetMapping("/summary")
    public ResponseEntity<MonthlyWorkoutSummaryResponse> getMonthlySummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        MonthlyWorkoutSummaryResponse summary = workoutService.getMonthlySummary(year, month, user);

        return ResponseEntity.ok(summary);
    }
}