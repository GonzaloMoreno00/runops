package com.runops.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository)
            throws Exception {

        http
            .cors(Customizer.withDefaults())

            // Keep CSRF enabled for session-based authentication.
            // Existing registration remains compatible with its previous API.
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/auth/register")
            )

            .securityContext(context -> context
                .securityContextRepository(securityContextRepository)
            )

            .authorizeHttpRequests(auth -> auth

                // Public authentication endpoints.
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/csrf",
                    "/error"
                ).permitAll()

                // Workouts remain public temporarily.
                // Ownership restrictions belong to the next issue.
                .requestMatchers(
                    "/api/workouts",
                    "/api/workouts/**"
                ).permitAll()

                // All remaining endpoints require authentication.
                .anyRequest().authenticated()
            )

            // We use our own JSON login instead of Spring's HTML form.
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // Return 401 instead of redirecting to an HTML login page.
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(
                    (request, response, exception) ->
                        response.sendError(HttpStatus.UNAUTHORIZED.value())
                )
            )

            // Spring Security handles session invalidation and cleanup.
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler(
                    (request, response, authentication) ->
                        response.setStatus(HttpStatus.NO_CONTENT.value())
                )
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
            List.of("GET", "POST", "OPTIONS")
        );

        configuration.setAllowedHeaders(
            List.of("Content-Type", "X-CSRF-TOKEN")
        );

        // Allow the browser to send the session cookie.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
