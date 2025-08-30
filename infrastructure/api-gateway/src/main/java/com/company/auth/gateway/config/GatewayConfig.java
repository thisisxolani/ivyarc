package com.company.auth.gateway.config;

import com.company.auth.gateway.filter.AuthenticationFilter;
import com.company.auth.gateway.filter.AuthorizationFilter;
import com.company.auth.gateway.filter.GlobalLoggingFilter;
import com.company.auth.gateway.filter.RateLimitKeyResolver;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;
    private final AuthorizationFilter authorizationFilter;
    private final GlobalLoggingFilter globalLoggingFilter;

    public GatewayConfig(AuthenticationFilter authenticationFilter,
                        AuthorizationFilter authorizationFilter,
                        GlobalLoggingFilter globalLoggingFilter) {
        this.authenticationFilter = authenticationFilter;
        this.authorizationFilter = authorizationFilter;
        this.globalLoggingFilter = globalLoggingFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Auth Service Routes - No authentication required
            .route("auth-login", r -> r
                .path("/api/v1/auth/login")
                .and().method("POST")
                .filters(f -> f
                    .filter(globalLoggingFilter)
                    .requestRateLimiter(c -> {
                        c.setRateLimiter(redisRateLimiter());
                        c.setKeyResolver(new RateLimitKeyResolver());
                    })
                    .circuitBreaker(c -> c
                        .setName("auth-service-cb")
                        .setFallbackUri("forward:/fallback/auth")))
                .uri("lb://auth-service"))
            
            .route("auth-register", r -> r
                .path("/api/v1/auth/register")
                .and().method("POST")
                .filters(f -> f
                    .filter(globalLoggingFilter)
                    .requestRateLimiter(c -> {
                        c.setRateLimiter(redisRateLimiter());
                        c.setKeyResolver(new RateLimitKeyResolver());
                    })
                    .circuitBreaker(c -> c
                        .setName("auth-service-cb")
                        .setFallbackUri("forward:/fallback/auth")))
                .uri("lb://auth-service"))
            
            .route("auth-refresh", r -> r
                .path("/api/v1/auth/refresh")
                .and().method("POST")
                .filters(f -> f
                    .filter(globalLoggingFilter)
                    .requestRateLimiter(c -> {
                        c.setRateLimiter(redisRateLimiter());
                        c.setKeyResolver(new RateLimitKeyResolver());
                    })
                    .circuitBreaker(c -> c
                        .setName("auth-service-cb")
                        .setFallbackUri("forward:/fallback/auth")))
                .uri("lb://auth-service"))

            // User Service Routes - Authentication required
            .route("user-service", r -> r
                .path("/api/v1/users/**")
                .filters(f -> f
                    .filter(globalLoggingFilter)
                    .filter(authenticationFilter)
                    .filter(authorizationFilter)
                    .requestRateLimiter(c -> {
                        c.setRateLimiter(redisRateLimiter());
                        c.setKeyResolver(new RateLimitKeyResolver());
                    })
                    .circuitBreaker(c -> c
                        .setName("user-service-cb")
                        .setFallbackUri("forward:/fallback/user")))
                .uri("lb://user-service"))

            // Authorization Service Routes - Admin only
            .route("authorization-service", r -> r
                .path("/api/v1/auth/roles/**", "/api/v1/auth/permissions/**")
                .filters(f -> f
                    .filter(globalLoggingFilter)
                    .filter(authenticationFilter)
                    .filter(authorizationFilter)
                    .requestRateLimiter(c -> {
                        c.setRateLimiter(redisRateLimiter());
                        c.setKeyResolver(new RateLimitKeyResolver());
                    })
                    .circuitBreaker(c -> c
                        .setName("authorization-service-cb")
                        .setFallbackUri("forward:/fallback/authorization")))
                .uri("lb://authorization-service"))

            // Audit Service Routes - Audit permission required
            .route("audit-service", r -> r
                .path("/api/v1/audit/**")
                .filters(f -> f
                    .filter(globalLoggingFilter)
                    .filter(authenticationFilter)
                    .filter(authorizationFilter)
                    .requestRateLimiter(c -> {
                        c.setRateLimiter(redisRateLimiter());
                        c.setKeyResolver(new RateLimitKeyResolver());
                    })
                    .circuitBreaker(c -> c
                        .setName("audit-service-cb")
                        .setFallbackUri("forward:/fallback/audit")))
                .uri("lb://audit-service"))
            .build();
    }

    @Bean
    public org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter redisRateLimiter() {
        return new org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter(
            10, // replenishRate
            20, // burstCapacity
            1   // requestedTokens
        );
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",
            "http://localhost:3001", 
            "https://*.company.com"
        ));
        corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfiguration.setAllowedHeaders(List.of("*"));
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setMaxAge(Duration.ofHours(1));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsWebFilter(source);
    }
}