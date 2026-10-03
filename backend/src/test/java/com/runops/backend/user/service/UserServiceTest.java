
package com.runops.backend.user.service;

import com.runops.backend.user.dto.RegisterRequest;
import com.runops.backend.user.dto.UserResponse;
import com.runops.backend.user.model.Role;
import com.runops.backend.user.model.User;
import com.runops.backend.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        userService = new UserService(
            userRepository,
            passwordEncoder
        );
    }

    @Test
    void shouldRegisterUserSuccessfully() {

        // Arrange
        RegisterRequest request = new RegisterRequest(
            "Gonzalo",
            "GONZALO@example.com",
            "ExamplePassword123!"
        );

        when(userRepository.existsByEmail("gonzalo@example.com"))
            .thenReturn(false);

        when(passwordEncoder.encode("ExamplePassword123!"))
            .thenReturn("hashed-password");

        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        UserResponse response = userService.register(request);

        // Assert
        assertEquals("Gonzalo", response.name());
        assertEquals("gonzalo@example.com", response.email());

        verify(passwordEncoder).encode("ExamplePassword123!");
        verify(userRepository).save(argThat(user ->
            user.getEmail().equals("gonzalo@example.com")
                && user.getPasswordHash().equals("hashed-password")
                && user.getRole() == Role.USER
        ));
    }

    @Test
    void shouldRejectDuplicateEmail() {

        // Arrange
        RegisterRequest request = new RegisterRequest(
            "Gonzalo",
            "gonzalo@example.com",
            "ExamplePassword123!"
        );

        when(userRepository.existsByEmail("gonzalo@example.com"))
            .thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> userService.register(request)
        );

        assertEquals(
            HttpStatus.CONFLICT,
            exception.getStatusCode()
        );

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
}
