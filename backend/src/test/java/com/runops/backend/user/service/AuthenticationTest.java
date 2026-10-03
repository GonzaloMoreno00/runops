package com.runops.backend.user.service;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.runops.backend.user.model.Role;
import com.runops.backend.user.model.User;
import com.runops.backend.user.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationTest {

    private UserRepository userRepository;
    private ProviderManager authenticationManager;

    @BeforeEach
    void setUp() {

        // Mock the database repository.
        userRepository = mock(UserRepository.class);

        // Use a real BCrypt encoder.
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        // Connect our repository with Spring Security.
        CustomUserDetailsService userDetailsService =
                new CustomUserDetailsService(userRepository);

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        authenticationManager = new ProviderManager(provider);

        // Create a test user with a real password hash.
        User user = new User(
                "Gonzalo",
                "gonzalo@example.com",
                passwordEncoder.encode("ExamplePassword123!"),
                Role.USER
        );

        when(userRepository.findByEmail("gonzalo@example.com"))
                .thenReturn(Optional.of(user));
    }

    @Test
    void shouldAuthenticateWithValidCredentials() {

        // Act
        Authentication result = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        "gonzalo@example.com",
                        "ExamplePassword123!"
                )
        );

        // Assert
        assertTrue(result.isAuthenticated());
        assertEquals("gonzalo@example.com", result.getName());
    }

    @Test
    void shouldRejectIncorrectPassword() {

        assertThrows(
                BadCredentialsException.class,
                () -> authenticationManager.authenticate(
                        UsernamePasswordAuthenticationToken.unauthenticated(
                                "gonzalo@example.com",
                                "IncorrectPassword123!"
                        )
                )
        );
    }

    @Test
    void shouldRejectUnknownEmail() {

        assertThrows(
                BadCredentialsException.class,
                () -> authenticationManager.authenticate(
                        UsernamePasswordAuthenticationToken.unauthenticated(
                                "unknown@example.com",
                                "ExamplePassword123!"
                        )
                )
        );
    }
}
