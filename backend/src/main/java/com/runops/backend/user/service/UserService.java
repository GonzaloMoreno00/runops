package com.runops.backend.user.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.runops.backend.user.dto.RegisterRequest;
import com.runops.backend.user.dto.UserResponse;
import com.runops.backend.user.model.Role;
import com.runops.backend.user.model.User;
import com.runops.backend.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {

        // Normalize the email before checking and storing it.
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        // Reject registration if the email is already in use.
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered");
        }

        // Never store the original password.
        String passwordHash = passwordEncoder.encode(request.password());

        // Every registered account receives the USER role.
        User user = new User(
            request.name().trim(),
            email,
            passwordHash,
            Role.USER
        );

        // Persist the user in PostgreSQL.
        User savedUser = userRepository.save(user);

        // Return only public information.
        return new UserResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail()
        );
    }
}
