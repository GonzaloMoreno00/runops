package com.runops.backend.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SpaSecurityTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void shouldForwardAngularRoutesWithoutAuthentication() throws Exception {
        for (String route : new String[]{"/login", "/register", "/dashboard"}) {
            mvc.perform(get(route))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/index.html"));
        }
    }

    @Test
    void shouldKeepApiProtectedWithoutForwardingToAngular() throws Exception {
        for (String route : new String[]{"/api/workouts", "/api/workouts/summary", "/api/auth/me", "/api/unknown"}) {
            mvc.perform(get(route))
                    .andExpect(status().isUnauthorized())
                    .andExpect(forwardedUrl(null));
        }
    }
}
