package com.runops.backend.workout.controller;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.runops.backend.user.model.Role;
import com.runops.backend.user.model.User;
import com.runops.backend.user.repository.UserRepository;
import com.runops.backend.workout.model.Workout;
import com.runops.backend.workout.repository.WorkoutRepository;
import com.runops.backend.workout.service.WorkoutService;

// Real controller, service and JPA queries; isolated, in-memory test database.
// Authentication is supplied explicitly: this class does not test security filters.
@DataJpaTest(showSql = false)
@ActiveProfiles("test")
@Import(WorkoutService.class)
class WorkoutMonthlyHistoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutService workoutService;

    private MockMvc mvc;
    private User owner;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        owner = userRepository.save(new User("Runner", "runner@example.com", "test-hash", Role.USER));
        authentication = UsernamePasswordAuthenticationToken.authenticated(
                owner.getEmail(), null, java.util.List.of());
        mvc = MockMvcBuilders.standaloneSetup(
                new WorkoutController(workoutService, userRepository)).build();
    }

    @Test
    void shouldFilterByMonthAndOwnerAndOrderByDateThenIdDescending() throws Exception {
        User otherUser = userRepository.save(
                new User("Other", "other@example.com", "test-hash", Role.USER));

        saveWorkout(owner, "2026-09-30", "previous month");
        saveWorkout(owner, "2026-10-01", "first day");
        saveWorkout(owner, "2026-10-31", "last day older id");
        saveWorkout(owner, "2026-10-31", "last day newer id");
        saveWorkout(owner, "2026-11-01", "next month");
        saveWorkout(otherUser, "2026-10-31", "another user");
        workoutRepository.flush();

        mvc.perform(get("/api/workouts")
                        .principal(authentication)
                        .param("year", "2026").param("month", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].notes", contains(
                        "last day newer id", "last day older id", "first day")));
    }

    @Test
    void shouldReturnAllMonthsForOwnerWhenNoFilterIsProvided() throws Exception {
        User otherUser = userRepository.save(
                new User("Other", "other@example.com", "test-hash", Role.USER));
        saveWorkout(owner, "2026-09-30", "September");
        saveWorkout(owner, "2026-10-01", "October");
        saveWorkout(otherUser, "2026-10-01", "another user");
        workoutRepository.flush();

        mvc.perform(get("/api/workouts").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].notes", contains("October", "September")));
    }

    @Test
    void shouldRejectIncompleteOrInvalidPeriods() throws Exception {
        String[] invalidQueries = {
                "?year=2026",
                "?month=10",
                "?year=2026&month=13",
                "?year=0&month=10"
        };

        for (String query : invalidQueries) {
            mvc.perform(get("/api/workouts" + query).principal(authentication))
                    .andExpect(status().isBadRequest());
        }
    }

    private void saveWorkout(User user, String date, String notes) {
        workoutRepository.save(new Workout(
                user, LocalDate.parse(date), 5.0, 1500, 300, notes));
    }
}
