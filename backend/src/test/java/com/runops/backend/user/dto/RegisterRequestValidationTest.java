package com.runops.backend.user.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RegisterRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void shouldAcceptValidRegistrationData() {

        RegisterRequest request = new RegisterRequest(
            "Gonzalo",
            "gonzalo@example.com",
            "ExamplePassword123!"
        );

        var violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldRejectBlankName() {

        RegisterRequest request = new RegisterRequest(
            "",
            "gonzalo@example.com",
            "ExamplePassword123!"
        );

        var violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectInvalidEmail() {

        RegisterRequest request = new RegisterRequest(
            "Gonzalo",
            "invalid-email",
            "ExamplePassword123!"
        );

        var violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectShortPassword() {

        RegisterRequest request = new RegisterRequest(
            "Gonzalo",
            "gonzalo@example.com",
            "1234"
        );

        var violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }
}
