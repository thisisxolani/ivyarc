package com.company.auth.authservice.config;

import com.company.auth.authservice.security.JwtAuthenticationEntryPoint;
import com.company.auth.authservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {



    // AuthenticationManager bean not exposed; inject AuthenticationConfiguration where needed to avoid early graph construction

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @org.springframework.context.annotation.Profile("!test")
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register", 
                                "/api/v1/auth/refresh", "/api/v1/auth/forgot-password", 
                                "/api/v1/auth/reset-password").permitAll()
                        
                        // Health check and monitoring endpoints
                        .requestMatchers("/actuator/health", "/actuator/health/**", 
                                "/actuator/info", "/actuator/prometheus").permitAll()
                        
                        // OpenAPI documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", 
                                "/swagger-ui.html", "/swagger-resources/**", 
                                "/webjars/**").permitAll()
                        
                        // Eureka registration (if needed)
                        .requestMatchers("/eureka/**").permitAll()
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    @org.springframework.context.annotation.Profile("test")
    public SecurityFilterChain filterChainTest(
            HttpSecurity http,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register", 
                                "/api/v1/auth/refresh", "/api/v1/auth/forgot-password", 
                                "/api/v1/auth/reset-password").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**", 
                                "/actuator/info", "/actuator/prometheus").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", 
                                "/swagger-ui.html", "/swagger-resources/**", 
                                "/webjars/**").permitAll()
                        .requestMatchers("/eureka/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
