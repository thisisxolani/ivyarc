package com.company.auth.gateway.filter;

import com.company.auth.gateway.service.JwtService;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter implements GatewayFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    // Public endpoints that don't require authentication
    private final List<String> publicEndpoints = List.of(
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/refresh",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/actuator/health",
        "/actuator/info"
    );

    public AuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            logger.debug("Skipping authentication for public endpoint: {}", path);
            return chain.filter(exchange);
        }

        String authorizationHeader = request.getHeaders().getFirst(AUTHORIZATION_HEADER);
        
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            logger.warn("Missing or invalid Authorization header for path: {}", path);
            return handleUnauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());

        try {
            Claims claims = jwtService.validateToken(token);
            
            if (claims == null) {
                logger.warn("Invalid JWT token for path: {}", path);
                return handleUnauthorized(exchange, "Invalid JWT token");
            }

            // Add user information to request headers for downstream services
            ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Email", claims.get("email", String.class))
                .header("X-User-Roles", String.join(",", 
                    (List<String>) claims.get("authorities", List.class)))
                .header("X-Session-Id", claims.get("session_id", String.class))
                .build();

            ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

            logger.debug("Authentication successful for user: {} on path: {}", 
                claims.getSubject(), path);

            return chain.filter(modifiedExchange);

        } catch (Exception e) {
            logger.error("Authentication failed for path: {} - Error: {}", path, e.getMessage());
            return handleUnauthorized(exchange, "Authentication failed: " + e.getMessage());
        }
    }

    private boolean isPublicEndpoint(String path) {
        return publicEndpoints.stream()
            .anyMatch(pattern -> path.matches(pattern.replace("**", ".*")));
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = String.format(
            "{\"error\":\"Unauthorized\",\"message\":\"%s\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
            message,
            java.time.Instant.now().toString(),
            exchange.getRequest().getPath().value()
        );

        return response.writeWith(
            Mono.just(response.bufferFactory().wrap(body.getBytes()))
        );
    }
}